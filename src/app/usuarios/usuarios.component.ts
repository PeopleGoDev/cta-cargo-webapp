import { Component, OnInit, ViewChild } from '@angular/core';
import { CiaAereaUsuario } from 'app/shared/model/ciaaereausuario';
import { CiaAereaSimplesResponseDto } from 'app/shared/model/dto/ciaaereadto';
import { UsuarioInsertDto, UsuarioResponseDto, UsuarioUpdateDto, UsuarioResetDto } from 'app/shared/model/dto/usuariodto';
import { Result } from 'app/shared/model/result';
import { CiaaereaService } from 'app/shared/services/ciaaerea.service';
import { UsuariosService } from 'app/shared/services/usuarios.service';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import { CertificadoService } from 'app/shared/services/certificado.service';
import { CertificadoDigitalResponseDto } from 'app/shared/model/dto/certificadodigitaldto';
import { LocalStorageService } from 'app/shared/services/localstorage.service';
import { UsuarioInfoResponse } from 'app/shared/proxy/ctaapi';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})

export class UsuariosComponent implements OnInit {
  @ViewChild("dataGrid") dataGrid;
  usuarios: UsuarioResponseDto[];
  cias: CiaAereaSimplesResponseDto[];
  certificados: any[];
  loadingVisible: boolean = false;
  private empresaId: number = 1;
  private usuarioId: number = 2;
  newrowBotao: boolean = false;
  private curgridKey: number = 0;
  buttonOptions = {
    text: "Resetar Senha",
    type: "normal",
    onClick: function (e) {
      let result = confirm("<i>Deseja realmente resetar a senha do usuário ?</i>", "Você tem certeza?");
      result.then((dialogResult) => {
        if (dialogResult) {
          this.ResetarSenha();
        }
      });
    }
  };
  buttonOptionsExcluir = {
    text: "Excluir",
    type: "danger",
    onClick: function (e) {
      let result = confirm("<i>Confima a exclusão do usuário ?</i>", "Você tem certeza?");
      result.then((dialogResult) => {
        if (dialogResult) {
          this.onRowDelete();
        }
      });
    }
  };
  private usuarioInfo: UsuarioInfoResponse;

  constructor(private usuariosService: UsuariosService,
    private ciasService: CiaaereaService,
    private localstorageService: LocalStorageService,
    private certificadoService: CertificadoService) { 
      this.onRowDelete = this.onRowDelete.bind(this);
      this.buttonOptions.onClick = this.buttonOptions.onClick.bind(this);
      this.buttonOptionsExcluir.onClick = this.buttonOptionsExcluir.onClick.bind(this);
      this.ResetarSenha = this.ResetarSenha.bind(this);
    }

  ngOnInit(): void {

    this.usuarioInfo = this.localstorageService.getLocalStore().UsuarioInfo;
    
    const ciasObservable = this.ciasService.ListarSimples(this.usuarioInfo.EmpresaId);
    ciasObservable.subscribe((ciasData: Result<CiaAereaSimplesResponseDto[]>) => {
      this.cias = ciasData.Dados;
    }, err => {
      // Notificar erro
    });

    this.RefreshCertificados();
    this.RefreshLista();

  }

  async onRowUpdating(e) {
    e.cancel = true;
    this.dataGrid.instance.cancelEditData();
    const item = this.cias.find(x => x.CiaId == e.key);
    const newData: UsuarioResponseDto = Object.assign(e.oldData, e.newData)

    const updateRequest: UsuarioUpdateDto = new UsuarioUpdateDto(
      newData.UsuarioId,
      newData.Nome,
      newData.Sobrenome,
      newData.CompanhiaId,
      newData.AlteraCompanhia,
      newData.AcessoUsuarios,
      newData.AcessoClientes,
      newData.AcessoCompanhias,
      newData.Bloqueado,
      this.usuarioInfo.UsuarioId
    );

    updateRequest.CertificadoDigitalId = newData.CertificadoDigitalId == null ? null: newData.CertificadoDigitalId;

    let res = await this.usuariosService.Atualizar(updateRequest);

    if (res.Sucesso) {
      // Atualiza o item da lista de Cia Aéreas
      for (var i in this.usuarios) {
        if (this.usuarios[i].UsuarioId == newData.UsuarioId) {
          this.usuarios[i] = res.Dados;
          break;
        }
      }
    }
    else {
      notify(res.Notificacoes[0].Mensagem, 'error', 3000);
    }

  }

