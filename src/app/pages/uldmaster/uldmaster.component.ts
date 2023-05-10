import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AdminLayoutComponent } from 'app/layouts/admin-layout/admin-layout.component';
import { AWBReference } from 'app/shared/lib';
import { ListaUldMasterRequest, MasterNumeroUldSumario, UldClient, UldMasterDeleteByIdInput, UldMasterDeleteByTagInput, UldMasterInsertRequest, UldMasterNumeroQuery, UldMasterResponseDto, UldMasterUpdateRequest, UsuarioInfoResponse, VooClient, VooListaResponseDto, VooListarInputDto } from 'app/shared/proxy/ctaapi';
import { LocalStorageService } from 'app/shared/services/localstorage.service';
import notify from 'devextreme/ui/notify';
import { environment } from 'environments/environment';
import { MasteruldsumarioComponent } from './components/masteruldsumario/masteruldsumario.component';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
import * as _html2canvas from "html2canvas";
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

  curVoo: VooListaResponseDto;
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
  botoesGBItems: any = [];
  activeSection: string = 'entry';
  public uldLista: UldMasterNumeroQuery[] = [];
  public summaryList: MasterNumeroUldSumario[] = [];
  // Privados
  private usuarioInfo: UsuarioInfoResponse;
  private awbref: AWBReference = new AWBReference();


  constructor(private localStorageService: LocalStorageService,
    private vooClient: VooClient,
    private uldClient: UldClient,
    private parentComponent: AdminLayoutComponent) {

    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    this.uldLista = [];
    this.ValidarMasterNumero = this.ValidarMasterNumero.bind(this);
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
    this.usuarioInfo = this.localStorageService.getLocalStore().UsuarioInfo;
    this.refreshListaVoos();
  }

  async refreshListaVoos() {
    this.filtroDataVoo.setSeconds(0);
    this.filtroDataVoo.setMinutes(0);
    this.filtroDataVoo.setHours(0);

    const input: VooListarInputDto = {
      DataVoo: this.filtroDataVoo,
    }

    this.curVoo = undefined;
    this.uldLista = [];
    this.botoesGBItems = [];

    this.vooClient.listarVoosLista(input)
      .subscribe(res => {
        if (res.result.Sucesso) {
          if (res.result.Dados != null && res.result.Dados.length > 0) {
            this.botoesGBItems = this.mapearButtonGroup(res.result.Dados);
            this.curVoo = res.result.Dados[0];
            this.refreshGrid();
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
    if (this.curVoo.VooId == -1) return;
    this.uldLista = [];
    this.uldClient.listarUldMasterPorVooId(this.curVoo.VooId)
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
    setTimeout(function () {
      e.component.addRow();
    }, 100);
  }

  ValidarMasterNumero(e) {
    return this.awbref.ValidaMasterNumero(e.value);
  }

  async onRowInserting(e, item) {

    const newData: UldMasterResponseDto = e.data;

    let insertRequests: UldMasterInsertRequest[] = new Array<UldMasterInsertRequest>();

    const insertRequest: UldMasterInsertRequest = {
      EmpresaId: +this.usuarioInfo.EmpresaId,
      MasterNumero: newData.MasterNumero,
      Peso: +newData.Peso,
      QuantidadePecas: +newData.QuantidadePecas,
      UldCaracteristicaCodigo: item.ULDCaracteristicaCodigo,
      UldId: item.ULDId,
      UldIdPrimario: item.ULDIdPrimario,
      UsuarioId: +this.usuarioInfo.UsuarioId,
      VooId: this.curVoo.VooId,
    }

    insertRequests.push(insertRequest);

    const res = await this.uldClient.inserirUldMaster(insertRequests)
    return res.subscribe(() => false, () => true);

  }

  async onRowUpdating(e) {

    const newData: UldMasterResponseDto = Object.assign(e.oldData, e.newData)

    let updateRequests: UldMasterUpdateRequest[] = new Array<UldMasterUpdateRequest>();
    const updateRequest: UldMasterUpdateRequest = {
      MasterNumero: newData.MasterNumero,
      Peso: newData.Peso,
      QuantidadePecas: newData.QuantidadePecas,
      UldCaracteristicaCodigo: newData.UldCaracteristicaCodigo,
      UldId: newData.UldId,
      UldIdPrimario: newData.UldIdPrimario,
      UsuarioId: +this.usuarioInfo.UsuarioId,
      VooId: this.curVoo.VooId,
      Id: newData.Id,
    }

    updateRequests.push(updateRequest);

    const res = await this.uldClient.atualizarUldMaster(updateRequests);
    return res.subscribe(() => false, () => true);
  }

  async onRowRemoving(e) {

    let input: UldMasterDeleteByIdInput = {
      VooId: this.curVoo.VooId,
      ListaIds: [e.key]
    }
    const res = await this.uldClient.excluirUldMaster(input)
    return res.subscribe(() => false, () => true);
  
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
    if (e.itemData.vooid == this.curVoo.VooId) return;
    this.curVoo = e.itemData.data;
    this.refreshGrid();
  }

  onVisualizarSumario(e: any) {
    if (this.curVoo.VooId == -1) return;
    this.uldLista = [];
    let input: ListaUldMasterRequest = {
      vooId: this.curVoo.VooId
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
      VooId: this.curVoo.VooId
    }

    const res = await this.uldClient.excluirUld(removeData);
    return res.subscribe(() => false, () => true);

  }

  allowEdit(): boolean {
    return this.curVoo && this.curVoo.SituacaoVoo != 2
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

}
