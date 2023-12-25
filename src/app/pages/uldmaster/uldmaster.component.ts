import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AdminLayoutComponent } from 'app/layouts/admin-layout/admin-layout.component';
import { AWBReference } from 'app/shared/lib';
import { ListaUldMasterRequest, MasterNumeroUldSumario, UldClient, UldMasterDeleteByIdInput, UldMasterDeleteByTagInput, UldMasterInsertRequest, UldMasterNumeroQuery, UldMasterNumeroQueryChildren, UldMasterResponseDto, UldMasterUpdateRequest, VooClient, VooListaResponseDto, VooListarInputDto, VooTrechoResponse } from 'app/shared/proxy/ctaapi';
import notify from 'devextreme/ui/notify';
import { environment } from 'environments/environment';
import { MasteruldsumarioComponent } from './components/masteruldsumario/masteruldsumario.component';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { FlightTypeEnum } from 'app/shared/collections/data';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
import * as _html2canvas from "html2canvas";
import { TotalParcialCollection } from 'app/shared/collections/data';
const html2canvas: any = _html2canvas;

@Component({
  selector: 'app-uldmaster',
  templateUrl: './uldmaster.component.html',
  styleUrls: ['./uldmaster.component.css']
})

export class UldmasterComponent implements OnInit {
  @ViewChild("gridContainer") dataGrid;
  @ViewChild("sumario") sumarioComponent: MasteruldsumarioComponent;
  @ViewChild("mainContent", { static: true }) mainContent!: ElementRef<HTMLImageElement>;

  curVooDetail: VooListaResponseDto;
  curTrecho: VooTrechoResponse = undefined;
  filtroDataVoo: Date;
  uldForm: UldMasterResponseDto;
  isPopupVisible: Boolean = false;
  firstTime: Boolean = true;
  newuldText: string;
  // Icones
  selectFiltro: any;
  refreshIcon: any;
  plusIcon: any;
  excelIcon: any;
  // Data Sources
  listaVoos: any = [];
  listaTrechos: VooTrechoResponse[] = [];
  activeSection: string = 'entry';
  public uldLista: UldMasterNumeroQuery[] = [];
  public summaryList: MasterNumeroUldSumario[] = [];
  pesoUnidade = [{
    "Codigo": "KGM"
  }, {
    "Codigo": "LBS"
  }];
  totalParcialData = TotalParcialCollection;
  flightTypeEnum = FlightTypeEnum;
  curVoo: number = -1;

  // Privados
  private awbref: AWBReference = new AWBReference();


  constructor(private vooClient: VooClient,
    private uldClient: UldClient,
    private parentComponent: AdminLayoutComponent) {

    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    this.uldLista = [];
    this.validarMasterNumero = this.validarMasterNumero.bind(this);
    this.ValidarUldCampo = this.ValidarUldCampo.bind(this);
    this.ValidarUld = this.ValidarUld.bind(this);
    this.AddRow = this.AddRow.bind(this);

    this.filtroDataVoo = new Date;
    this.refreshIcon = {
      icon: "refresh",
      hint: "Refresh",
      onClick: this.refreshGrid.bind(this)
    };

    this.plusIcon = {
      icon: "plus",
      hint: "Adicionar Master",
      onClick: this.AddRow.bind(this),
    };

    this.awbref = new AWBReference();
  }

  ngOnInit(): void {
    this.refreshListaVoos();
  }

