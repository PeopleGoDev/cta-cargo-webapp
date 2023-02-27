import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LocalStorageService } from 'app/shared/services/localstorage.service';
import { VoosService } from 'app/shared/services/voos.service';
import notify from 'devextreme/ui/notify';
import { cpf, cnpj } from 'cpf-cnpj-validator';
import { PortoIATAResponseDto } from 'app/shared/model/dto/portoiatadto';
import { ConsolidadoDiretoService } from 'app/shared/services/consolidadodireto.service';
import { environment } from 'environments/environment';
import { confirm } from 'devextreme/ui/dialog';
import { StatusService } from 'app/shared/services/status.service';
import { StatusVoo } from 'app/shared/model/statusvoo';
import { AtualizarMasterReenviarRequest, ExcluirMastersByIdRequest, MasterClient, MasterInsertRequestDto, MasterListarRequest, MasterResponseDto, MasterUpdateRequestDto, MasterUpdateTotalParcialRequestDto, UsuarioInfoResponse, VooClient, VooListaResponseDto, VooListarInputDto } from 'app/shared/proxy/ctaapi';
import { LocalRecordStatus, LocalSituacaoRfb } from 'app/shared/enum/api.enum';
import { DxDataGridComponent } from 'devextreme-angular';
import { DxiBreakComponent } from 'devextreme-angular/ui/nested';

@Component({
  selector: 'app-masters',
  templateUrl: './masters.component.html',
  styleUrls: ['./masters.component.css']
})

export class MastersComponent implements OnInit {
  @ViewChild("dataGrid") dataGrid: DxDataGridComponent;
  @ViewChild("panel1") panel1Element: ElementRef;
  @ViewChild("panel2") panel2Element: ElementRef;
  @ViewChild("panel3") panel3Element: ElementRef;
  curVoo: number = -1;
  filtroData: Date;
  filtroDataFinal: Date;
  filtroDataVoo: Date;
  mastersData: MasterResponseDto[] = [];
  vooData: VooListaResponseDto[] = [];
  portosData: Array<PortoIATAResponseDto>;
  selectComponent: any;
  voosElement = null;
  curgridKey: number = 0;
  curTipoMaster: string = "";
  editarSomenteLeitura: boolean = false;
  reeviarVoo: boolean = false;
  // Data Sources
  vooStore: any;
  statusData: Array<StatusVoo>;
  statusRFB: Array<StatusVoo>;
  pesoUnidade: any = [];
  botoesGBItems: any = [];
  listaOpcoes: any = [];
  listaNCM: any = [];
  consolidadoDiretoData: any = [];
  curListaOpcoes: number;
  textoMaster: string;
  // Icones
  selectFiltro: any;
  uploadIcon: any;
  refreshIcon: any;
  plusIcon: any;
  excelIcon: any;
  NCMData: string[];
  selectedRows: number[] = [];
  rfbProcessedRows: number[] = [];
  rfbNonProcessedRows: number[] = [];
  // Privados

  private usuarioInfo: UsuarioInfoResponse;

  constructor(private localstorageService: LocalStorageService,
    private consolidadoDiretoService: ConsolidadoDiretoService,
    private statusService: StatusService,
    private masterClient: MasterClient,
    private vooClient: VooClient) {

    this.listaOpcoes = [{
      "Id": 0,
      "Descricao": 'Voo'
    }, {
      "Id": 1,
      "Descricao": 'Intervalo de Data'
    }, {
      "Id": 2,
      "Descricao": 'Número'
    }];

    this.curListaOpcoes = 0;
    this.selectFiltro = {
      width: 220,
      value: this.curListaOpcoes,
      dataSource: this.listaOpcoes,
      displayExpr: 'Descricao',
      valueExpr: 'Id',
      onValueChanged: this.handleSelectBoxChanged.bind(this)
    };
    this.statusData = this.statusService.getStatus();
    this.statusRFB = this.statusService.getStatusRFB();

    this.pesoUnidade = [{
      "Codigo": "KGM"
    }, {
      "Codigo": "LBS"
    }];

    this.refreshListaVoos = this.refreshListaVoos.bind(this);
    this.permitirEdicao = this.permitirEdicao.bind(this);
    this.isEditVisible = this.isEditVisible.bind(this);
    this.onRowDelete = this.onRowDelete.bind(this);
    this.onEditSave = this.onEditSave.bind(this);
    this.onEditCancel = this.onEditCancel.bind(this);

    this.consolidadoDiretoData = this.consolidadoDiretoService.Listar();
  }

