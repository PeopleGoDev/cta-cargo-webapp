import { Component, OnInit, ViewChild } from '@angular/core';
import { VooInsertRequestDto } from 'app/shared/model/dto/voodto';
import { LocalStorageService } from 'app/shared/services/localstorage.service';
import { VoosService } from 'app/shared/services/voos.service';
import { PortoIATAResponseDto } from 'app/shared/model/dto/portoiatadto';
import { StatusVoo } from 'app/shared/model/statusvoo';
import { confirm } from 'devextreme/ui/dialog';
import { StatusService } from 'app/shared/services/status.service';
import notify from 'devextreme/ui/notify';
import { UsuarioInfoResponse, VooClient, VooListarInputDto, VooResponseDto, VooUpdateRequestDto } from 'app/shared/proxy/ctaapi';
import { environment } from 'environments/environment';
import { DxDataGridComponent } from 'devextreme-angular';

@Component({
  selector: 'app-voos',
  templateUrl: './voos.component.html',
  styleUrls: ['./voos.component.css']
})

export class VoosComponent implements OnInit {
  @ViewChild("dataGrid") dataGrid: DxDataGridComponent;
  botaoModo: string;
  filtroDataInicial: Date;
  filtroDataFinal: Date;
  portosData: Array<PortoIATAResponseDto>;
  voosData: VooResponseDto[] = [];
  newrowBotao: boolean = false;
  statusData: Array<StatusVoo>;
  statusRFB: Array<StatusVoo>;
  somenteLeitura: boolean = true;
  curgridKey: number = 0;
  private usuarioInfo: UsuarioInfoResponse;
  currentRow: number;

  buttonOptionsExcluir = {
    text: "Excluir",
    type: "danger",
    onClick: function (e) {
      let result = confirm("<i>Confirma Exclusão do Voo ?</i>", "Confirma?");
      result.then((dialogResult) => {
        if (dialogResult) {
          this.onRowDelete();
        }
      });
    }
  };

  constructor(private voosService: VoosService,
    private localstorage: LocalStorageService,
    private statusService: StatusService,
    private vooClient: VooClient) {
    this.statusData = this.statusService.getStatus();
    this.statusRFB = this.statusService.getStatusRFB();
    this.onEditCancel = this.onEditCancel.bind(this);
    this.onEditSave = this.onEditSave.bind(this);
    this.onEditDelete = this.onEditDelete.bind(this);
    this.onRowDelete = this.onRowDelete.bind(this);
    this.onResendFlight = this.onResendFlight.bind(this);
    this.onDataChegadaEstimadaValidation = this.onDataChegadaEstimadaValidation.bind(this);
    this.onDataChegadaRealValidation = this.onDataChegadaRealValidation.bind(this);
  }

  ngOnInit(): void {
    this.botaoModo = "Inserir";
    this.filtroDataFinal = new Date();
    this.filtroDataInicial = new Date();
    this.filtroDataInicial.setDate(this.filtroDataFinal.getDate() - 7);
    this.usuarioInfo = this.localstorage.getLocalStore().UsuarioInfo;
    this.refreshGrid();
  }

