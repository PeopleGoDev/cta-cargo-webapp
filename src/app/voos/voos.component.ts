import { Component, OnInit, ViewChild } from '@angular/core';
import { PortoIATAResponseDto } from 'app/shared/model/dto/portoiatadto';
import { StatusVoo } from 'app/shared/model/statusvoo';
import { confirm } from 'devextreme/ui/dialog';
import { StatusService } from 'app/shared/services/status.service';
import notify from 'devextreme/ui/notify';
import { VooClient, VooInsertRequestDto, VooListarInputDto, VooResponseDto, VooTrechoResponse, VooUpdateRequestDto } from 'app/shared/proxy/ctaapi';
import { environment } from 'environments/environment';
import { DxDataGridComponent } from 'devextreme-angular';
import { FlightType } from 'app/shared/collections/data';

@Component({
  selector: 'app-voos',
  templateUrl: './voos.component.html',
  styleUrls: ['./voos.component.css']
})

export class VoosComponent implements OnInit {
  @ViewChild("dataGrid") dataGrid: DxDataGridComponent;
  @ViewChild("formGrid") formGrid: any;
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
  currentRow: number;
  isDrawerOpen: boolean = false;
  cloneFlight: any = {};
  flightType = FlightType;

  private editDataSaidaReal: Date;
  private editDataChegadaEstimada: Date;
  private editDataChegadaReal: Date;
  private editDataSaidaEstimada: Date;

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

  constructor(private statusService: StatusService,
    private vooClient: VooClient) {
    this.statusData = this.statusService.getStatus();
    this.statusRFB = this.statusService.getStatusRFB();
    this.onEditCancel = this.onEditCancel.bind(this);
    this.onEditSave = this.onEditSave.bind(this);
    this.onEditDelete = this.onEditDelete.bind(this);
    this.onRowDelete = this.onRowDelete.bind(this);
    this.onResendFlight = this.onResendFlight.bind(this);
    this.validateActualArrivalDateField = this.validateActualArrivalDateField.bind(this);
    this.validateEstimatedDepartureDateField = this.validateEstimatedDepartureDateField.bind(this);
    this.validateEstimateArrivalDateField = this.validateEstimateArrivalDateField.bind(this);
    this.onDataSaidaEstimadaChanged = this.onDataSaidaEstimadaChanged.bind(this);
    this.validateEstimateArrivalDateCompare = this.validateEstimateArrivalDateCompare.bind(this);
    this.validateEstimatedDepartureDateCompare = this.validateEstimatedDepartureDateCompare.bind(this);
  }

  ngOnInit(): void {
    this.botaoModo = "Inserir";
    this.filtroDataFinal = new Date();
    this.filtroDataInicial = new Date();
    this.filtroDataInicial.setDate(this.filtroDataFinal.getDate() - 7);
    this.refreshGrid();
  }

  async onRowUpdating(e) {

    e.cancel = true;

    const newData: VooResponseDto = Object.assign(e.oldData, e.newData)

    newData.Trechos = newData.Trechos
      .filter(x => x.AeroportoDestinoCodigo.trim().length === 3)
      .map(x => {
        return {
          AeroportoDestinoCodigo: x.AeroportoDestinoCodigo.toUpperCase(),
          DataHoraChegadaEstimada: x.DataHoraChegadaEstimada,
          DataHoraSaidaEstimada: x.DataHoraSaidaEstimada,
          Id: x.Id
        } as VooTrechoResponse
      });

    if (newData.DataHoraSaidaReal instanceof Date) {
      const date: any = this.getUTC(newData.DataHoraSaidaReal);
      newData.DataHoraSaidaReal = date.toISOString().substring(0, 19);
    }

    if (newData.DataHoraSaidaPrevista instanceof Date) {
      const date: any = this.getUTC(newData.DataHoraSaidaPrevista);
      newData.DataHoraSaidaPrevista = date.toISOString().substring(0, 19);
    }

    const updateRequest: VooUpdateRequestDto = {
      VooId: newData.VooId,
      Numero: newData.Numero,
      PrefixoAeronave: newData.PrefixoAeronave,
      DataVoo: newData.DataVoo,
      DataHoraSaidaReal: newData.DataHoraSaidaReal,
      DataHoraSaidaPrevista: newData.DataHoraSaidaPrevista,
      AeroportoOrigemCodigo: newData.AeroportoOrigemCodigo.toLocaleUpperCase(),
      Trechos: newData.Trechos
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

    newData.Trechos = newData.Trechos
      .filter(x => x.AeroportoDestinoCodigo.trim().length === 3)
      .map(x => {
        return {
          AeroportoDestinoCodigo: x.AeroportoDestinoCodigo.toUpperCase(),
          DataHoraChegadaEstimada: x.DataHoraChegadaEstimada,
          DataHoraSaidaEstimada: x.DataHoraSaidaEstimada,
          Id: x.Id
        } as VooTrechoResponse
      });

    if (newData.DataHoraSaidaReal instanceof Date) {
      const date: any = this.getUTC(newData.DataHoraSaidaReal);
      newData.DataHoraSaidaReal = date.toISOString().substring(0, 19);
    }

    if (newData.DataHoraSaidaPrevista instanceof Date) {
      const date: any = this.getUTC(newData.DataHoraSaidaPrevista);
      newData.DataHoraSaidaPrevista = date.toISOString().substring(0, 19);
    }

    const insertRequest: VooInsertRequestDto = {
      Numero: newData.Numero.toUpperCase(),
      FlightType: newData.FlightType,
      PrefixoAeronave: newData.PrefixoAeronave.toUpperCase(),
      DataVoo: newData.DataVoo,
      DataHoraSaidaReal: newData.DataHoraSaidaReal,
      DataHoraSaidaPrevista: newData.DataHoraSaidaPrevista,
      AeroportoOrigemCodigo: newData.AeroportoOrigemCodigo.toUpperCase(),
      Trechos: newData.Trechos
    };

    this.vooClient.inserirVoo(insertRequest)
      .subscribe(res => {
        if (res.result.Sucesso) {
          this.voosData.push(res.result.Dados);
          this.dataGrid.instance.cancelEditData();
        }
        else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', 3000);
        }
      }, err => {
        notify(err, 'error', 3000);
      });
  }

