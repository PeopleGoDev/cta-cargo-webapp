import { Component, OnInit, ViewChild } from '@angular/core';
import { UsuariosService } from 'app/shared/services/usuarios.service';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import { CertificadoDigitalClient, CiaAereaClient, CiaAreaListaSimplesResponse, UserResetRequest, UsuarioClient, UsuarioInsertRequest, UsuarioResponseDto, UsuarioUpdateRequest } from 'app/shared/proxy/ctaapi';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})

export class UsuariosComponent implements OnInit {
  @ViewChild("dataGrid") dataGrid;
  usuarios: UsuarioResponseDto[];
  cias: CiaAreaListaSimplesResponse[];
  certificados: any[];
  loadingVisible: boolean = false;
  newrowBotao: boolean = false;
  private curgridKey: number = 0;
  buttonOptions = {
    text: "Resetar Senha",
    type: "normal",
    onClick: function (e) {
      let result = confirm("<i>Deseja realmente resetar a senha do usuário ?</i>", "Você tem certeza?");
      result.then((dialogResult) => {
        if (dialogResult) {
          this.resetPassword();
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

  constructor(private usuariosService: UsuariosService,
    private ciaAereaClient: CiaAereaClient,
    private certificadoDigitalClient: CertificadoDigitalClient,
    private usuarioClient: UsuarioClient) {
    this.onRowDelete = this.onRowDelete.bind(this);
    this.buttonOptions.onClick = this.buttonOptions.onClick.bind(this);
    this.buttonOptionsExcluir.onClick = this.buttonOptionsExcluir.onClick.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
  }

  ngOnInit(): void {
    const ciasObservable = this.ciaAereaClient.listarCiasAereasSimples();
    ciasObservable.subscribe((ciasData) => {
      this.cias = ciasData.result.Dados;
    }, err => {
      // Notificar erro
    });

    this.refreshCertificados();
    this.refreshLista();
  }

  async onRowUpdating(e: { oldData: any; newData: any; cancel: Promise<unknown>; }) {
    const newData: UsuarioResponseDto = Object.assign(e.oldData, e.newData)

    const updateRequest: UsuarioUpdateRequest = {
      UsuarioId: newData.UsuarioId,
      Account: newData.Account,
      Email: newData.Email,
      Nome: newData.Nome,
      Sobrenome: newData.Sobrenome,
      CompanhiaId: newData.CompanhiaId,
      AlteraCompanhia: newData.AlteraCompanhia,
      AcessoUsuarios: newData.AcessoUsuarios,
      AcessoClientes: newData.AcessoClientes,
      AcessoCompanhias: newData.AcessoCompanhias,
      Bloqueado: newData.Bloqueado
    };

    const isCanceled = new Promise((resolve, reject) => {
      this.usuarioClient.atualizarUsuario(updateRequest)
        .toPromise()
        .then(res => {
          if (res.result.Sucesso) {
            resolve(false);
          } else {
            reject(res.result.Notificacoes[0].Mensagem);
          }
        })
        .catch(err => {
          reject(err);
        });
    });

    e.cancel = isCanceled;
  }

  async onRowInserting(e: { data: UsuarioResponseDto; cancel: Promise<unknown> }) {
    const newData: UsuarioResponseDto = e.data;

    const insertRequest: UsuarioInsertRequest = {
      Nome: newData.Nome,
      Sobrenome: newData.Sobrenome,
      Email: newData.Email,
      Account: newData.Account,
      CompanhiaId: newData.CompanhiaId,
      AlteraCompanhia: newData.AlteraCompanhia,
      AcessoUsuarios: newData.AcessoUsuarios,
      AcessoClientes: newData.AcessoClientes,
      AcessoCompanhias: newData.AcessoCompanhias,
      CertificadoDigitalId: newData.CertificadoDigitalId
    };

    const isCanceled = new Promise((resolve, reject) => {
      this.usuarioClient.inserirUsuario(insertRequest)
        .toPromise()
        .then(res => {
          if (res.result.Sucesso) {
            resolve(false);
          } else {
            reject(res.result.Notificacoes[0].Mensagem);
          }
        })
        .catch(err => {
          reject(err);
        });
    });

    e.cancel = isCanceled;
  }

  async onRowDelete() {
    this.usuarioClient.excluirUsuario(this.curgridKey)
      .toPromise()
      .then(res => {
        if (res.result.Sucesso) {
          let item = this.usuarios.find(x => x.UsuarioId == this.curgridKey);
          var index = this.usuarios.indexOf(item);
          this.usuarios.splice(index, 1);
          this.dataGrid.instance.cancelEditData();
        } else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', 3000);
          this.dataGrid.instance.cancelEditData();
        }
      });

    let res = await this.usuariosService.Excluir(this.curgridKey);
  }

  resetPassword(_e: any) {
    this.dataGrid.instance.cancelEditData();

    const requestReset: UserResetRequest = {
      UserId: this.curgridKey
    };

    this.usuarioClient.resetarUsuario(requestReset)
      .toPromise()
      .then(res => {
        if (res.result.Sucesso) {
          notify(res.result.Dados, 'success', environment.ErrorTimeout);
        } else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
        }
      });
  }

  refreshLista() {
    this.usuarioClient.listarUsuarios()
      .toPromise()
      .then(res => {
        if (res.result.Sucesso) {
          this.usuarios = res.result.Dados;
        }
        else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
        }
      })
      .catch(err => {
        notify(err, 'error', environment.ErrorTimeout);
      });
  }

  onEditorPreparing(e: any): void {
    if (e.row?.isNewRow) {
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
        onClick: this.refreshLista.bind(this)
      }
    });
  }

  onRowPrepared(e) {
    if (e.rowType == 'data' && e.data.Bloqueado == true) {
      e.rowElement.style.color = 'red';
    }
  }

  refreshCertificados() {
    this.loadingVisible = true;

    this.certificadoDigitalClient.listarCertificadosDigitais()
      .subscribe(res => {
        if (res.result.Sucesso) {
          this.certificados = res.result.Dados.map(item => {
            return {
              id: item.Id,
              nome: `${item.NomeDono} | Vencimento: ${item.DataVencimento}`,
              expireDate: item.DataVencimento,
            }
          });
          this.loadingVisible = false;
        }
        else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', 3000);
          this.loadingVisible = false;
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout);
      });
  }

}
