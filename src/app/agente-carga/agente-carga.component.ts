import { Component, OnInit, ViewChild } from '@angular/core';
import { LocalFileDestinationMap } from 'app/shared/enum/api.enum';
import { AgenteDeCargaClient, AgenteDeCargaInsertRequest, AgenteDeCargaResponseDto, AgenteDeCargaUpdateRequest, FileDestinationMap, FileParameter, UploadClient, UsuarioInfoResponse } from 'app/shared/proxy/ctaapi';
import { LocalStorageService } from 'app/shared/services/localstorage.service';
import { CommonUtil } from 'app/shared/util/common';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-agente-carga',
  templateUrl: './agente-carga.component.html',
  styleUrls: ['./agente-carga.component.css']
})

export class AgenteCargaComponent implements OnInit {
  @ViewChild("dataGrid") dataGrid;
  @ViewChild("fileInput") fileInput;

  dataSource: AgenteDeCargaResponseDto[] = [];
  usuarioInfo: UsuarioInfoResponse;
  curfile: File;
  isPopup: boolean = false;
  loadingVisible: boolean = false;
  newrowBotao: boolean = false;
  arquivoErro: string = '';
  passwordButton: any;
  passwordMode: string;
  textBoxValue: string;
  currentKey: number;

  buttonOptions = {
    text: "Excluir",
    type: "danger",
    onClick: async function () {
      let result = confirm("<i>Você tem certeza?</i>", "Confima a Exclusão do Agente de Carga?");
      result.then((dialogResult) => {
        if (dialogResult) {
          this.onRowDelete();
        }
      });
    }
  };

  constructor(private localStorageService: LocalStorageService,
    private agenteCargaService: AgenteDeCargaClient,
    private uploadClient: UploadClient) {
    this.onClickCertificado = this.onClickCertificado.bind(this);
    this.passwordMode = "password";
    this.passwordButton = {
      icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAB7klEQVRYw+2YP0tcQRTFz65xFVJZpBBS2O2qVSrRUkwqYfUDpBbWQu3ELt/HLRQ/Q8RCGxVJrRDEwj9sTATxZ/Hugo4zL/NmV1xhD9xi59177pl9986fVwLUSyi/tYC+oL6gbuNDYtyUpLqkaUmfJY3a+G9JZ5J2JW1J2ivMDBSxeWCfeBxYTHSOWMcRYLOAEBebxtEVQWPASQdi2jgxro4E1YDTQIJjYM18hszGbew4EHNq/kmCvgDnHtI7YBko58SWgSXg1hN/btyFBM0AlwExczG1YDZrMS4uLUeUoDmgFfjLGwXEtG05wNXyTc4NXgzMCOAIGHD8q0ATuDZrempkwGJ9+AfUQ4K+A/eEseqZ/UbgdUw4fqs5vPeW+5mgBvBAPkLd8cPju+341P7D/WAaJGCdOFQI14kr6o/zvBKZYz11L5Okv5KGA89Kzu9K0b0s5ZXt5PjuOL6TRV5ZalFP4F+rrnhZ1Cs5vN6ijmn7Q162/ThZq9+YNW3MbfvDAOed5cxdGL+RFaUPKQtjI8DVAr66/u9i6+jJzTXm+HFEVqxVYBD4SNZNKzk109HxoycPaG0bIeugVDTp4hH2qdXJDu6xOAAWiuQoQdLHhvY1aEZSVdInG7+Q9EvSz9RrUKqgV0PP3Vz7gvqCOsUj+CxC9LB1Dc8AAAASdEVYdEVYSUY6T3JpZW50YXRpb24AMYRY7O8AAAAASUVORK5CYII=",
      type: "default",
      onClick: () => {
        this.passwordMode = this.passwordMode === "text" ? "password" : "text";
      }
    };
  }

  ngOnInit(): void {
    this.usuarioInfo = this.localStorageService.getLocalStore().UsuarioInfo;
    this.refreshLista();
  }

  async refreshLista() {
    this.loadingVisible = true;
    await this.agenteCargaService.listarAgentesDeCarga()
      .toPromise()
      .then(res => {
        if (res.result.Sucesso) {
          this.dataSource = res.result.Dados
        } else {
          this.dataSource = []
          notify(res.result.Notificacoes[0].Mensagem, 'error', 3000);
        }
        this.loadingVisible = false;
      },
        err => {
          this.dataSource = []
          this.loadingVisible = false;
          notify(err, 'error', environment.ErrorTimeout)
        })
  }

