import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { PortoIATAResponseDto } from "app/shared/proxy/ctaapi";
import { PortoIATAClient } from "app/shared/proxy/ctaapi";
import {
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
import { PortoIATAService } from "app/shared/services/portoiata.service";
import { cnpj, cpf } from "cpf-cnpj-validator";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";

@Component({
  selector: "app-houses",
  templateUrl: "./houses.component.html",
  styleUrls: ["./houses.component.css"],
})
export class HousesComponent implements OnInit, AfterViewInit {
  @ViewChild("dataGrid") dataGrid;
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
  // Data Soure
  housesData: HouseResponseDto[] = [];
  portosData: PortoIATAResponseDto[];
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

  constructor(
    private houseClient: HouseClient,
    private agenteDeCargaClient: AgenteDeCargaClient,
    private localstorageService: LocalStorageService,
    private portoIATAClient: PortoIATAClient
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
      width: 220,
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
      onClick: this.AddRow.bind(this),
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
    this.OnEditSave = this.OnEditSave.bind(this);
    this.OnEditCancel = this.OnEditCancel.bind(this);
    this.OnEditDelete = this.OnEditDelete.bind(this);
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
    this.refreshAgentesDeCarga();
    this.refreshIataPorts();
  }

  ngOnInit(): void {
    this.usuarioInfo = this.localstorageService.getLocalStore().UsuarioInfo;
  }

  ngAfterViewInit(): void {}

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
    this.refreshGrid(e.itemData.agenteid);
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
    this.refreshGrid(this.curAgenteDeCarga);
  }

  refreshAgentesDeCarga() {
    this.loadingVisible = true;
    this.curAgenteDeCarga = -1;
    this.botoesGBItems = null;

    this.agenteDeCargaClient
      .listarAgentesDeCargaSimples(this.usuarioInfo.EmpresaId)
      .subscribe(
        (res) => {
          if (res.result.Sucesso) {
            this.botoesGBItems = this.mapearButtonGroup(res.result.Dados);
            if (res.result.Dados && res.result.Dados.length > 0) {
              this.curAgenteDeCarga = res.result.Dados[0].AgenteDeCargaId;
              this.agenteDeCarga = res.result.Dados[0];
              this.refreshGrid(res.result.Dados[0].AgenteDeCargaId);
            }
            return;
          }
          notify(
            res.result.Notificacoes[0].Mensagem,
            "error",
            environment.ErrorTimeout
          );
        },
        (err) => {}
      );
  }

  async refreshGrid(agenteDeCargaId: number) {
    this.loadingVisible = true;

    let input: HouseListarRequest = {};
    switch (this.curListaOpcoes) {
      case 0:
        input.DataProcessamento = this.filtroDataProcessamento;
        input.AgenteDeCargaId = agenteDeCargaId;
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
      .listarPortosIATA(this.usuarioInfo.EmpresaId)
      .toPromise()
      .then((res) => {
        if (res.result.Sucesso) {
          this.portosData = res.result.Dados;
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
    this.refreshGrid(this.curAgenteDeCarga);
  }

  AddRow(e) {
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
      TotalVolumes: newData.TotalVolumes,
      ValorFretePP: newData.ValorFretePP,
      ValorFretePPUN: newData.ValorFretePPUN.toUpperCase(),
      ValorFreteFC: newData.ValorFreteFC,
      ValorFreteFCUN: newData.ValorFreteFCUN.toUpperCase(),
      IndicadorMadeiraMacica: newData.IndicadorMadeiraMacica,
      DescricaoMercadoria: newData.DescricaoMercadoria.toUpperCase(),
      CodigoRecintoAduaneiro: +newData.CodigoRecintoAduaneiro,
      RUC: newData.RUC == null ? null : newData.RUC.toUpperCase(),
      RemetenteNome: newData.RemetenteNome.toUpperCase(),
      RemetenteEndereco: newData.RemetenteEndereco
        ? newData.RemetenteEndereco.toUpperCase()
        : null,
      RemetentePostal: newData.RemetentePostal
        ? newData.RemetentePostal.toUpperCase()
        : null,
      RemetenteCidade: newData.RemetenteCidade
        ? newData.RemetenteCidade.toUpperCase()
        : null,
      RemetentePaisCodigo: newData.RemetentePaisCodigo
        ? newData.RemetentePaisCodigo.toUpperCase()
        : null,
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
          ? null
          : newData.ConsignatarioCidade.toUpperCase(),
      ConsignatarioPaisCodigo: newData.ConsignatarioPaisCodigo.toUpperCase(),
      ConsignatarioSubdivisao:
        newData.ConsignatarioSubdivisao == null
          ? null
          : newData.ConsignatarioSubdivisao.toUpperCase(),
      ConsignatarioCNPJ: newData.ConsignatarioCNPJ.toUpperCase(),
      AeroportoOrigem: newData.AeroportoOrigem.toUpperCase(),
      AeroportoDestino: newData.AeroportoDestino.toUpperCase(),
      HouseId: newData.HouseId,
      AgenteDeCargaNumero: newData.AgenteDeCargaNumero.toUpperCase(),
      NCMLista: newData.NCMLista,
      MasterNumeroXML: newData.MasterNumeroXML,
      DataEmissaoXML: newData.DataEmissaoXML,
      UsuarioAlteradorId: this.usuarioInfo.UsuarioId,
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
      ValorFretePP: newData.ValorFretePP,
      ValorFretePPUN: newData.ValorFretePPUN.toUpperCase(),
      ValorFreteFC: newData.ValorFreteFC,
      ValorFreteFCUN: newData.ValorFreteFCUN.toUpperCase(),
      IndicadorMadeiraMacica: newData.IndicadorMadeiraMacica,
      DescricaoMercadoria: newData.DescricaoMercadoria.toUpperCase(),
      CodigoRecintoAduaneiro: +newData.CodigoRecintoAduaneiro, // Recinto Aduaneiro
      AgenteDeCargaNumero: newData.AgenteDeCargaNumero.toUpperCase(), // Código Agente de Carga
      RUC: newData.RUC ? newData.RUC.toUpperCase() : null,
      RemetenteNome: newData.RemetenteNome.toUpperCase(),
      RemetenteEndereco: newData.RemetenteEndereco
        ? newData.RemetenteEndereco.toUpperCase()
        : null,
      RemetentePostal: newData.RemetentePostal
        ? newData.RemetentePostal.toUpperCase()
        : null,
      RemetenteCidade: newData.RemetenteCidade
        ? newData.RemetenteCidade.toUpperCase()
        : null,
      RemetentePaisCodigo: newData.RemetentePaisCodigo
        ? newData.RemetentePaisCodigo.toUpperCase()
        : null,
      ConsignatarioNome: newData.ConsignatarioNome.toUpperCase(),
      ConsignatarioEndereco: newData.ConsignatarioEndereco
        ? newData.ConsignatarioEndereco.toUpperCase()
        : null,
      ConsignatarioPostal: newData.ConsignatarioPostal
        ? newData.ConsignatarioPostal.toUpperCase()
        : null,
      ConsignatarioCidade: newData.ConsignatarioCidade
        ? newData.ConsignatarioCidade.toUpperCase()
        : null,
      ConsignatarioPaisCodigo: newData.ConsignatarioPaisCodigo.toUpperCase(),
      ConsignatarioSubdivisao: newData.ConsignatarioSubdivisao
        ? newData.ConsignatarioSubdivisao.toUpperCase()
        : null,
      ConsignatarioCNPJ: newData.ConsignatarioCNPJ.toUpperCase(),
      AeroportoOrigem: newData.AeroportoOrigem
        ? newData.AeroportoOrigem.toUpperCase()
        : null,
      AeroportoDestino: newData.AeroportoDestino
        ? newData.AeroportoDestino.toUpperCase()
        : null,
      EmpresaId: this.usuarioInfo.EmpresaId,
      UsuarioInsercaoId: this.usuarioInfo.UsuarioId,
      DataProcessamento: this.filtroDataProcessamento,
      NCMLista: newData.NCMLista,
      MasterNumeroXML: newData.MasterNumeroXML,
      DataEmissaoXML: newData.DataEmissaoXML,
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

  onEditorPreparing(e: any): void {
    if (e.parentType !== "dataRow") return;

    if (
      e.dataField === "AeroportoOrigem" ||
      e.dataField === "AeroportoDestino"
    ) {
      e.editorType = "dxAutocomplete";
      e.editorOptions = {
        items: this.portosData.map((x) => `${x.Codigo} - ${x.Nome}`),
        minSearchLength: "2",
        searchTimeout: "500",
        value: e.value,
        onValueChanged: (ev) => {
          e.setValue(ev.value.substring(0, 3));
        },
      };
    }

    if (e.dataField === "PesoTotalBrutoUN") {
      e.editorType = "dxAutocomplete";
      e.editorOptions = {
        items: this.pesoUnidade.map((x) => `${x.Code} - ${x.Description}`),
        minSearchLength: "2",
        searchTimeout: "500",
        value: e.value,
        onValueChanged: (ev) => {
          e.setValue(ev.value.substring(0, 3));
        },
      };
    }

    if (e.row?.isNewRow) {
      switch (e.dataField) {
        case "Numero":
          e.editorOptions.readOnly = false;
          break;
        case "IndicadorMadeiraMacica":
          e.editorOptions.value = false;
          break;
        case "AgenteDeCargaNumero":
          e.editorOptions.value = this.agenteDeCarga.Numero;
          e.editorOptions.readOnly = true;
          break;
      }
    } else {
      switch (e.dataField) {
        case "Numero":
        case "AgenteDeCargaNumero":
          e.editorOptions.readOnly = true;
          break;
      }
    }
  }

  isEditVisible(e) {
    return true;
  }

  ValidaCnpj(e) {
    if (e.value.length >= 2 && e.value.substr(0, 2).toUpperCase() == "PP") {
      return true;
    } else {
      if (e.value.length == 11) {
        return cpf.isValid(e.value);
      } else if (e.value.length == 14) {
        return cnpj.isValid(e.value);
      }
    }
    return false;
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

    this.refreshGrid(this.curAgenteDeCarga);
  }

  OnEditSave(e: any) {
    this.dataGrid.instance.saveEditData().then(() => {
      if (!this.dataGrid.instance.hasEditData()) {
        // Saved successfully
      } else {
        // Saving failed
      }
    });
  }

  OnEditCancel(e: any) {
    this.dataGrid.instance.cancelEditData();
  }

  OnEditDelete(e: any) {
    this.dataGrid.instance.cancelEditData();
  }

  OnNCMValueChanged(e: any, cell) {
    console.log(e);
    cell.setValue(e.value);
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
}