  ngOnInit(): void {
    this.filtroData = new Date();
    this.filtroDataFinal = new Date();
    this.filtroDataVoo = new Date();
    this.usuarioInfo = this.localstorageService.getLocalStore().UsuarioInfo;
    this.refreshListaVoos();
  }

  onToolbarPreparing(e) {
    e.toolbarOptions.visible = false;
  }

  onInitialized(e) {
    this.voosElement = e.component;
  }

  handleSelectBoxChanged(e) {
    this.curListaOpcoes = e.value;
    switch (this.curListaOpcoes) {
      case 0:
        this.panel1Element.nativeElement.style.display = 'table';
        this.panel2Element.nativeElement.style.display = 'none';
        this.panel3Element.nativeElement.style.display = 'none';
        this.refreshGrid();
        break;
      case 1:
        this.panel1Element.nativeElement.style.display = 'none';
        this.panel2Element.nativeElement.style.display = 'table';
        this.panel3Element.nativeElement.style.display = 'none';
        this.refreshGrid();
        break;
      case 2:
        this.panel1Element.nativeElement.style.display = 'none';
        this.panel2Element.nativeElement.style.display = 'none';
        this.panel3Element.nativeElement.style.display = 'table';
        break;
      default:
        this.panel1Element.nativeElement.style.display = "none";
        this.panel2Element.nativeElement.style.display = "none";
        this.panel3Element.nativeElement.style.display = "none";
    }
  }

  handleValueDataChange(e) {
    this.filtroData = e.value;
    this.refreshGrid();
  }

  handleValueDataChangeFinal(e) {
    this.filtroDataFinal = e.value;
    this.refreshGrid();
  }

  handleValueDataChangeDataVoo(e) {
    this.filtroDataVoo = e.value;
    this.refreshListaVoos();
  }

  onItemClick(e) {
    if (e.itemData.vooid == this.curVoo) return;
    this.curVoo = e.itemData.vooid;
    this.refreshGrid();
  }

  onSearchClick(e) {
    const res = e.validationGroup.validate();
    if (res.status === "invalid")
      return;

    this.refreshGrid();
  }