  async refreshListaVoos() {
    this.filtroDataVoo.setSeconds(0);
    this.filtroDataVoo.setMinutes(0);
    this.filtroDataVoo.setHours(0);

    const input: VooListarInputDto = {
      DataVoo: this.filtroDataVoo,
    }

    this.listaVoos = []
    this.listaVoos.push({
      alignment: "left",
      text: 'Selecione o Voo',
      vooId: -1,
      data: undefined
    });
    this.curVoo = -1;

    this.curVooDetail = undefined;
    this.uldLista = [];
    this.listaTrechos = [];

    this.vooClient.listarVoosLista(input)
      .subscribe(res => {
        if (res.result.Sucesso) {
          if (res.result.Dados != null && res.result.Dados.length > 0) {
            this.mapearButtonGroup(res.result.Dados);
          }
        }
        else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout);
      });
  }

  async refreshGrid() {
    if (!this.curTrecho) return;
    this.uldLista = [];
    this.uldClient.listarUldMasterPorTrechoId(this.curTrecho.Id)
      .subscribe(res => {
        if (res.result.Sucesso) {
          this.uldLista = res.result.Dados;
        }
        else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout);
      });
  }

  mapearButtonGroup(dados: VooListaResponseDto[]) {
    if (dados == null) return;

    for (const i in dados) {
      this.listaVoos.push({
        icon: "airplane",
        alignment: "left",
        text: dados[i].Numero + ' - ' + dados[i].CiaAereaNome + ' - ' + this.flightTypeEnum[dados[i].FlightType],
        vooId: dados[i].VooId,
        data: dados[i],
      });
    }
  }

  onDataVooChanged(e) {
    this.filtroDataVoo = e.value;
    this.refreshListaVoos();
  }

  AddRow(e) {

    if (this.newuldText == undefined || this.newuldText == null)
      return;

    this.newuldText = this.newuldText.toUpperCase();

    if (this.ValidarUld(this.newuldText) == false)
      return;

    var idx = this.dataGrid.instance.getRowIndexByKey(this.newuldText);

    if (idx > -1) {
      if (!this.dataGrid.instance.isRowSelected(idx))
        this.dataGrid.instance.selectRowsByIndexes([idx]);

      return;
    }

    if (this.uldLista == undefined)
      this.uldLista = new Array<UldMasterNumeroQuery>();

    let item: UldMasterNumeroQuery = {
      ULDLinha: this.newuldText,
      ULDCaracteristicaCodigo: this.newuldText.substring(0, 3),
      ULDId: this.newuldText.substring(3, 8),
      ULDIdPrimario: this.newuldText.substring(8, 10),
      ULDs: [],
    }

    this.uldLista.push(item);
    this.dataGrid.instance.getVisibleRows();
  }

  CalcularPesoTotalGrid(rowData) {
    return rowData.ULDs.reduce((sum, current) => sum + current.Peso, 0);
  }

  CalcularPecasGrid(rowData) {
    return rowData.ULDs.reduce((sum, current) => sum + current.QuantidadePecas, 0);
  }

  onRowInserted(e) {
    e.data.AeroportoOrigem = e.data.AeroportoOrigem ? e.data.AeroportoOrigem.toUpperCase() : undefined;
    e.data.AeroportoDestino = e.data.AeroportoDestino ? e.data.AeroportoDestino.toUpperCase() : undefined;
    e.data.DescricaoMercadoria = e.data.DescricaoMercadoria ? e.data.DescricaoMercadoria.toUpperCase() : undefined;
    setTimeout(function () {
      e.component.addRow();
    }, 100);
  }

  onRowUpdated(e) {
    e.data.AeroportoOrigem = e.data.AeroportoOrigem ? e.data.AeroportoOrigem.toUpperCase() : undefined;
    e.data.AeroportoDestino = e.data.AeroportoDestino ? e.data.AeroportoDestino.toUpperCase() : undefined;
    e.data.DescricaoMercadoria = e.data.DescricaoMercadoria ? e.data.DescricaoMercadoria.toUpperCase() : undefined;
  }

  validarMasterNumero(e) {
    return this.awbref.ValidaMasterNumero(e.value);
  }

  async onRowInserting(e, item) {

    const newData: UldMasterNumeroQueryChildren = e.data;

    let insertRequests: UldMasterInsertRequest[] = new Array<UldMasterInsertRequest>();

    newData.MasterNumero = newData.MasterNumero.toUpperCase();
    newData.PesoUnidade = newData.PesoUnidade.toUpperCase();
    newData.TotalParcial = newData.TotalParcial.toLocaleUpperCase();
    newData.AeroportoOrigem = newData.AeroportoOrigem ? newData.AeroportoOrigem.toUpperCase() : undefined;
    newData.AeroportoDestino = newData.AeroportoDestino ? newData.AeroportoDestino.toUpperCase() : undefined;
    newData.DescricaoMercadoria = newData.DescricaoMercadoria ? newData.DescricaoMercadoria.toUpperCase() : undefined;

    const insertRequest: UldMasterInsertRequest = {
      MasterNumero: newData.MasterNumero,
      Peso: +newData.Peso,
      PesoUN: newData.PesoUnidade,
      QuantidadePecas: +newData.QuantidadePecas,
      UldCaracteristicaCodigo: item.ULDCaracteristicaCodigo,
      UldId: item.ULDId,
      UldIdPrimario: item.ULDIdPrimario,
      TrechoId: this.curTrecho.Id,
      TipoDivisao: newData.TotalParcial,
      Transferencia: newData.Transferencia,
      AeroportoOrigem: newData.AeroportoOrigem,
      AeroportoDestino: newData.AeroportoDestino,
      DescricaoMercadoria: newData.DescricaoMercadoria,
    }

    insertRequests.push(insertRequest);

    const isCanceled = new Promise((resolve, reject) => {

      if (!newData.MasterNumero || newData.MasterNumero.length < 11) {
        reject('Número do master invalido. O Master deve conter ao menos 11 caracteres!');
      } else if (!newData.PesoUnidade || newData.PesoUnidade.length < 3) {
        reject('Unidade do peso invalido. Utilize uma unidada na lista!')
      } else if (!newData.Peso || newData.Peso <= 0) {
        reject('O peso deve ser maior que 0.')
      } else if (!newData.QuantidadePecas || newData.QuantidadePecas <= 0) {
        reject('A quantidade deve ser maior que 0.')
      } else {

        this.uldClient.inserirUldMaster(insertRequests)
          .toPromise()
          .then(res => {
            if (res.result.Sucesso) {
              newData.UsuarioCriacao = res.result.Dados[0].UsuarioCriacao;
              newData.DataCricao = res.result.Dados[0].DataCricao;
              newData.Id = res.result.Dados[0].Id;
              newData.MasterId = res.result.Dados[0].MasterId;
              newData.AeroportoOrigem = res.result.Dados[0].AeroportoOrigem;
              newData.AeroportoDestino = res.result.Dados[0].AeroportoDestino;
              newData.DescricaoMercadoria = res.result.Dados[0].DescricaoMercadoria;
              resolve(false);
            }
            else {
              reject(res.result.Notificacoes[0].Mensagem);
            }
          })
          .catch(err => {
            reject(err);
          });
      }
    });

    e.cancel = isCanceled;

  }

  async onRowUpdating(e) {

    const newData: UldMasterNumeroQueryChildren = Object.assign(e.oldData, e.newData)
    const newDataUpdate: UldMasterNumeroQueryChildren = e.newData;

    newData.MasterNumero = newData.MasterNumero.toUpperCase();
    newData.PesoUnidade = newData.PesoUnidade.toUpperCase();
    newData.TotalParcial = newData.TotalParcial.toLocaleUpperCase();
    newData.AeroportoOrigem = newData.AeroportoOrigem ? newData.AeroportoOrigem.toUpperCase() : undefined;
    newData.AeroportoDestino = newData.AeroportoDestino ? newData.AeroportoDestino.toUpperCase() : undefined;
    newData.DescricaoMercadoria = newData.DescricaoMercadoria ? newData.DescricaoMercadoria.toUpperCase() : undefined;

    let updateRequests: UldMasterUpdateRequest[] = new Array<UldMasterUpdateRequest>();
    const updateRequest: UldMasterUpdateRequest = {
      Id: e.key,
      MasterNumero: newData.MasterNumero,
      Peso: newData.Peso,
      PesoUN: newData.PesoUnidade,
      QuantidadePecas: newData.QuantidadePecas,
      UldCaracteristicaCodigo: newData.UldCaracteristicaCodigo,
      UldId: newData.UldId,
      UldIdPrimario: newData.UldIdPrimario,
      TrechoId: this.curTrecho.Id,
      TipoDivisao: newData.TotalParcial,
      Transferencia: newData.Transferencia,
      AeroportoOrigem: newData.AeroportoOrigem,
      AeroportoDestino: newData.AeroportoDestino,
      DescricaoMercadoria: newData.DescricaoMercadoria,
    }

    updateRequests.push(updateRequest);

    const isCanceled = new Promise((resolve, reject) => {

      if (!newData.MasterNumero || newData.MasterNumero.length < 11) {
        reject('Número do master invalido. O Master deve conter ao menos 11 caracteres!');
      } else if (!newData.PesoUnidade || newData.PesoUnidade.length < 3) {
        reject('Unidade do peso invalido. Utilize uma unidada na lista!')
      } else if (!newData.Peso || newData.Peso <= 0) {
        reject('O peso deve ser maior que 0.')
      } else if (!newData.QuantidadePecas || newData.QuantidadePecas <= 0) {
        reject('A quantidade deve ser maior que 0.')
      } else {

        this.uldClient.atualizarUldMaster(updateRequests)
          .toPromise()
          .then(res => {
            if (res.result.Sucesso) {
              //if(newDataUpdate.MasterId)
              newDataUpdate.MasterId = res.result.Dados[0].MasterId;
              //if(newDataUpdate.AeroportoOrigem)
              newDataUpdate.AeroportoOrigem = res.result.Dados[0].AeroportoOrigem;
              //if(newDataUpdate.AeroportoDestino)
              newDataUpdate.AeroportoDestino = res.result.Dados[0].AeroportoDestino;
              //if(newDataUpdate.DescricaoMercadoria)
              newDataUpdate.DescricaoMercadoria = res.result.Dados[0].DescricaoMercadoria;
              resolve(false);
            }
            else {
              reject(res.result.Notificacoes[0].Mensagem);
            }
          })
          .catch(err => {
            reject(err);
          });
      }
    });

    e.cancel = isCanceled;
  }

  async onRowRemoving(e) {

    let input: UldMasterDeleteByIdInput = {
      TrechoId: this.curTrecho.Id,
      ListaIds: [e.key]
    }

    const isCanceled = new Promise((resolve, reject) => {

      this.uldClient.excluirUldMaster(input)
        .toPromise()
        .then(res => {
          if (res.result.Sucesso) {
            resolve(false);
          }
          else {
            reject(res.result.Notificacoes[0].Mensagem);
          }
        })
        .catch(err => {
          reject(err);
        });
    });

    e.cancel = isCanceled;
  }

  async onGridRowInserting(e) {
    console.log(e);
  }

  async onGridRowInserted(e) {
    console.log(e);
  }

  ValidarUldCampo(e) {
    return this.ValidarUld(e.value.toUpperCase());
  }

  ValidarUld(uld) {
    if (uld == 'BLK')
      return true;
    return /^([A-Z]{3}[0-9]{5}[A-Z0-9]{2})$/.test(uld)
  }

  onItemClick(e) {
    if (e.itemData.vooId == this.curVoo) return;
    this.curVoo = e.itemData.vooId;
    this.listaTrechos = [];
    this.curTrecho = undefined;
    this.uldLista = [];
    if (e.itemData.data.Trechos) {
      this.listaTrechos = e.itemData.data.Trechos;
      this.curTrecho = e.itemData.data.Trechos[0];
    }
    this.refreshGrid();
  }

  onTrechoItemClick(e) {
    if (e.itemData.Id == this.curTrecho.Id) return;
    this.curTrecho = e.itemData;
    this.refreshGrid();
  }

  onVisualizarSumario(e: any) {
    if (this.curVoo == -1) return;
    this.uldLista = [];
    let input: ListaUldMasterRequest = {
      vooId: this.curVooDetail.VooId
    }

    this.uldClient.listarMasterUldSumario(input)
      .subscribe(res => {
        if (res.result.Sucesso) {
          this.summaryList = res.result.Dados;
        }
        else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout);
      });
    this.activeSection = 'summary';
  }

  goBack() {
    this.activeSection = 'entry';
    this.parentComponent.scrollUp();
    this.refreshGrid();
  }

  async onGridRowRemoving(e: any) {

    e.cancel = true

    let removeData: UldMasterDeleteByTagInput = {
      ULDId: e.data.ULDId,
      ULDCaracteristicaCodigo: e.data.ULDCaracteristicaCodigo,
      ULDIdPrimario: e.data.ULDIdPrimario,
      VooId: this.curVoo
    }

    const res = await this.uldClient.excluirUld(removeData);
    return res.subscribe(() => false, () => true);

  }

  allowEdit(): boolean {
    return this.curVoo && this.curVooDetail?.SituacaoVoo != 2
  }

  public print(): void {

    var pdfw = this.mainContent.nativeElement.scrollWidth - 80;
    var pdfh = 3428 * (pdfw / 2400);

    const doc = new jsPDF({
      unit: 'px',
      format: [pdfw, pdfh] // -> A4 : [842, 1191] -> Letter
    });

    const pdf = new jsPDF('p', 'pt', 'a4');

    doc.html(this.mainContent.nativeElement, {
      margin: [40, 40, 40, 40],
      callback: (pdf: jsPDF) => {
        doc.save('pdf-export');
      }
    });
  }

  onInitNewRow(e) {
    e.data.Transferencia = false;
  }

  onContentReady(e: any) {

  }

}