  async onRowInserting(e) {
    e.cancel = true;

    const newData: UsuarioResponseDto = e.data;

    const insertRequest: UsuarioInsertDto = new UsuarioInsertDto(
      this.usuarioInfo.EmpresaId,
      newData.Nome,
      newData.Sobrenome,
      newData.Email,
      newData.CompanhiaId,
      newData.AlteraCompanhia,
      newData.AcessoUsuarios,
      newData.AcessoClientes,
      newData.AcessoCompanhias,
      this.usuarioInfo.UsuarioId
    );
    insertRequest.CertificadoDigitalId = newData.CertificadoDigitalId == null ? null: newData.CertificadoDigitalId;

    let res = await this.usuariosService.Inserir(insertRequest);

    if (res.Sucesso) {
      // Atualiza o item da lista de Cia Aéreas
      this.usuarios.push(res.Dados);
      this.dataGrid.instance.cancelEditData();
    }
    else {
      notify(res.Notificacoes[0].Mensagem, 'error', 3000);
      this.dataGrid.instance.cancelEditData();
    }
  }

  async onRowDelete() {

    let res = await this.usuariosService.Excluir(this.curgridKey);

    if (res.Sucesso) {
      // Atualiza o item da lista de Cia Aéreas
      let item = this.usuarios.find(x => x.UsuarioId == this.curgridKey);
      var index = this.usuarios.indexOf(item);
      this.usuarios.splice(index, 1);
      this.dataGrid.instance.cancelEditData();
    }
    else {
      notify(res.Notificacoes[0].Mensagem, 'error', 3000);
      this.dataGrid.instance.cancelEditData();
    }
  }

  async ResetarSenha(e) {
    this.dataGrid.instance.cancelEditData();
    this.loadingVisible = true;
    const resetUsuario: UsuarioResetDto = new UsuarioResetDto(this.curgridKey);

    let res = await this.usuariosService.Resetar(resetUsuario);

    if (res.Sucesso) {
      this.loadingVisible = false;
      notify(res.Dados, 'success', 3000);
    }
    else {
      this.loadingVisible = false;
      notify(res.Notificacoes[0].Mensagem, 'error', 3000);
    }
  }

  RefreshLista() {
    this.loadingVisible = true;

    let res = this.usuariosService.Listar(this.usuarioInfo.EmpresaId)
      .subscribe(
        data => {
          if (data.Sucesso) {
            this.usuarios = data.Dados;
            // Atualiza Dados
          }
          else {
            notify(data.Notificacoes[0].Mensagem, 'error', 3000);
          }
          this.loadingVisible = false;
        },
        err => {
          notify(err, 'error', 3000);
          this.loadingVisible = false;
        }, () => {
          this.loadingVisible = false;
        }
      );
  }

  onEditorPreparing(e: any): void {
    if (e.row?.isNewRow) {
      // supress botão excluir e campo bloqueado
      if (e.dataField == "Nome" && e.parentType == "dataRow") {
        this.newrowBotao = false;
      }
      if (e.dataField == "AlteraCompanhia" && e.parentType == "dataRow") {
        e.editorOptions.value = false;
      }
      if (e.dataField == "AcessoUsuarios" && e.parentType == "dataRow") {
        e.editorOptions.value = false;
      }
      if (e.dataField == "AcessoClientes" && e.parentType == "dataRow") {
        e.editorOptions.value = false;
      }
      if (e.dataField == "AcessoCompanhias" && e.parentType == "dataRow") {
        e.editorOptions.value = false;
      }
      
    }
    else {
      if (e.dataField == "Nome" && e.parentType == "dataRow") {
        this.newrowBotao = true;
        this.curgridKey = e.row.key;
      }
    }
  }

  onToolbarPreparing(e) {
    e.toolbarOptions.items.unshift({
      location: 'after',
      widget: 'dxButton',
      options: {
        icon: "refresh",
        onClick: this.RefreshLista.bind(this)
      }
    });
  }

  onRowPrepared(e) {
    if (e.rowType == 'data' && e.data.Bloqueado == true) {
      e.rowElement.style.color = 'red';
    }
  }

  async RefreshCertificados() {

    this.loadingVisible = true;

    const res = await this.certificadoService.Listar(this.usuarioInfo.EmpresaId);

    if (res.Sucesso) {
      this.certificados = res.Dados.map(item => {
        return {
          id: item.Id,
          nome: `${item.NomeDono} | Vencimento: ${item.DataVencimento}`,
          expireDate: item.DataVencimento,
        }
      });
      this.loadingVisible = false;
    }
    else {
      notify(res.Notificacoes[0].Mensagem, 'error', 3000);
      this.loadingVisible = false;
    }

  }

}