  refreshListaVoos() {

    this.filtroDataVoo.setSeconds(0);
    this.filtroDataVoo.setMinutes(0);
    this.filtroDataVoo.setHours(0);

    let input: VooListarInputDto = {
      DataVoo: this.filtroDataVoo,
    }

    this.curVoo = -1;
    this.vooData = [];
    this.mastersData = [];
    this.botoesGBItems = null;

    this.vooClient.listarVoosLista(input)
      .subscribe(res => {
        if (res.result.Sucesso) {
          this.vooData = res.result.Dados;
        }
        else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
        }
        if (this.vooData && this.vooData.length > 0) {
          this.botoesGBItems = this.mapearButtonGroup(this.vooData);
          this.curVoo = this.vooData[0].VooId;
          this.refreshGrid();
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout);
      });
  }

  refreshGrid() {

    let input: MasterListarRequest;

    switch (this.curListaOpcoes) {
      case 0:
        input = {
          EmpresaId: +this.usuarioInfo.EmpresaId,
          VooId: this.curVoo,
        }
        break;
      case 1:
        input = {
          EmpresaId: +this.usuarioInfo.EmpresaId,
          DataCriacaoInicialUnica: this.filtroData,
          DataCriacaoFinal: this.filtroDataFinal
        }
        break;
      case 2:
        input = {
          EmpresaId: +this.usuarioInfo.EmpresaId,
          Numero: this.textoMaster
        }
        break;
      default:
        return;
    }

    this.masterClient.listarMasters(input)
      .subscribe(res => {
        if (res.result.Sucesso) {
          this.mastersData = res.result.Dados;
        }
        else {
          this.mastersData = null;
          notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout);
      })
  }

  addRow(e) {
    this.curTipoMaster = "";
    this.dataGrid.instance.addRow();
  }

  exportToExcel(e) {
    this.dataGrid.instance.exportToExcel(false);
  }

  onRowUpdating(e) {

    e.cancel = true;

    if (e.oldData.SituacaoRFB)
      if (this.editarSomenteLeitura && this.reeviarVoo) {
        this.updateTotalParcialMaster(e);
        return;
      }

    this.updateFullMaster(e);

  }

  updateFullMaster(e) {

    const newData: MasterResponseDto = Object.assign(e.oldData, e.newData)

    const updateRequest: MasterUpdateRequestDto = {
      MasterId: newData.MasterId,
      UsuarioAlteradorId: this.usuarioInfo.UsuarioId,
      Numero: newData.Numero.toUpperCase(),
      PesoTotalBruto: newData.PesoTotalBruto,
      PesoTotalBrutoUN: newData.PesoTotalBrutoUN.toUpperCase(),
      TotalPecas: newData.TotalPecas,
      ValorFretePP: newData.ValorFretePP,
      ValorFretePPUN: newData.ValorFretePPUN.toUpperCase(),
      ValorFreteFC: newData.ValorFreteFC,
      ValorFreteFCUN: newData.ValorFreteFCUN.toUpperCase(),
      IndicadorMadeiraMacica: newData.IndicadorMadeiraMacica,
      IndicadorNaoDesunitizacao: newData.IndicadorNaoDesunitizacao,
      DescricaoMercadoria: newData.DescricaoMercadoria.toUpperCase(),
      CodigoRecintoAduaneiro: newData.CodigoRecintoAduaneiro,
      RUC: newData.RUC ? newData.RUC.toUpperCase() : undefined,
      ConsignatarioNome: newData.ConsignatarioNome.toUpperCase(),
      ConsignatarioEndereco: newData.ConsignatarioEndereco ? newData.ConsignatarioEndereco.toUpperCase() : undefined,
      ConsignatarioPostal: newData.ConsignatarioPostal ? newData.ConsignatarioPostal.toUpperCase() : undefined,
      ConsignatarioCidade: newData.ConsignatarioCidade ? newData.ConsignatarioCidade.toUpperCase() : undefined,
      ConsignatarioPaisCodigo: newData.ConsignatarioPaisCodigo.toUpperCase(),
      ConsignatarioSubdivisao: newData.ConsignatarioSubdivisao ? newData.ConsignatarioSubdivisao.toUpperCase() : undefined,
      ConsignatarioCNPJ: newData.ConsignatarioCNPJ.toUpperCase(),
      DataEmissaoXML: newData.DataEmissaoXML,
      NCMLista: newData.NCMLista,
      RemetenteNome: newData.RemetenteNome ? newData.RemetenteNome.toUpperCase() : undefined,
      RemetenteEndereco: newData.RemetenteEndereco ? newData.RemetenteEndereco.toUpperCase() : undefined,
      RemetentePostal: newData.RemetentePostal ? newData.RemetentePostal.toUpperCase() : undefined,
      RemetenteCidade: newData.RemetenteCidade ? newData.RemetenteCidade.toUpperCase() : undefined,
      RemetentePaisCodigo: newData.RemetentePaisCodigo ? newData.RemetentePaisCodigo.toUpperCase() : undefined,
      ConsolidadoDireto: newData.ConsolidadoDireto ?? undefined,
      TotalParcial: newData.TotalParcial ? newData.TotalParcial.toUpperCase() : undefined,
      NumeroVooXML: newData.NumeroVooXML ? newData.NumeroVooXML.toUpperCase() : undefined,
      DataVoo: this.filtroDataVoo,
      AeroportoOrigemCodigo: newData.AeroportoOrigemCodigo.toUpperCase(),
      AeroportoDestinoCodigo: newData.AeroportoDestinoCodigo.toUpperCase(),
      NaturezaCarga: newData.NaturezaCarga && newData.NaturezaCarga.trim().length > 0 ? newData.NaturezaCarga.toUpperCase() : undefined
    }

    this.masterClient.atualizarMaster(updateRequest)
      .subscribe(res => {
        if (res.result.Sucesso) {
          for (var i in this.mastersData) {
            if (this.mastersData[i].MasterId == newData.MasterId) {
              this.mastersData[i] = res.result.Dados;
              break;
            }
          }
          this.dataGrid.instance.cancelEditData();
        }
        else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout);
      });

  }

  updateTotalParcialMaster(e) {

    const newData: MasterResponseDto = Object.assign(e.oldData, e.newData)

    const updateRequest: MasterUpdateTotalParcialRequestDto = {
      MasterId: newData.MasterId,
      UsuarioAlteradorId: this.usuarioInfo.UsuarioId,
      TotalParcial: newData.TotalParcial ? newData.TotalParcial.toUpperCase() : undefined,
    }

    this.masterClient.atualizarParcialTotalMaster(updateRequest)
      .subscribe(res => {
        if (res.result.Sucesso) {
          for (var i in this.mastersData) {
            if (this.mastersData[i].MasterId == newData.MasterId) {
              this.mastersData[i] = res.result.Dados;
              break;
            }
          }
          this.dataGrid.instance.cancelEditData();
        }
        else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout);
      });

  }

  onRowInserting(e) {

    e.cancel = true;

    let newData: MasterResponseDto = e.data;

    let insertRequest: MasterInsertRequestDto = {
      EmpresaId: +this.usuarioInfo.EmpresaId,
      VooId: this.curVoo,
      UsuarioInsercaoId: +this.usuarioInfo.UsuarioId,
      Numero: newData.Numero.toUpperCase(),
      PesoTotalBruto: +newData.PesoTotalBruto,
      PesoTotalBrutoUN: newData.PesoTotalBrutoUN.toUpperCase(),
      TotalPecas: +newData.TotalPecas,
      ValorFretePP: +newData.ValorFretePP,
      ValorFretePPUN: newData.ValorFretePPUN.toUpperCase(),
      ValorFreteFC: +newData.ValorFreteFC,
      ValorFreteFCUN: newData.ValorFreteFCUN.toUpperCase(),
      IndicadorMadeiraMacica: newData.IndicadorMadeiraMacica,
      IndicadorNaoDesunitizacao: newData.IndicadorNaoDesunitizacao,
      DescricaoMercadoria: newData.DescricaoMercadoria.toUpperCase(),
      CodigoRecintoAduaneiro: 0,
      RUC: newData.RUC ? newData.RUC.toUpperCase() : undefined,
      ConsignatarioNome: newData.ConsignatarioNome.toUpperCase(),
      ConsignatarioEndereco: newData.ConsignatarioEndereco ? newData.ConsignatarioEndereco.toUpperCase() : undefined,
      ConsignatarioPostal: newData.ConsignatarioPostal ? newData.ConsignatarioPostal.toUpperCase() : undefined,
      ConsignatarioCidade: newData.ConsignatarioCidade ? newData.ConsignatarioCidade.toUpperCase() : undefined,
      ConsignatarioPaisCodigo: newData.ConsignatarioPaisCodigo.toUpperCase(),
      ConsignatarioSubdivisao: newData.ConsignatarioSubdivisao ? newData.ConsignatarioSubdivisao.toUpperCase() : undefined,
      ConsignatarioCNPJ: newData.ConsignatarioCNPJ.toUpperCase(),
      CiaAereaId: +this.usuarioInfo.CompanhiaId,
      DataEmissaoXML: newData.DataEmissaoXML,
      NCMLista: newData.NCMLista,
      RemetenteNome: newData.RemetenteNome.toUpperCase(),
      RemetenteEndereco: newData.RemetenteEndereco == null ? null : newData.RemetenteEndereco.toUpperCase(),
      RemetentePostal: newData.RemetentePostal == null ? null : newData.RemetentePostal.toUpperCase(),
      RemetenteCidade: newData.RemetenteCidade == null ? null : newData.RemetenteCidade.toUpperCase(),
      RemetentePaisCodigo: newData.RemetentePaisCodigo.toUpperCase(),
      ConsolidadoDireto: newData.ConsolidadoDireto == null ? null : newData.ConsolidadoDireto,
      TotalParcial: newData.TotalParcial == null ? null : newData.TotalParcial.toUpperCase(),
      NumeroVooXML: newData.NumeroVooXML == null ? null : newData.NumeroVooXML.toUpperCase(),
      DataVoo: this.filtroDataVoo,
      AeroportoOrigemCodigo: newData.AeroportoOrigemCodigo.toUpperCase(),
      AeroportoDestinoCodigo: newData.AeroportoDestinoCodigo.toUpperCase(),
      NaturezaCarga: newData.NaturezaCarga ? newData.NaturezaCarga.toUpperCase() : undefined,
    }

    this.masterClient.inserirMaster(insertRequest)
      .subscribe(res => {
        if (res.result.Sucesso) {
          this.mastersData.push(res.result.Dados);
          this.dataGrid.instance.cancelEditData();
        }
        else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout);
      })
  }

  deleteMasterEdition(e): void {
    let result = confirm("<i>Confirma a exclusão dos Master(s) selecionado(s) ?</i>", "Confirma?");
    result.then((dialogResult) => {
      if (dialogResult) {
        this.onRowDelete(this.selectedRows);
      }
    });
  }

  onRowDelete(itens: number[]) {

    const input: ExcluirMastersByIdRequest = {
      MasterIds: itens,
    }

    this.masterClient.excluirMaster(input)
      .subscribe(res => {
        if (res.result.Sucesso) {
          itens.forEach(x => {
            let item = this.mastersData.find(x => x.MasterId == x);
            var index = this.mastersData.indexOf(item);
            this.mastersData.splice(index, 1);
          });
        }
        else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout);
      })

  }

  onEditorPreparing(e: any): void {
    if (e.row?.isNewRow) {
      if (e.parentType == "dataRow" && e.dataField == "Numero") {
        e.editorOptions.readOnly = false;
        this.curgridKey = 0;
      }
    }
    else {
      switch (e.parentType) {
        case "dataRow":
          switch (e.row.data.SituacaoRFB) {
            case LocalSituacaoRfb.Received:
            case LocalSituacaoRfb.ProcessedDeletion:
            case LocalSituacaoRfb.Processed:
              if (e.row.data.Reenviar) {
                this.editarSomenteLeitura = false;
                e.editorOptions.readOnly = false;
              } else {
                this.editarSomenteLeitura = true;
                e.editorOptions.readOnly = true;
              }
              break;
            default:
              this.editarSomenteLeitura = false;
              if (e.dataField == "Numero") {
                e.editorOptions.readOnly = true;
                this.curgridKey = e.row.key;
                return;
              }
              break;
          }
          if (e.dataField == "TotalParcial") {
            e.editorOptions.readOnly = false;
            if (e.row.data.StatusVoo == LocalRecordStatus.ReceivedByRFB && !e.row.data.VooReenviar) {
              e.editorOptions.readOnly = true;
            }
            return;
          }
          break;
        default:
          console.log(e.parentType);
          break;
      }
    }
  }

  selectionChangedHandler() {
    this.rfbProcessedRows = [];
    this.rfbNonProcessedRows = [];
    if (this.selectedRows.length) {
      this.selectedRows.forEach(x => {
        const item = this.mastersData.find(y => y.MasterId == x);
        switch (item.SituacaoRFB) {
          case LocalSituacaoRfb.Processed:
            this.rfbProcessedRows.push(x);
            break;
          case LocalSituacaoRfb.NoSubmitted:
          case LocalSituacaoRfb.ProcessedDeletion:
            this.rfbNonProcessedRows.push(x);
            break;
          case LocalSituacaoRfb.Rejected:
            if (!item.ProtocoloRFB || item.ProtocoloRFB == '')
              this.rfbNonProcessedRows.push(x);
            break;
        }
      });
    }
  }

  releaseMasterEdition(e): void {
    let result = confirm("<i>Confirma a liberação para edição dos Master(s) selecionado(s) ?</i>", "Confirma?");
    result.then((dialogResult) => {
      if (dialogResult) {
        this.releaseMasterEditionConfirm(e);
      }
    });
  }

  releaseMasterEditionConfirm(e): void {
    const input: AtualizarMasterReenviarRequest = {
      MasterIds: this.selectedRows
    }
    this.masterClient.atualizarReeviarMaster(input)
      .subscribe(res => {
        if (res.result.Sucesso) {
          res.result.Dados.forEach(x => {
            for (var i in this.mastersData) {
              if (this.mastersData[i].MasterId == x.MasterId) {
                this.mastersData[i] = x;
                break;
              }
            }
          })
        } else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout);
      });
  }

  isEditVisible(e) {
    return !(e.row.data.StatusId == 2);
  }

  isCheckStatusAvailable(e) {
    return (e.row.data.SituacaoRFB == 1 || e.row.data.SituacaoRFB == 4);
  }

  isViewVisible(e) {
    return (e.row.data.StatusId == 2);
  }

  permitirEdicao() {
    return this.mastersData == null ? false : true;
  }

  mapearButtonGroup(dados: VooListaResponseDto[]) {
    let arrayBG: any = [];
    if (dados == null) return arrayBG;

    for (var i in dados) {
      let item = {
        icon: "airplane",
        alignment: "left",
        text: dados[i].Numero,
        vooid: dados[i].VooId,
        data: dados[i],
      };
      arrayBG.push(item);
    }
    return arrayBG;
  }

  ValidaCnpj(e) {
    if (e.value.length >= 2 && e.value.substr(0, 2).toUpperCase() == 'PP') {
      return true;
    }
    else {
      if (e.value.length == 11) {
        return cpf.isValid(e.value);
      }
      else if (e.value.length == 14) {
        return cnpj.isValid(e.value);
      }
    }
    return false;
  }

  ValidaMasterNumero(e) {
    if (e.value.length != 11)
      return false;
    if (typeof e.value != "string" || Number.isNaN(Number(e.value)))
      return false;

    let digitos7 = Number(e.value.substring(10, 3));
    let digito = Number(e.value.substring(10));
    let digitoesperado = digitos7 % 7;
    if (digito == digitoesperado)
      return true;
    return false;
  }

  OnCustomItemCreatingNCM(e: any) {
    console.log(e);
  }

  OnSelectionChangedNCM(e: any) {
    console.log(e);
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

  onEditCancel(e: any) {
    this.dataGrid.instance.cancelEditData();
  }

  onEditingStart(e) {
    this.curgridKey = e.key;
  }

  OnNCMValueChanged(e: any, cell) {
    cell.setValue(e.value);
  }

  async onClickVerificarStatus(e: any) {

  }

  validarNaturezaOperacao(e: any): boolean {

    if (e && e.value.length === 0) {
      return true;
    }

    if (e && e.value.length === 3) {
      return true;
    }

    return false;

  }

}