  async onRowInserting(e: any) {

    e.cancel = true;

    const newData: AgenteDeCargaResponseDto = e.data;

    const insertRequest: AgenteDeCargaInsertRequest = {
      Nome: newData.Nome,
      CNPJ: newData.CNPJ,
      Endereco1: newData.Endereco1,
      Endereco2: newData.Endereco2,
      Cidade: newData.Cidade,
      Estado: newData.Estado,
      Pais: newData.Pais,
      Numero: newData.Numero,
    };

    await this.agenteCargaService.inserirAgenteDeCarga(insertRequest)
      .toPromise()
      .then(res => {
        if (res.result.Sucesso) {
          this.dataSource.push(res.result.Dados);
          this.dataGrid.instance.cancelEditData();
        } else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', 3000);
          this.dataGrid.instance.cancelEditData();
        }
      }, err => {
        notify(err, 'error', 3000);
      });

  }

  async onRowUpdating(e) {
    e.cancel = true;

    const newData: AgenteDeCargaResponseDto = Object.assign(e.oldData, e.newData)

    const updateRequest: AgenteDeCargaUpdateRequest = {
      AgenteDeCargaId: newData.AgenteDeCargaId,
      Nome: newData.Nome,
      CNPJ: newData.CNPJ,
      Endereco1: newData.Endereco1,
      Endereco2: newData.Endereco2,
      Cidade: newData.Cidade,
      Estado: newData.Estado,
      Pais: newData.Pais,
      Numero: newData.Numero,
    }

    await this.agenteCargaService.atualizarAgenteDeCarga(updateRequest)
      .toPromise()
      .then(res => {
        if (res.result.Sucesso) {
          this.dataGrid.instance.cancelEditData();
          let item = this.dataSource.find(x => { x.AgenteDeCargaId == res.result.Dados.AgenteDeCargaId })
          item = res.result.Dados;

        } else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', 3000);
        }
      },
        err => {
          notify(err, 'error', 3000);
        });
  }

  async onRowDelete() {

    await this.agenteCargaService.excluirAgenteDeCarga(this.currentKey)
      .toPromise()
      .then(res => {
        if (res.result.Sucesso) {
          let item = this.dataSource.find(x => x.AgenteDeCargaId == this.currentKey);
          var index = this.dataSource.indexOf(item);
          this.dataSource.splice(index, 1);
          this.dataGrid.instance.cancelEditData();
        }
        else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', 3000);
        }
      })
      .catch( err => {
        notify(err, 'error', 3000);
      });
  }

  onEditorPreparing(e: any): void {
    if (e.dataField == "Nome" && e.parentType == "dataRow") {
      this.newrowBotao = !e.row?.isNewRow;
      this.currentKey = e.row.key;
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

  //#region Upload File Methods
  onClickCertificado(e: any) {
    this.currentKey = e.row.key;
    this.curfile = undefined;
    if (this.fileInput) this.fileInput.nativeElement.value = "";
    this.isPopup = true;
  }

  onClickSelecionarCertificado() {
    this.fileInput.nativeElement.click();
  }

  onFilesAdded() {
    if (this.fileInput.nativeElement.files[0] != undefined) {
      var id = this.fileInput.nativeElement.files[0].name;
      var extensao = id.substr(id.length - 4).toUpperCase();
      if (extensao == '.PFX') {
        this.curfile = this.fileInput.nativeElement.files[0] == undefined ? undefined : this.fileInput.nativeElement.files[0];
        this.arquivoErro = "";
      }
      else {
        this.curfile = undefined;
        this.arquivoErro = "Apenas arquivos PFX são aceitos!";
      }
    }
  }

  onClickEnviarCertificado(e: any) {
    this.EnviarArquivo();
    this.isPopup = false;
  }

  EnviarArquivo() {

    this.loadingVisible = true;

    let fileInfo: FileParameter = {
      fileName: this.curfile.name,
      data: this.curfile
    }

    this.uploadClient.uploadCertificadoDigital(
      this.currentKey,
      this.textBoxValue,
      LocalFileDestinationMap.AgenteDeCarga,
      fileInfo).toPromise()
      .then((res: any) => {
        if (res.result.Sucesso) {
          let item = this.dataSource.find( x => x.AgenteDeCargaId == this.currentKey)
          item.ArquivoCertificado = res.result.Dados.NomeArquivo;
          item.DataExpiracaoCertificado = res.result.Dados.DataVencimento
          this.loadingVisible = false;
          notify(`Arquivo ${this.curfile.name} enviado com Sucesso!`, "success")
        }
        else {
          this.loadingVisible = false;
          notify(res.result.Notificacoes[0].Mensagem, 'error', 3000)
        }
      })
      .catch(err => {
        this.loadingVisible = false;
        notify(err, 'error', 3000)
      });

  }
  //#endregion

  onFieldDataChanged(e: any) {
    this.loadingVisible = true;
  }
  
  validaCnpj(e) {
    return CommonUtil.validaCnpj(e.value);
  }

}
