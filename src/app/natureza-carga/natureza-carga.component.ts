import { Component, OnInit, ViewChild } from '@angular/core';
import { NaturezaCargaInsertRequestDto, NaturezaCargaResponseDto, NaturezaCargaUpdateRequestDto } from 'app/shared/model/dto/naturezaoperacaodto';
import { UsuarioLoginInfo } from 'app/shared/model/usuarioinfo';
import { LocalStorageService } from 'app/shared/services/localstorage.service';
import { NaturezaCargaService } from 'app/shared/services/naturezacarga.service';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import { environment } from 'environments/environment';
import { UsuarioInfoResponse } from 'app/shared/proxy/ctaapi';

@Component({
  selector: 'app-natureza-carga',
  templateUrl: './natureza-carga.component.html',
  styleUrls: ['./natureza-carga.component.css']
})
export class NaturezaCargaComponent implements OnInit {

  @ViewChild("dataGrid") dataGrid
  naturezas: NaturezaCargaResponseDto[] = []
  loadingVisible: boolean = false
  botaoExcluirVisivel: boolean = false
  currentKey: number = 0
  private usuarioInfo: UsuarioInfoResponse

  constructor(private naturezaCargaService: NaturezaCargaService,
    private localstorageService: LocalStorageService) {

    this.onCancelEditor = this.onCancelEditor.bind(this)
    this.onSaveEditor = this.onSaveEditor.bind(this)
    this.onDeleteEditor = this.onDeleteEditor.bind(this)
    this.onRowDeleting = this.onRowDeleting.bind(this)

  }

  ngOnInit(): void {
    this.usuarioInfo = this.localstorageService.getLocalStore().UsuarioInfo
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

    this.loadingVisible = true;
    let res = await this.naturezaCargaService.listar();

    if (res.Sucesso) {

      this.naturezas = res.Dados;
    }
    else {

      notify(res.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);

    }

    this.loadingVisible = false;
  }

  async onRowInserting(e: any) {

    e.cancel = true

    let newData: NaturezaCargaResponseDto = e.data

    let insertData: NaturezaCargaInsertRequestDto = new NaturezaCargaInsertRequestDto();

    insertData.Codigo = newData.Codigo.toUpperCase()
    insertData.Descricao = newData.Descricao.toUpperCase()

    let res = await this.naturezaCargaService.inserir(insertData)

    if (res.Sucesso) {

      this.naturezas.push(res.Dados);

      this.dataGrid.instance.cancelEditData();

    }
    else {

      notify(res.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);

    }
  }

  async onRowUpdating(e: any) {

    this.loadingVisible = true;

    e.cancel = true;

    const newData: NaturezaCargaResponseDto = Object.assign(e.oldData, e.newData)

    const updateData: NaturezaCargaUpdateRequestDto = new NaturezaCargaUpdateRequestDto()

    updateData.NaturezaCargaId= newData.NaturezaCargaId
    updateData.Descricao = newData.Descricao.toUpperCase()

    let res = await this.naturezaCargaService.atualizar(updateData);

    if (res.Sucesso) {

      for (var i in this.naturezas) {

        if (this.naturezas[i].NaturezaCargaId == newData.NaturezaCargaId) {

          this.naturezas[i] = res.Dados;

          break;

        }

      }

      this.loadingVisible = false;

      this.dataGrid.instance.cancelEditData();

    }
    else {

      this.loadingVisible = false;

      notify(res.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);

    }

  }

  async onRowDeleting(e: any) {

    this.loadingVisible = true;

    let res = await this.naturezaCargaService.excluir(this.currentKey);

    if (res.Sucesso) {

      let item = this.naturezas.find(x => x.NaturezaCargaId == this.currentKey);

      var index = this.naturezas.indexOf(item);

      this.naturezas.splice(index, 1);
      
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

    let result = confirm("<i>Confirma Exclusão da Natureza de Carga ?</i>", "Confirma?");

    result.then((dialogResult) => {

      if (dialogResult) {

        this.onRowDeleting(e);

      }

    });
  }

}
