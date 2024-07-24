import { Component, OnInit, ViewChild } from '@angular/core';
import { UsuarioLoginInfo } from 'app/shared/model/usuarioinfo';
import { LocalStorageService } from 'app/shared/services/localstorage.service';
import { PortoIATAService } from 'app/shared/services/portoiata.service';
import { environment } from 'environments/environment';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import { PortoIATAInsertRequestDto, PortoIATAResponseDto, PortoIATAUpdateRequestDto } from 'app/shared/model/dto/portoiatadto';
import { PortoIATAClient, PortoIataInsertRequestDto, PortoIataResponseDto, PortoIataUpdateRequestDto, UsuarioInfoResponse } from 'app/shared/proxy/ctaapi';

@Component({
  selector: 'app-porto-iata',
  templateUrl: './porto-iata.component.html',
  styleUrls: ['./porto-iata.component.css']
})
export class PortoIataComponent implements OnInit {
  @ViewChild("dataGrid") dataGrid
  portos: PortoIataResponseDto[] = []
  loadingVisible: boolean = false
  botaoExcluirVisivel: boolean = false
  currentKey: number = 0
  private usuarioInfo: UsuarioInfoResponse;

  constructor(private portoIATAService: PortoIATAService,
    private portoIataClient: PortoIATAClient,
    private localstorageService: LocalStorageService) {

    this.onCancelEditor = this.onCancelEditor.bind(this)
    this.onSaveEditor = this.onSaveEditor.bind(this)
    this.onDeleteEditor = this.onDeleteEditor.bind(this)
    this.onRowDeleting = this.onRowDeleting.bind(this)

  }

  ngOnInit(): void {
    this.usuarioInfo = this.localstorageService.getLocalStore().UsuarioInfo;
    this.refresh()
  }

  onToolbarPreparing(e: any) {
    e.toolbarOptions.items.unshift({
      location: 'after',
      widget: 'dxButton',
      options: {
        icon: "refresh",
        onClick: this.refresh.bind(this)
      }
    });
  }

  onEditorPreparing(e: any) {

    if (e.row?.isNewRow) {

      this.botaoExcluirVisivel = false

      if (e.parentType == "dataRow" && e.dataField == "Codigo") {

        e.editorOptions.readOnly = false

      }

      return

    }

    this.botaoExcluirVisivel = true

    if (e.parentType == "dataRow" && e.dataField == "Codigo") {

      this.currentKey = e.row.key;

      e.editorOptions.readOnly = true

    }

  }

  async refresh() {
    await this.portoIataClient.listarPortosIATA()
      .subscribe(res => {
        if (res.result.Sucesso) {
          this.portos = res.result.Dados;
        } else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout);
      })
  }

  async onRowInserting(e: any) {
    let newData: PortoIataResponseDto = e.data

    newData.Codigo = newData.Codigo.toLocaleUpperCase();
    newData.Nome = newData.Nome.toLocaleUpperCase();
    newData.CountryCode = newData.CountryCode.toLocaleUpperCase();

    const insertData: PortoIataInsertRequestDto = {
      Codigo: newData.Codigo,
      Nome: newData.Nome,
      CountryCode: newData.CountryCode
    }

    const isCanceled = new Promise((resolve, reject) => {
      this.portoIataClient.inserirPortoIATA(insertData)
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

  async onRowUpdating(e: any) {


    let newDataChange: PortoIataResponseDto = e.newData;
    if (newDataChange.Nome)
      newDataChange.Nome = newDataChange.Nome.toLocaleUpperCase();
    if (newDataChange.CountryCode)
      newDataChange.CountryCode = newDataChange.CountryCode.toLocaleUpperCase();

    let newData: PortoIataResponseDto = Object.assign(e.oldData, newDataChange);

    const updatetData: PortoIataUpdateRequestDto = {
      PortoIataId: newData.PortoId,
      Nome: newData.Nome,
      CountryCode: newData.CountryCode,
    }

    const isCanceled = new Promise((resolve, reject) => {
      this.portoIataClient.atualizarPortoIATA(updatetData)
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

  async onRowDeleting(e: any) {

    this.loadingVisible = true;

    let res = await this.portoIATAService.excluir(this.currentKey);

    if (res.Sucesso) {

      let item = this.portos.find(x => x.PortoId == this.currentKey);

      var index = this.portos.indexOf(item);

      this.portos.splice(index, 1);

      this.loadingVisible = false;

      this.dataGrid.instance.cancelEditData();

    }
    else {

      this.loadingVisible = false;

      notify(res.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);

    }
  }

  onSaveEditor(e: any) {

    this.dataGrid.instance.saveEditData().then(() => {

      if (!this.dataGrid.instance.hasEditData()) {
        // Saved successfully
      } else {
        // Saving failed
      }

    });

  }

  onCancelEditor(e: any) {

    this.dataGrid.instance.cancelEditData()

  }

  onDeleteEditor(e: any) {

    let result = confirm("<i>Confirma Exclusão do Porto IATA ?</i>", "Confirma?");

    result.then((dialogResult) => {

      if (dialogResult) {

        this.onRowDeleting(e);

      }

    });
  }

}
