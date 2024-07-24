import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { LocalSituacaoRfb } from "app/shared/enum/api.enum";
import {
  PortoIataResponseDto,
  ReceitaFederalClient,
  PortoIATAClient,
  AgenteDeCargaClient,
  AgenteDeCargaListaSimplesResponse,
  HouseClient,
  HouseInsertRequestDto,
  HouseListarRequest,
  HouseResponseDto,
  HouseUpdateRequestDto,
  UsuarioInfoResponse,
} from "app/shared/proxy/ctaapi";
import { LocalStorageService } from "app/shared/services/localstorage.service";
import { cnpj, cpf } from "cpf-cnpj-validator";
import { DxDataGridComponent } from "devextreme-angular";
import { confirm } from "devextreme/ui/dialog";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";

function isNotEmpty(value: any): boolean {
  return value !== undefined && value !== null && value !== '';
}

@Component({
  selector: "app-houses",
  templateUrl: "./houses.component.html",
  styleUrls: ["./houses.component.css"],
})
export class HousesComponent implements OnInit {
  @ViewChild("dataGrid", { static: false }) dataGrid: DxDataGridComponent;
  @ViewChild("panel1") panel1Element: ElementRef;
  @ViewChild("panel2") panel2Element: ElementRef;

  curAgenteDeCarga: number = -1;
  agenteDeCarga: AgenteDeCargaListaSimplesResponse = null;
  filtroData: Date;
  filtroDataFinal: Date;
  filtroDataProcessamento: Date;
  loadingVisible = false;
  permitirAdicao: boolean = false;
  loadingVoos: boolean = false;
  curgridKey: number = 0;
  private usuarioInfo: UsuarioInfoResponse;
  readOnlyEdition: boolean = false;
  // Data Soure
  housesData: HouseResponseDto[] = [];
  portosData: PortoIataResponseDto[] = [];
  pesoUnidade: any = [];
  botoesGBItems: any = [];
  statusHouse: any = [];
  listaOpcoes: any = [];
  curListaOpcoes: number;
  textoHouse: string;
  // Icones
  selectFiltro: any;
  refreshIcon: any;
  plusIcon: any;
  excelIcon: any;
  NCMData: string[];
  selectedRows: number[] = [];
  rfbProcessedRows: number[] = [];
  rfbNonProcessedRows: number[] = [];
  rfbAssociationProcessedRows: number[] = [];
  rfbSubmitExclusionRows: number[] = [];
  dataSource: any;
  showThirdParty: boolean = false;