  async onRowDelete() {
    this.vooClient.excluirVoo(this.curgridKey)
      .subscribe(res => {
        if (res.result.Sucesso) {
          let item = this.voosData.find(x => x.VooId == this.curgridKey);
          var index = this.voosData.indexOf(item);
          this.voosData.splice(index, 1);
          this.dataGrid.instance.cancelEditData();
        }
        else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', 3000);
          this.dataGrid.instance.cancelEditData();
        }
      }, err => {
        notify(err, 'error', 3000);
      });
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
    const date1: Date = this.getUTC(this.filtroDataInicial);
    const date2: Date = this.getUTC(this.filtroDataFinal);
    const initialDate: any = date1.toISOString().substring(0, 10);
    const finalDate: any = date2.toISOString().substring(0, 10);

    let input: VooListarInputDto = {
      DataInicial: initialDate,
      DataFinal: finalDate,
    };

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
    return (e.row.data.SituacaoRFBId === 0 || e.row.data.SituacaoRFBId === 3 || e.row.data.Reenviar);
  }

  isViewVisible(e) {
    return ((e.row.data.SituacaoRFBId === 1 || e.row.data.SituacaoRFBId === 2 || e.row.data.SituacaoRFBId === 4) && !e.row.data.Reenviar);
  }

  onClickCertificado() {
    // implement here
  }

  onEditorPreparing(e: any): void {
    this.somenteLeitura = false;

    if (e.parentType == "dataRow") {
      this.currentRow = e.row.rowIndex;
    }

    if (e.row.data) {
      this.editDataSaidaReal = e.row.data.DataHoraSaidaReal ? new Date(e.row.data.DataHoraSaidaReal) : undefined;
      this.editDataChegadaEstimada = e.row.data.DataHoraChegadaEstimada ? new Date(e.row.data.DataHoraChegadaEstimada) : undefined;
      this.editDataChegadaReal = e.row.data.DataHoraChegadaReal ? new Date(e.row.data.DataHoraChegadaReal) : undefined;
      this.editDataSaidaEstimada = e.row.data.DataHoraSaidaEstimada ? new Date(e.row.data.DataHoraSaidaEstimada) : undefined;
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
      if (e.parentType == "dataRow" && (e.row.data.SituacaoRFBId === 1 || e.row.data.SituacaoRFBId === 2 || e.row.data.SituacaoRFBId === 4) && !e.row.data.Reenviar) {
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
    let gridInstance = this.dataGrid.instance as any;
    gridInstance.getController("validating").validate(true)
      .then((r) => {
        // gridInstance.refresh();
      });

    this.dataGrid.instance.saveEditData().then(() => {
      if (!this.dataGrid.instance.hasEditData()) {
        // Saved successfully
      } else {
        console.log('Nada para salvar!');
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

  validateEstimatedDepartureDateField(e) {
    if (this.editDataChegadaReal)
      return e.value > this.editDataSaidaReal;

    if (this.editDataChegadaEstimada)
      return e.value > this.editDataChegadaEstimada;

    return false;
  }

  validateEstimateArrivalDateField(e) {
    if (this.editDataSaidaReal)
      return e.value > this.editDataSaidaReal;

    return false;
  };

  validateEstimateArrivalDateCompare() {
    return this.editDataSaidaReal;
  };

  validateEstimatedDepartureDateCompare() {
    if (this.editDataChegadaReal)
      return this.editDataChegadaReal;

    return this.editDataChegadaEstimada;
  };

  validateActualArrivalDateField(e) {
    if (!(e.value)) return true;

    return e.value > this.editDataSaidaReal;
  }

  onDataSaidaEstimadaChanged(e, cell) {

    cell.setValue(e.value);

    switch (cell.column.dataField) {
      case "DataHoraSaidaReal":
        this.editDataSaidaReal = e.value;
        break;
      case "DataHoraChegadaEstimada":
        this.editDataChegadaEstimada = e.value;
        break;
      case "DataHoraChegadaReal":
        this.editDataChegadaReal = e.value;
        break;
      case "DataHoraSaidaEstimada":
        this.editDataSaidaEstimada = e.value;
        break;
    }
  }

  addHours(date, hours) {
    if (!date)
      return undefined;

    const dateCopy = new Date(date);
    dateCopy.setHours(dateCopy.getHours() + hours);
    return dateCopy;
  }

  onTrechoChange(e: any, cell) {
    cell.setValue(e);
  }

  private getUTC(date: Date) {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  }

  cloneSegmentHandler(e, voo) {
    console.log(e);
    console.log(voo);
    this.cloneFlight.airportCode = e.data.AeroportoDestinoCodigo;
    this.cloneFlight.scheduleDeparture = e.data.DataHoraSaidaEstimada;
    this.isDrawerOpen = true;
  }
}