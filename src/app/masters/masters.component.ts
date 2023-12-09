import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LocalStorageService } from 'app/shared/services/localstorage.service';
import notify from 'devextreme/ui/notify';
import { cpf, cnpj } from 'cpf-cnpj-validator';
import { PortoIATAResponseDto } from 'app/shared/model/dto/portoiatadto';
import { ConsolidadoDiretoService } from 'app/shared/services/consolidadodireto.service';
import { environment } from 'environments/environment';
import { confirm } from 'devextreme/ui/dialog';
import { StatusService } from 'app/shared/services/status.service';
import { StatusVoo } from 'app/shared/model/statusvoo';
import { AtualizarMasterReenviarRequest, ExcluirMastersByIdRequest, FileParameter, MasterClient, MasterFileResponseDto, MasterInsertRequestDto, MasterListarRequest, MasterResponseDto, MasterUpdateRequestDto, Notificacao, VooClient, VooListaResponseDto, VooListarInputDto } from 'app/shared/proxy/ctaapi';
import { LocalSituacaoRfb } from 'app/shared/enum/api.enum';
import { DxDataGridComponent, DxFileUploaderComponent } from 'devextreme-angular';
import { CubicUnitCollection, FlightTypeEnum, TotalParcialCollection } from 'app/shared/collections/data';

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
  @ViewChild("fileUploader") fileUploader: DxFileUploaderComponent;

  curVoo: number = -1;
  curVooNumber: string;
  filtroData: Date;
  filtroDataFinal: Date;
  filtroDataVoo: Date;
  mastersData: MasterResponseDto[] = [];
  vooData: VooListaResponseDto[] = [];
  importFileData: MasterFileResponseDto[] = [];
  importFileNotification: Notificacao[] = [];
  portosData: Array<PortoIATAResponseDto>;
  selectComponent: any;
  voosElement = null;
  curgridKey: number = 0;
  curTipoMaster: string = "";
  curImportFile: number = 0;
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
  buttonNewAction = ['Padrão IATA', 'Padrão NÃO IATA']
  awbPadraoNaoIata: boolean = false;
  totalParcialData = TotalParcialCollection;
  cubicData = CubicUnitCollection;
  editCsneePais: string = '';
  popupImportVisible: boolean = false;
  popupImportLogVisible: boolean = false;
  saveButtonOptions: any;
  closeButtonOptions: any;
  errorImportMessage: string;
  // Privados
  flightTypeEnum = FlightTypeEnum;

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
      width: 140,
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

    const that = this;

    this.saveButtonOptions = {
      icon: 'check',
      text: 'Importar',
      onClick: this.onUploadImportFile.bind(this),
    };
    this.closeButtonOptions = {
      text: 'Close',
      onClick(e) {
        that.popupImportVisible = false;
      },
    };

    this.refreshListaVoos = this.refreshListaVoos.bind(this);
    this.permitirEdicao = this.permitirEdicao.bind(this);
    this.isEditVisible = this.isEditVisible.bind(this);
    this.onRowDelete = this.onRowDelete.bind(this);
    this.onEditSave = this.onEditSave.bind(this);
    this.onEditCancel = this.onEditCancel.bind(this);
    this.validaMasterNumero = this.validaMasterNumero.bind(this);
    this.onCustomValueHandler = this.onCustomValueHandler.bind(this);
    this.validaCnpj = this.validaCnpj.bind(this);
    this.onItemFileImportClick = this.onItemFileImportClick.bind(this);
    this.onOpenPopup = this.onOpenPopup.bind(this);
    this.consolidadoDiretoData = this.consolidadoDiretoService.Listar();
  }

  ngOnInit(): void {
    this.filtroData = new Date();
    this.filtroDataFinal = new Date();
    this.filtroDataVoo = new Date();
    this.refreshListaVoos();
    this.refreshFileToImport();
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
    this.curVooNumber = e.itemData.VooNumero;
    this.refreshGrid();
  }

  onItemFileImportClick(e) {
    if (this.curImportFile === e.itemData.FileImportId)
      return;

    this.errorImportMessage = undefined;
    this.curImportFile = e.itemData.FileImportId;
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
          this.curVooNumber = this.vooData[0].Numero;
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
          VooId: this.curVoo,
        }
        break;
      case 1:
        input = {
          DataCriacaoInicialUnica: this.filtroData,
          DataCriacaoFinal: this.filtroDataFinal
        }
        break;
      case 2:
        input = {
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

  async refreshFileToImport() {
    this.masterClient.listarArquivosImportacao()
      .subscribe(res => {
        if (res.result.Sucesso) {
          this.importFileData = res.result.Dados ?? [];
        }
        else {
          if (res.result.Notificacoes) {
            notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
            this.importFileData = [];
          }
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout);
      })
  }

  addRow(e) {
    this.awbPadraoNaoIata = e.itemData === 'Padrão NÃO IATA';
    this.curTipoMaster = "";
    this.dataGrid.instance.addRow();
  }

  async onRowUpdating(e) {
    e.cancel = true;

    const newData: MasterResponseDto = Object.assign(e.oldData, e.newData)

    const updateRequest: MasterUpdateRequestDto = {
      MasterId: newData.MasterId,
      VooId: this.curVoo,
      Numero: newData.Numero.toUpperCase(),
      PesoTotalBruto: newData.PesoTotalBruto,
      PesoTotalBrutoUN: newData.PesoTotalBrutoUN.toUpperCase(),
      TotalPecas: newData.TotalPecas,
      ValorFretePP: newData.ValorFretePP,
      ValorFretePPUN: newData.ValorFretePPUN.toUpperCase(),
      ValorFreteFC: newData.ValorFreteFC,
      ValorFreteFCUN: newData.ValorFretePPUN.toUpperCase(),
      IndicadorMadeiraMacica: newData.IndicadorMadeiraMacica,
      IndicadorNaoDesunitizacao: newData.IndicadorNaoDesunitizacao,
      IndicadorAwbNaoIata: this.awbPadraoNaoIata,
      DescricaoMercadoria: newData.DescricaoMercadoria.toUpperCase(),
      CodigoRecintoAduaneiro: newData.CodigoRecintoAduaneiro,
      RUC: newData.RUC ? newData.RUC.toUpperCase() : undefined,
      ConsignatarioNome: newData.ConsignatarioNome.toUpperCase(),
      ConsignatarioEndereco: newData.ConsignatarioEndereco ? newData.ConsignatarioEndereco.toUpperCase() : undefined,
      ConsignatarioPostal: newData.ConsignatarioPostal ? newData.ConsignatarioPostal.toUpperCase() : undefined,
      ConsignatarioCidade: newData.ConsignatarioCidade ? newData.ConsignatarioCidade.toUpperCase() : undefined,
      ConsignatarioPaisCodigo: newData.ConsignatarioPaisCodigo.toUpperCase(),
      ConsignatarioSubdivisao: newData.ConsignatarioSubdivisao ? newData.ConsignatarioSubdivisao.toUpperCase() : undefined,
      ConsignatarioCNPJ: newData.ConsignatarioCNPJ ? newData.ConsignatarioCNPJ.toUpperCase() : undefined,
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
      DataVoo: new Date(this.filtroDataVoo.toDateString()),
      AeroportoOrigemCodigo: newData.AeroportoOrigemCodigo.toUpperCase(),
      AeroportoDestinoCodigo: newData.AeroportoDestinoCodigo.toUpperCase(),
      NaturezaCarga: newData.NaturezaCarga
    }

    this.masterClient.atualizarMaster(updateRequest)
      .subscribe(res => {
        if (res.result.Sucesso) {
          for (const i in this.mastersData) {
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

  async onRowInserting(e) {

    e.cancel = true;

    let newData: MasterResponseDto = e.data;

    let insertRequest: MasterInsertRequestDto = {
      VooId: this.curVoo,
      Numero: newData.Numero.toUpperCase(),
      PesoTotalBruto: +newData.PesoTotalBruto,
      PesoTotalBrutoUN: newData.PesoTotalBrutoUN.toUpperCase(),
      TotalPecas: +newData.TotalPecas,
      ValorFretePP: +newData.ValorFretePP,
      ValorFretePPUN: newData.ValorFretePPUN.toUpperCase(),
      ValorFreteFC: +newData.ValorFreteFC,
      ValorFreteFCUN: newData.ValorFretePPUN.toUpperCase(),
      IndicadorMadeiraMacica: newData.IndicadorMadeiraMacica,
      IndicadorNaoDesunitizacao: newData.IndicadorNaoDesunitizacao,
      IndicadorAwbNaoIata: this.awbPadraoNaoIata,
      DescricaoMercadoria: newData.DescricaoMercadoria.toUpperCase(),
      CodigoRecintoAduaneiro: newData.CodigoRecintoAduaneiro ? newData.CodigoRecintoAduaneiro.toUpperCase() : undefined,
      RUC: newData.RUC ? newData.RUC.toUpperCase() : undefined,
      ConsignatarioNome: newData.ConsignatarioNome.toUpperCase(),
      ConsignatarioEndereco: newData.ConsignatarioEndereco ? newData.ConsignatarioEndereco.toUpperCase() : undefined,
      ConsignatarioPostal: newData.ConsignatarioPostal ? newData.ConsignatarioPostal.toUpperCase() : undefined,
      ConsignatarioCidade: newData.ConsignatarioCidade ? newData.ConsignatarioCidade.toUpperCase() : undefined,
      ConsignatarioPaisCodigo: newData.ConsignatarioPaisCodigo.toUpperCase(),
      ConsignatarioSubdivisao: newData.ConsignatarioSubdivisao ? newData.ConsignatarioSubdivisao.toUpperCase() : undefined,
      ConsignatarioCNPJ: newData.ConsignatarioCNPJ ? newData.ConsignatarioCNPJ.toUpperCase() : undefined,
      DataEmissaoXML: newData.DataEmissaoXML,
      NCMLista: newData.NCMLista,
      RemetenteNome: newData.RemetenteNome.toUpperCase(),
      RemetenteEndereco: newData.RemetenteEndereco == null ? undefined : newData.RemetenteEndereco.toUpperCase(),
      RemetentePostal: newData.RemetentePostal == null ? undefined : newData.RemetentePostal.toUpperCase(),
      RemetenteCidade: newData.RemetenteCidade == null ? undefined : newData.RemetenteCidade.toUpperCase(),
      RemetentePaisCodigo: newData.RemetentePaisCodigo.toUpperCase(),
      ConsolidadoDireto: newData.ConsolidadoDireto == null ? undefined : newData.ConsolidadoDireto,
      TotalParcial: newData.TotalParcial == null ? undefined : newData.TotalParcial.toUpperCase(),
      NumeroVooXML: newData.NumeroVooXML == null ? undefined : newData.NumeroVooXML.toUpperCase(),
      DataVoo: this.filtroDataVoo,
      AeroportoOrigemCodigo: newData.AeroportoOrigemCodigo.toUpperCase(),
      AeroportoDestinoCodigo: newData.AeroportoDestinoCodigo.toUpperCase(),
      NaturezaCarga: newData.NaturezaCarga,
    }

    await this.masterClient.inserirMaster(insertRequest)
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

  async onRowDelete(itens: number[]) {

    const input: ExcluirMastersByIdRequest = {
      MasterIds: itens,
    }

    await this.masterClient.excluirMaster(input)
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

    if (e.row?.isNewRow && e.parentType == "dataRow") {
      switch (e.dataField) {
        case "Numero":
          e.editorOptions.readOnly = false;
          this.editarSomenteLeitura = false;
          this.curgridKey = 0;
          break;
        case "NumeroVooXML":
          e.editorOptions.value = this.curVooNumber;
          e.setValue(this.curVooNumber);
          break;
      }
      return;
    }

    if (e.parentType == "dataRow") {
      if (e.dataField == "Numero") {
        e.editorOptions.readOnly = true;
        this.awbPadraoNaoIata = e.row.data.IndicadorAwbNaoIata;
        this.editCsneePais = e.row.data.ConsignatarioPaisCodigo;
        this.curgridKey = e.row.key;
      } else {
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
            e.editorOptions.readOnly = false;
        }
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
          case LocalSituacaoRfb.Rejected:
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
    return (e.row.data.SituacaoRFB === 0 || e.row.data.SituacaoRFB === 3 || (e.row.data.SituacaoRFB === 2 && e.row.data.Reenviar));
  }

  isCheckStatusAvailable(e) {
    return (e.row.data.SituacaoRFB == 1 || e.row.data.SituacaoRFB == 4);
  }

  isViewVisible(e) {
    return ((e.row.data.SituacaoRFB === 2 || e.row.data.SituacaoRFB === 1 || e.row.data.SituacaoRFB === 4) && !e.row.data.Reenviar);
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
        text: dados[i].Numero + ' - ' + dados[i].CiaAereaNome + ' - ' + this.flightTypeEnum[dados[i].FlightType],
        vooid: dados[i].VooId,
        data: dados[i],
      };
      arrayBG.push(item);
    }
    return arrayBG;
  }

  validaCnpj(e) {
    if (e.value.length === 0)
      return true;

    if (this.editCsneePais.toUpperCase() !== 'BR')
      return true;

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

  validaMasterNumero(e) {
    if (this.awbPadraoNaoIata)
      return true;

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

  onNcmValueChanged(e: any, cell) {
    if (e.length > 0) {
      const value = e.map(x => x.code);
      if (value)
        cell.setValue(value);
      return;
    }
    cell.setValue(null);
  }

  onSIValueChanged(e: any, cell) {
    if (e.length > 0) {
      const value = e.map(x => x.code);
      if (value)
        cell.setValue(value);
      return;
    }
    cell.setValue(null);
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

  onCustomValueHandler(e, cell) {
    cell.setValue(e.value);
    if (cell.column.dataField === 'ConsignatarioPaisCodigo') {
      this.editCsneePais = e.value;
    }
  }

  onOpenPopup() {
    this.curImportFile = -1;
    this.fileUploader.instance.reset();
    this.popupImportVisible = true;
  }

  onUploadImportFile() {

    if (this.curImportFile < 0) {
      this.errorImportMessage = "Selecione um template!";
      return;
    }

    if (this.fileUploader.value.length == 0) {
      this.errorImportMessage = "Selecione um arquivo!";
      return;
    }

    this.errorImportMessage = undefined;
    this.popupImportVisible = false;

    let fileInfo: FileParameter = {
      fileName: this.fileUploader.value[0].name,
      data: this.fileUploader.value[0]
    }

    this.masterClient.uploadImportFile(this.curVoo, this.curImportFile, fileInfo)
      .subscribe(res => {
        if (res.result.Sucesso) {
          this.importFileNotification = res.result.Notificacoes;
          this.popupImportLogVisible = true;
        }
        else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
        }
      })
  }

  onFileUploadValueChanged(e: any) {
    this.errorImportMessage = undefined;
  }

}