  constructor(
    private houseClient: HouseClient,
    private agenteDeCargaClient: AgenteDeCargaClient,
    private localstorageService: LocalStorageService,
    private portoIATAClient: PortoIATAClient,
    private receitaFederalClient: ReceitaFederalClient,
  ) {

    this.listaOpcoes = [
      {
        Id: 0,
        Descricao: "Data Processamento",
      },
      {
        Id: 1,
        Descricao: "Número",
      },
    ];

    this.curListaOpcoes = 0;

    this.selectFiltro = {
      width: 180,
      value: this.curListaOpcoes,
      dataSource: this.listaOpcoes,
      displayExpr: "Descricao",
      valueExpr: "Id",
      onValueChanged: this.handleSelectBoxChanged.bind(this),
    };

    this.refreshIcon = {
      icon: "refresh",
      hint: "Refresh",
      onClick: this.refreshGridIcon.bind(this),
    };

    this.plusIcon = {
      icon: "plus",
      hint: "Adicionar House",
      onClick: this.addRow.bind(this),
    };

    this.excelIcon = {
      icon: "xlsxfile",
      hint: "Exportar para o Excel",
      onClick: this.exportToExcel.bind(this),
    };

    this.statusHouse = [
      {
        StatusId: 0,
        Descricao: "Informação insuficientes para envio",
      },
      {
        StatusId: 1,
        Descricao: "Pronto para envio RFB",
      },
      {
        StatusId: 2,
        Descricao: "Recebido pela RFB",
      },
    ];

    this.pesoUnidade = [
      {
        Code: "KGM",
        Description: "Kilogramas",
      },
      {
        Codigo: "LBS",
        Description: "Libras",
      },
    ];

    this.onToolbarPreparing = this.onToolbarPreparing.bind(this);
    this.onEditSave = this.onEditSave.bind(this);
    this.onEditCancel = this.onEditCancel.bind(this);
    this.onSubmitExclusion = this.onSubmitExclusion.bind(this);
    const now = new Date();
    this.filtroDataProcessamento = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );
    this.usuarioInfo = this.localstorageService.getLocalStore().UsuarioInfo;
    this.refreshIataPorts();
    this.refreshGrid();
  }

  ngOnInit(): void {
    this.usuarioInfo = this.localstorageService.getLocalStore().UsuarioInfo;
  }

  onToolbarPreparing(e) {
    e.toolbarOptions.visible = false;
  }

  onItemClick(e) {
    if (e.itemData.agenteid == this.curAgenteDeCarga) return;
    this.curAgenteDeCarga = e.itemData.agenteid;
    this.agenteDeCarga = {
      Nome: e.itemData.text,
      Numero: e.itemData.agentenumero,
      AgenteDeCargaId: e.itemData.agenteid,
    };
    this.refreshGrid();
  }

  handleSelectBoxChanged(e) {
    this.curListaOpcoes = e.value;
    switch (this.curListaOpcoes) {
      case 0:
        this.panel1Element.nativeElement.style.display = "table";
        this.panel2Element.nativeElement.style.display = "none";
        break;
      case 1:
        this.panel1Element.nativeElement.style.display = "none";
        this.panel2Element.nativeElement.style.display = "table";
        break;
      default:
        this.panel1Element.nativeElement.style.display = "none";
        this.panel2Element.nativeElement.style.display = "none";
    }
  }

  onDataProcessamentoChanged(e) {
    this.filtroDataProcessamento = new Date(
      e.value.getFullYear(),
      e.value.getMonth(),
      e.value.getDate(),
      0,
      0,
      0,
      0
    );
    this.refreshGrid();
  }

  refreshAgentesDeCarga() {
    this.loadingVisible = true;
    this.curAgenteDeCarga = -1;
    this.botoesGBItems = null;

    this.agenteDeCargaClient
      .listarAgentesDeCargaSimples()
      .subscribe(
        (res) => {
          if (res.result.Sucesso) {
            this.botoesGBItems = this.mapearButtonGroup(res.result.Dados);
            if (res.result.Dados && res.result.Dados.length > 0) {
              this.curAgenteDeCarga = res.result.Dados[0].AgenteDeCargaId;
              this.agenteDeCarga = res.result.Dados[0];
            }
            return;
          }
          notify(
            res.result.Notificacoes[0].Mensagem,
            "error",
            environment.ErrorTimeout
          );
        },
        (err) => { }
      );
  }

  async refreshGrid() {
    this.loadingVisible = true;

    let input: HouseListarRequest = {};
    switch (this.curListaOpcoes) {
      case 0:
        input.DataProcessamento = this.filtroDataProcessamento;
        break;
      case 1:
        input.Numero = this.textoHouse;
        break;
      default:
        return;
    }

    await this.houseClient
      .listarHouses(input)
      .toPromise()
      .then((res) => {
        if (res.result.Sucesso) {
          this.housesData = res.result.Dados;
          this.permitirAdicao = true;
        } else {
          this.housesData = [];
          notify(res.result.Notificacoes[0].Mensagem, "error", 3000);
        }
      })
      .catch((err) => {
        notify(err, "error", 3000);
      });

    this.loadingVisible = false;
  }

  async refreshIataPorts() {
    await this.portoIATAClient
      .listarPortosIATA()
      .toPromise()
      .then((res) => {
        if (res.result.Sucesso) {
          this.portosData = res.result.Dados ?? [];
        } else {
          this.portosData = [];
          notify(
            res.result.Notificacoes[0].Mensagem,
            "error",
            environment.ErrorTimeout
          );
        }
      })
      .catch((err) => {
        notify(err, "error", environment.ErrorTimeout);
      });
  }

  refreshGridIcon() {
    this.refreshGrid();
  }

  addRow(e) {
    this.dataGrid.instance.addRow();
  }

  exportToExcel(e) {
    this.dataGrid.instance.exportToExcel(true);
  }

  async onRowUpdating(e) {
    this.loadingVisible = true;
    e.cancel = true;

    const newData: HouseResponseDto = Object.assign(e.oldData, e.newData);

    const updateRequest: HouseUpdateRequestDto = {
      Numero: newData.Numero.toUpperCase(),
      PesoTotalBruto: newData.PesoTotalBruto,
      PesoTotalBrutoUN: newData.PesoTotalBrutoUN.toUpperCase(),
      TotalVolumes: +newData.TotalVolumes,
      Volume: +newData.Volume,
      VolumeUN: newData.VolumeUN,
      ValorFretePP: newData.ValorFretePP,
      ValorFretePPUN: newData.ValorFretePPUN.toUpperCase(),
      ValorFreteFC: newData.ValorFreteFC,
      ValorFreteFCUN: newData.ValorFretePPUN.toUpperCase(),
      IndicadorMadeiraMacica: newData.IndicadorMadeiraMacica,
      DescricaoMercadoria: newData.DescricaoMercadoria.toUpperCase(),
      CodigoRecintoAduaneiro: newData.CodigoRecintoAduaneiro,
      RUC: newData.RUC == null ? undefined : newData.RUC.toUpperCase(),
      RemetenteNome: newData.RemetenteNome.toUpperCase(),
      RemetenteEndereco: newData.RemetenteEndereco
        ? newData.RemetenteEndereco.toUpperCase()
        : undefined,
      RemetentePostal: newData.RemetentePostal
        ? newData.RemetentePostal.toUpperCase()
        : undefined,
      RemetenteCidade: newData.RemetenteCidade
        ? newData.RemetenteCidade.toUpperCase()
        : undefined,
      RemetentePaisCodigo: newData.RemetentePaisCodigo
        ? newData.RemetentePaisCodigo.toUpperCase()
        : undefined,
      ConsignatarioNome: newData.ConsignatarioNome.toUpperCase(),
      ConsignatarioEndereco:
        newData.ConsignatarioEndereco == null
          ? null
          : newData.ConsignatarioEndereco.toUpperCase(),
      ConsignatarioPostal:
        newData.ConsignatarioPostal == null
          ? null
          : newData.ConsignatarioPostal.toUpperCase(),
      ConsignatarioCidade:
        newData.ConsignatarioCidade == null
          ? undefined
          : newData.ConsignatarioCidade.toUpperCase(),
      ConsignatarioPaisCodigo: newData.ConsignatarioPaisCodigo.toUpperCase(),
      ConsignatarioSubdivisao:
        newData.ConsignatarioSubdivisao == null
          ? undefined
          : newData.ConsignatarioSubdivisao.toUpperCase(),
      ConsignatarioCNPJ: newData.ConsignatarioCNPJ ? newData.ConsignatarioCNPJ.toUpperCase()
        : undefined,
      AeroportoOrigem: newData.AeroportoOrigem.toUpperCase(),
      AeroportoDestino: newData.AeroportoDestino.toUpperCase(),
      HouseId: newData.HouseId,
      AgenteDeCargaNumero: newData.AgenteDeCargaNumero.toUpperCase(),
      NCMLista: newData.NCMLista,
      MasterNumeroXML: newData.MasterNumeroXML,
      DataEmissaoXML: newData.DataEmissaoXML,
      NaturezaCarga: newData.NaturezaCarga,
    };

    await this.houseClient
      .atualizarHouse(updateRequest)
      .toPromise()
      .then((res) => {
        if (res.result.Sucesso) {
          let item = this.housesData.find(
            (x) => x.HouseId == res.result.Dados.HouseId
          );
          if (item) {
            this.housesData[this.housesData.indexOf(item)] = res.result.Dados;
          }
          this.dataGrid.instance.cancelEditData();
        } else {
          notify(
            res.result.Notificacoes[0].Mensagem,
            "error",
            environment.ErrorTimeout
          );
        }
      })
      .catch((err) => {
        notify(err, "error", environment.ErrorTimeout);
      });

    this.loadingVisible = false;
  }

  async onRowInserting(e) {
    this.loadingVisible = true;
    e.cancel = true;

    const newData: HouseResponseDto = e.data;

    const insertRequest: HouseInsertRequestDto = {
      Numero: newData.Numero.toUpperCase(),
      PesoTotalBruto: newData.PesoTotalBruto,
      PesoTotalBrutoUN: newData.PesoTotalBrutoUN.toUpperCase(),
      TotalVolumes: +newData.TotalVolumes,
      Volume: +newData.Volume,
      VolumeUN: newData.VolumeUN,
      ValorFretePP: newData.ValorFretePP,
      ValorFretePPUN: newData.ValorFretePPUN.toUpperCase(),
      ValorFreteFC: newData.ValorFreteFC,
      ValorFreteFCUN: newData.ValorFretePPUN.toUpperCase(),
      IndicadorMadeiraMacica: newData.IndicadorMadeiraMacica,
      DescricaoMercadoria: newData.DescricaoMercadoria.toUpperCase(),
      CodigoRecintoAduaneiro: newData.CodigoRecintoAduaneiro, // Recinto Aduaneiro
      AgenteDeCargaNumero: newData.AgenteDeCargaNumero.toUpperCase(), // Código Agente de Carga
      RUC: newData.RUC ? newData.RUC.toUpperCase() : null,
      RemetenteNome: newData.RemetenteNome.toUpperCase(),
      RemetenteEndereco: newData.RemetenteEndereco
        ? newData.RemetenteEndereco.toUpperCase()
        : undefined,
      RemetentePostal: newData.RemetentePostal
        ? newData.RemetentePostal.toUpperCase()
        : undefined,
      RemetenteCidade: newData.RemetenteCidade
        ? newData.RemetenteCidade.toUpperCase()
        : undefined,
      RemetentePaisCodigo: newData.RemetentePaisCodigo
        ? newData.RemetentePaisCodigo.toUpperCase()
        : undefined,
      ConsignatarioNome: newData.ConsignatarioNome.toUpperCase(),
      ConsignatarioEndereco: newData.ConsignatarioEndereco
        ? newData.ConsignatarioEndereco.toUpperCase()
        : undefined,
      ConsignatarioPostal: newData.ConsignatarioPostal
        ? newData.ConsignatarioPostal.toUpperCase()
        : undefined,
      ConsignatarioCidade: newData.ConsignatarioCidade
        ? newData.ConsignatarioCidade.toUpperCase()
        : undefined,
      ConsignatarioPaisCodigo: newData.ConsignatarioPaisCodigo.toUpperCase(),
      ConsignatarioSubdivisao: newData.ConsignatarioSubdivisao
        ? newData.ConsignatarioSubdivisao.toUpperCase()
        : undefined,
      ConsignatarioCNPJ: newData.ConsignatarioCNPJ ? newData.ConsignatarioCNPJ.toUpperCase()
        : undefined,
      AeroportoOrigem: newData.AeroportoOrigem
        ? newData.AeroportoOrigem.toUpperCase()
        : undefined,
      AeroportoDestino: newData.AeroportoDestino
        ? newData.AeroportoDestino.toUpperCase()
        : undefined,
      DataProcessamento: this.filtroDataProcessamento,
      NCMLista: newData.NCMLista,
      MasterNumeroXML: newData.MasterNumeroXML,
      DataEmissaoXML: newData.DataEmissaoXML,
      NaturezaCarga: newData.NaturezaCarga,
    };

    await this.houseClient
      .inserirHouse(insertRequest)
      .toPromise()
      .then((res) => {
        if (res.result.Sucesso) {
          this.housesData.push(res.result.Dados);
          this.dataGrid.instance.cancelEditData();
        } else {
          notify(
            res.result.Notificacoes[0].Mensagem,
            "error",
            environment.ErrorTimeout
          );
        }
      })
      .catch((err) => {
        notify(err, "error", environment.ErrorTimeout);
      });

    this.loadingVisible = false;
  }

  async onRowDelete(itens: number[]) {

    this.houseClient.excluirHouse(this.selectedRows[0])
      .subscribe(res => {
        if (res.result.Sucesso) {
          itens.forEach(x => {
            let item = this.housesData.find(x => x.HouseId == x);
            const index = this.housesData.indexOf(item);
            this.housesData.splice(index, 1);
          });
          notify('House apagado!', 'success', environment.ErrorTimeout);
        }
        else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout);
      })

  }

  onEditorPreparing(e: any): void {

    if (e.parentType !== "dataRow") return;

    if (e.dataField === "AeroportoOrigem" || e.dataField === "AeroportoDestino") {
      const portos = this.portosData.map((x) => `${x.Codigo} - ${x.Nome}`);

      e.editorType = "dxAutocomplete";
      e.editorOptions = {
        items: portos,
        minSearchLength: "2",
        searchTimeout: "500",
        readOnly: e.dataField == "AeroportoOrigem" && e.row.data.SituacaoRFB == LocalSituacaoRfb.Processed ? true : this.readOnlyEdition,
        value: e.value,
        onValueChanged: (ev) => {
          if (ev.value)
            e.setValue(ev.value.substring(0, 3));
        },
      };
      return;
    }

    if (e.dataField === "PesoTotalBrutoUN") {
      e.editorType = "dxAutocomplete";
      e.editorOptions = {
        items: this.pesoUnidade.map((x) => `${x.Code} - ${x.Description}`),
        minSearchLength: "2",
        searchTimeout: "500",
        value: e.value,
        onValueChanged: (ev) => {
          if (ev.value)
            e.setValue(ev.value.substring(0, 3));
        },
      };
      return;
    }

    if (e.row?.isNewRow) {
      if (e.parentType == "dataRow" && e.dataField == "Numero") {
        this.readOnlyEdition = false;
        e.editorOptions.readOnly = false;
        this.curgridKey = 0;
      }
      if (e.parentType == 'dataRow' && e.dataField == 'ndicadorMadeiraMacica')
        e.editorOptions.value = false;
      return;
    }

    if (e.dataField === "Numero") {
      e.editorOptions.readOnly = true;
      return;
    }


    switch (e.row.data.SituacaoRFB) {
      case LocalSituacaoRfb.Received:
      case LocalSituacaoRfb.ProcessedDeletion:
      case LocalSituacaoRfb.Processed:
        if (e.row.data.Reenviar) {
          this.readOnlyEdition = false;
          e.editorOptions.readOnly = false;
        } else {
          this.readOnlyEdition = true;
          e.editorOptions.readOnly = true;
        }

        if (e.dataField == "DataEmissaoXML") {
          e.editorOptions.readOnly = true;
        }
        break;
      default:
        this.readOnlyEdition = false;
        if (e.dataField == "Numero") {
          e.editorOptions.readOnly = true;
          this.curgridKey = e.row.key;
          return;
        }
        break;
    }
  }

  isEditVisible(e) {
    return (e.row.data.SituacaoRFB === 0 ||
      e.row.data.SituacaoRFB === 3 ||
      (e.row.data.SituacaoRFB === 2 && e.row.data.Reenviar && e.row.data.RFBCancelationStatus === 0));
  }

  isViewVisible(e) {
    return (e.row.data.SituacaoRFB === 2 && !e.row.data.Reenviar && e.row.data.RFBCancelationStatus === 0);
  }

  isCheckStatusAvailable(e) {
    return (e.row.data.SituacaoRFB === 1 || e.row.data.RFBCancelationStatus === 1);
  }

  validaCnpj(e) {
    if (e.value.length === 0)
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

  validaDataEmissao(e) {
    return true;
    //return e.value < new Date;
  }

  ValidaMasterNumero(e) {
    if (e.value.length != 11) return false;
    if (typeof e.value != "string" || Number.isNaN(Number(e.value)))
      return false;

    let digitos7 = Number(e.value.substring(10, 3));
    let digito = Number(e.value.substring(10));
    let digitoesperado = digitos7 % 7;
    if (digito == digitoesperado) return true;
    return false;
  }

  onSearchClick(e) {
    const res = e.validationGroup.validate();
    if (res.status === "invalid") return;

    this.refreshGrid();
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

  async onSubmitExclusion(e: any) {

    if (this.rfbSubmitExclusionRows.length === 0)
      return;

    let result = confirm("<i>Deseja submeter/verificar a exclusão do house na RFB ?</i>", "Confirma?");
    result.then(async (dialogResult) => {
      if (dialogResult) {
        await this.receitaFederalClient.cancelarHouse(this.rfbSubmitExclusionRows[0])
          .subscribe(res => {
            if (res.result.Sucesso) {
              const idx = this.housesData.findIndex(x => x.HouseId === this.rfbSubmitExclusionRows[0]);
              if (idx > -1) {
                this.housesData[idx] = res.result.Dados;
                this.dataGrid.instance.repaintRows([idx]);
              }
              this.selectionChangedHandler();
              notify('Exclusão submetida com sucesso', 'success', environment.ErrorTimeout);
            } else {
              notify(
                res.result.Notificacoes[0].Mensagem,
                "error",
                environment.ErrorTimeout
              );
            }
          })
      }
    });
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

  selectionChangedHandler() {
    this.rfbProcessedRows = [];
    this.rfbNonProcessedRows = [];
    this.rfbSubmitExclusionRows = [];

    this.selectedRows.forEach(x => {
      const item = this.housesData.find(y => y.HouseId == x);
      switch (item.SituacaoRFB) {
        case LocalSituacaoRfb.Processed:
          if (item.RFBCancelationStatus === 0)
            this.rfbProcessedRows.push(x);
          this.rfbSubmitExclusionRows.push(x);
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

  deleteHouseEdition(e): void {
    let result = confirm("<i>Confirma a exclusão do(s) House(s) selecionado(s) ?</i>", "Confirma?");
    result.then((dialogResult) => {
      if (dialogResult) {
        this.onRowDelete(this.selectedRows);
      }
    });
  }

  releaseHouseEdition(e): void {
    if (!this.rfbProcessedRows)
      return;

    if (this.rfbProcessedRows.length === 0)
      return;

    let result = confirm("<i>Confirma a liberação para edição dos Master(s) selecionado(s) ?</i>", "Confirma?");
    result.then((dialogResult) => {
      if (dialogResult) {
        this.houseClient.atualizarReenviarHouse(this.rfbProcessedRows[0])
          .subscribe(res => {
            if (res.result.Sucesso) {
              const idx = this.housesData.findIndex(x => x.HouseId === this.rfbProcessedRows[0]);
              if (idx > -1) {
                this.housesData[idx].Reenviar = true;
                this.dataGrid.instance.repaintRows([idx]);
              }
            }
          })
      }
    });
  }

  private mapearButtonGroup(dados: AgenteDeCargaListaSimplesResponse[]) {
    let arrayBG: any = [];
    if (dados == null) return arrayBG;

    for (var i in dados) {
      let item = {
        icon: "assets/img/icons/wood-pallet.svg",
        alignment: "left",
        text: dados[i].Nome,
        agenteid: dados[i].AgenteDeCargaId,
        agentenumero: dados[i].Numero,
      };
      arrayBG.push(item);
    }

    return arrayBG;
  }

  onClickVerificarStatus(e: any) {
    console.log(e);
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

}
