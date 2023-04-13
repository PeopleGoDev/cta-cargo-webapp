import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastService } from 'angular-toastify';
import { StatusVoo } from 'app/shared/model/statusvoo';
import { AgenteDeCargaClient, AgenteDeCargaListaSimplesResponse, HouseClient, HouseListarRequest, HouseResponseDto, UsuarioInfoResponse } from 'app/shared/proxy/ctaapi';
import { LocalStorageService } from 'app/shared/services/localstorage.service';
import { StatusService } from 'app/shared/services/status.service';
import { DxPopupComponent } from 'devextreme-angular';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-receita-federal-house',
  templateUrl: './receita-federal-house.component.html',
  styleUrls: ['./receita-federal-house.component.css']
})
export class ReceitaFederalHouseComponent implements OnInit {
  @ViewChild("popconfirm") popUpConfirm: DxPopupComponent;
  
  curAgenteDeCarga: number = -1;
  botaoUploadEnabled: boolean = false;
  dataHouse: HouseResponseDto[] = [];
  statusData: StatusVoo[];
  filtroDataProcessamento: Date = undefined;
  usuarioInfo: UsuarioInfoResponse;
  statusRFB: StatusVoo[] = [];
  botoesGBItems: any = [];
  refreshIcon = {
    icon: "refresh",
    hint: "Refresh",
    onClick: this.refreshGridIcon.bind(this)
  };
  private apiVersion: string = '1';

  constructor(private houseClient: HouseClient,
    private agenteDeCargaClient: AgenteDeCargaClient,
    private localStorageService: LocalStorageService,
    private statusService: StatusService,
    private toastService: ToastService) {
    this.statusRFB = this.statusService.getStatusRFB();
  }

  ngOnInit(): void {
    this.filtroDataProcessamento = new Date();
    this.statusData = this.statusService.getStatus();
    this.usuarioInfo = this.localStorageService.getLocalStore().UsuarioInfo;

    this.refreshAgentesDeCarga();
  }

  onDataProcessamentoChanged(e: any) {
    let data: Date = new Date(e.value.getFullYear(),
      e.value.getMonth(),
      e.value.getDate(), 0, 0, 0, 0);

    this.filtroDataProcessamento = data;
    this.refreshGrid(this.curAgenteDeCarga);
  }

  refreshAgentesDeCarga() {

    this.curAgenteDeCarga = -1;
    this.botoesGBItems = null;

    this.agenteDeCargaClient.listarAgentesDeCargaSimples(this.usuarioInfo.EmpresaId)
      .subscribe(res => {
        if (res.result.Sucesso) {
          this.botoesGBItems = this.mapearButtonGroup(res.result.Dados);
          if (res.result.Dados && res.result.Dados.length > 0) {
            this.curAgenteDeCarga = res.result.Dados[0].AgenteDeCargaId;
            this.refreshGrid(res.result.Dados[0].AgenteDeCargaId);
            this.toastService.info('Atualizado');
          }
          return;
        }
        notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
      }, err => {
        notify(err, 'error', environment.ErrorTimeout);
      });

  }

  async refreshGrid(agenteDeCargaId: number) {

    this.botaoUploadEnabled = false;

    let input: HouseListarRequest = {
      DataProcessamento: this.filtroDataProcessamento,
      AgenteDeCargaId: agenteDeCargaId
    }

    await this.houseClient.listarHouses(input)
      .toPromise()
      .then(res => {
        if (res.result.Sucesso) {
          this.dataHouse = res.result.Dados;
          this.activateUpload();
        }
        else {
          this.dataHouse = [];
          notify(res.result.Notificacoes[0].Mensagem, 'error', 3000);
        }
      })
      .catch(err => {
        notify(err, 'error', 3000);
      })
  }

  refreshGridIcon() {
    this.refreshGrid(this.curAgenteDeCarga);
  }

  onClickUpload(e: any) {
    let result = confirm("<i>Você tem certeza?</i>", "Você está prestes a enviar os dados para a Receita Federal. Confirma ?");
    result.then((dialogResult) => {
      if (dialogResult) {
        // this.UploadCompleto();
      }
    });
  }

  onGridRowPrepared(e: any) {

    // if (e.rowType != 'data' || e.data.SituacaoRFB != 3) return;
    // e.rowElement.style.color = 'red';
    return;

  }

  onItemClick(e) {
    if (e.itemData.agenteid == this.curAgenteDeCarga) return;
    this.curAgenteDeCarga = e.itemData.agenteid;
    this.refreshGrid(e.itemData.agenteid);
  }

  private mapearButtonGroup(dados: AgenteDeCargaListaSimplesResponse[]) {

    let arrayBG: any = [];
    if (dados == null) return arrayBG;

    for (var i in dados) {
      let item = {
        icon: 'assets/img/icons/wood-pallet.svg',
        alignment: "left",
        text: dados[i].Nome,
        agenteid: dados[i].AgenteDeCargaId
      };
      arrayBG.push(item);
    }

    return arrayBG;

  }

  private activateUpload() {
    var validList = this.dataHouse.filter( item => {
      return  item.StatusId == 1;
    })
    if(validList.length > 0) {
      this.botaoUploadEnabled = true;
    }
  }

}