  async onRowUpdating(e) {

    e.cancel = true;

    const newData: VooResponseDto = Object.assign(e.oldData, e.newData)

    const updateRequest: VooUpdateRequestDto = {
      VooId: newData.VooId,
      DataVoo: newData.DataVoo,
      UsuarioModificadorId: this.usuarioInfo.UsuarioId,
      DataHoraSaidaEstimada: newData.DataHoraSaidaEstimada,
      DataHoraSaidaReal: newData.DataHoraSaidaReal,
      DataHoraChegadaEstimada: newData.DataHoraChegadaEstimada,
      DataHoraChegadaReal: newData.DataHoraChegadaReal,
      AeroportoOrigemCodigo: newData.AeroportoOrigemCodigo.toLocaleUpperCase(),
      AeroportoDestinoCodigo: newData.AeroportoDestinoCodigo.toLocaleUpperCase(),
    };

    this.vooClient.atualizarVoo(updateRequest)
      .toPromise()
      .then(res => {
        if (res.result.Sucesso) {
          for (var i in this.voosData) {
            if (this.voosData[i].VooId == newData.VooId) {
              this.voosData[i] = res.result.Dados;
              break;
            }
          }
          this.dataGrid.instance.cancelEditData();
        }
        else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', 3000);
        }
      })
  }

  async onRowInserting(e) {
    e.cancel = true;

    const newData: VooResponseDto = e.data;

    const insertRequest: VooInsertRequestDto = new VooInsertRequestDto(
      +this.usuarioInfo.EmpresaId,
      newData.Numero.toUpperCase(),
      newData.DataVoo,
      +this.usuarioInfo.UsuarioId,
      newData.DataHoraSaidaEstimada,
      newData.DataHoraSaidaReal,
      newData.DataHoraChegadaEstimada,
      newData.DataHoraChegadaReal,
      newData.PesoBruto,
      newData.PesoBrutoUnidade,
      newData.Volume,
      newData.VolumeUnidade,
      newData.TotalPacotes,
      newData.TotalPecas
    );
    insertRequest.AeroportoOrigemCodigo = newData.AeroportoOrigemCodigo.toUpperCase();
    insertRequest.AeroportoDestinoCodigo = newData.AeroportoDestinoCodigo.toUpperCase();

    let res = await this.voosService.Inserir(insertRequest);

    if (res.Sucesso) {
      // Atualiza o item da lista de Cia Aéreas
      this.voosData.push(res.Dados);
      this.dataGrid.instance.cancelEditData();
    }
    else {
      notify(res.Notificacoes[0].Mensagem, 'error', 3000);
    }
  }

  async onRowDelete() {

    let res = await this.voosService.Excluir(this.curgridKey);

    if (res.Sucesso) {
      let item = this.voosData.find(x => x.VooId == this.curgridKey);
      var index = this.voosData.indexOf(item);
      this.voosData.splice(index, 1);
      this.dataGrid.instance.cancelEditData();
    }
    else {
      notify(res.Notificacoes[0].Mensagem, 'error', 3000);
      this.dataGrid.instance.cancelEditData();
    }
  }

  onToolbarPreparing(e) {
    e.toolbarOptions.items.unshift({
      location: 'before',
      template: 'dataInicalTemplate'
    }, {
      location: 'before',
      widget: 'dxDateBox',
      options: {
        width: 120,
        type: 'date',
        value: this.filtroDataInicial,
        onValueChanged: this.handleValueDataInicialChange.bind(this)
      }
    }, {
      location: 'before',
      template: 'dataFinalTemplate'
    }, {
      location: 'before',
      widget: 'dxDateBox',
      options: {
        width: 120,
        type: 'date',
        value: this.filtroDataFinal,
        onValueChanged: this.handleValueDataFinalChange.bind(this)
      }
    }, {
      location: 'before',
      widget: 'dxButton',
      options: {
        width: 136,
        text: 'Filtrar',
        onClick: this.refreshGrid.bind(this)
      }
    }, {
      location: 'after',
      widget: 'dxButton',
      options: {
        icon: "refresh",
        onClick: this.refreshGrid.bind(this)
      }
    });
  }

  refreshGrid() {

    let input: VooListarInputDto = {
      DataInicial: this.filtroDataInicial,
      DataFinal: this.filtroDataFinal,
    }

    this.vooClient.listarVoos(input)
      .toPromise()
      .then(res => {
        if (res.result.Sucesso) {
          this.voosData = res.result.Dados;
        }
        else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
        }
      })
      .catch(err => {
        notify(err, 'error', environment.ErrorTimeout);
      });
  }

  handleValueDataInicialChange(e) {
    this.filtroDataInicial = e.value;
  }

  handleValueDataFinalChange(e) {
    this.filtroDataFinal = e.value;
  }

  isEditVisible(e) {
    return !(e.row.data.StatusId == 2);
  }

  isViewVisible(e) {
    return (e.row.data.StatusId == 2);
  }

  onClickCertificado() {
    // implement here
  }

  onEditorPreparing(e: any): void {

    this.somenteLeitura = false;
    if (e.parentType == "dataRow") {
      this.currentRow = e.row.rowIndex;  
   }

    if (e.row?.isNewRow) {
      if (e.dataField == "Numero" && e.parentType == "dataRow") {
        e.editorOptions.readOnly = false;
        this.newrowBotao = !e.row?.isNewRow;
        return;
      }
    }
    else {
      this.curgridKey = e.row.key;
      if (e.parentType == "dataRow" && e.row.data.StatusId == 2) {
        this.somenteLeitura = true;
        e.editorOptions.readOnly = true;
        return;
      }

      if (e.dataField == "Numero" && e.parentType == "dataRow") {
        e.editorOptions.readOnly = true;
        this.newrowBotao = true;
        return;
      }
    }
  }

  onRowPrepared(e: any) {
    if (e.rowType == 'data') {
      if (e.data.SituacaoRFBId == 3)
        e.rowElement.style.color = 'red';
    }
  }

  onEditCancel(e: any) {
    this.dataGrid.instance.cancelEditData();
  }

  onEditSave(e: any) {

    this.dataGrid.instance.saveEditData().then(() => {
      if (!this.dataGrid.instance.hasEditData()) {
        // Saved successfully
      } else {
        // Saving failed
      }
    });
  }

  onEditDelete(e: any) {

    let result = confirm("<i>Confirma Exclusão do Voo ?</i>", "Confirma?");

    result.then((dialogResult) => {
      if (dialogResult) {
        this.onRowDelete();
        this.dataGrid.instance.cancelEditData();
      }
    });

  }

  onResendFlight(e: any) {

    let result = confirm("Confirma Reenvio do Voo ?", "Confirma?");
    result.then((dialogResult) => {
      if (dialogResult) {

        this.vooClient.atualizarReenviarVoo(this.curgridKey)
          .subscribe(res => {
            if (res.result && res.result.Sucesso) {
              for (var i in this.voosData) {
                if (this.voosData[i].VooId == res.result.Dados.VooId) {
                  this.voosData[i] = res.result.Dados;
                  break;
                }
              }
              this.dataGrid.instance.cancelEditData();
            }
          });
      }
    });

  }

  onDataChegadaEstimadaValidation() {
    return this.dataGrid.instance.cellValue(this.currentRow, 3);
  }

  onDataChegadaRealValidation() {
    return this.dataGrid.instance.cellValue(this.currentRow, 4);
  }

  onDataSaidaEstimadaChanged(e, cell) {
    cell.setValue(e.value);
  }

}