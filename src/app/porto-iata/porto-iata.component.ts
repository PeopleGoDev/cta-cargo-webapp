import { Component, OnInit, ViewChild } from '@angular/core';
import { UsuarioLoginInfo } from 'app/shared/model/usuarioinfo';
import { LocalStorageService } from 'app/shared/services/localstorage.service';
import { PortoIATAService } from 'app/shared/services/portoiata.service';
import { environment } from 'environments/environment';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import { PortoIATAInsertRequestDto, PortoIATAResponseDto, PortoIATAUpdateRequestDto } from 'app/shared/model/dto/portoiatadto';
import { UsuarioInfoResponse } from 'app/shared/proxy/ctaapi';

@Component({
  selector: 'app-porto-iata',
  templateUrl: './porto-iata.component.html',
  styleUrls: ['./porto-iata.component.css']
})
export class PortoIataComponent implements OnInit {
  @ViewChild("dataGrid") dataGrid
  portos: PortoIATAResponseDto[] = []
  loadingVisible: boolean = false
  botaoExcluirVisivel: boolean = false
  currentKey: number = 0
  private usuarioInfo: UsuarioInfoResponse;

  constructor(private portoIATAService: PortoIATAService,
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

    this.loadingVisible = true;

    let empId: number = +this.usuarioInfo.EmpresaId;

    let res = await this.portoIATAService.listar(empId);

    if (res.Sucesso) {

      this.portos = res.Dados;
    }
    else {

      notify(res.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);

    }

    this.loadingVisible = false;
  }

  async onRowInserting(e: any) {

    e.cancel = true

    let newData: PortoIATAResponseDto = e.data

    let insertData: PortoIATAInsertRequestDto = new PortoIATAInsertRequestDto();

    insertData.Codigo = newData.Codigo.toUpperCase()
    insertData.Nome = newData.Nome.toUpperCase()
    insertData.EmpresaId = +this.usuarioInfo.EmpresaId
    insertData.UsuarioInsercaoId = +this.usuarioInfo.UsuarioId

    let res = await this.portoIATAService.inserir(insertData)

    if (res.Sucesso) {

      this.portos.push(res.Dados);

      this.dataGrid.instance.cancelEditData();

    }
    else {

      notify(res.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);

    }
  }

  async onRowUpdating(e: any) {

    this.loadingVisible = true;

    e.cancel = true;

    const newData: PortoIATAResponseDto = Object.assign(e.oldData, e.newData)

    const updateData: PortoIATAUpdateRequestDto = new PortoIATAUpdateRequestDto()

    updateData.PortoIATAId = newData.PortoId
    updateData.UsuarioModificadorId = +this.usuarioInfo.UsuarioId
    updateData.Nome = newData.Nome.toUpperCase()

    let res = await this.portoIATAService.atualizar(updateData);

    if (res.Sucesso) {

      for (var i in this.portos) {

        if (this.portos[i].PortoId == newData.PortoId) {

          this.portos[i] = res.Dados;

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
