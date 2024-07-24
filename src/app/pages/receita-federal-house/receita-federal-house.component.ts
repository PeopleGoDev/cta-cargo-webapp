import { Component, OnInit, ViewChild } from '@angular/core';
import { StatusVoo } from 'app/shared/model/statusvoo';
import { AgenteDeCargaClient, AgenteDeCargaListaSimplesResponse, HouseClient, HouseListarRequest, HouseResponseDto, ReceitaFederalClient, SubmeterRFBHouseByIdsRequest, SubmeterRFBHouseRequest, UsuarioInfoResponse } from 'app/shared/proxy/ctaapi';
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
  botaoUploadLabel: string = 'Submeter House RFB';
  botaoAssociacaoUploadEnabled: boolean = false;
  botaoAssociacaoUploadLabel: string = 'Submeter Associação RFB';
  dataHouse: HouseResponseDto[] = [];
  statusData: StatusVoo[];
  filtroDataProcessamento: Date = undefined;
  usuarioInfo: UsuarioInfoResponse;
  statusRFB: StatusVoo[] = [];
  botoesGBItems: any = [];
  selectedItems: number[] = [];
  refreshIcon = {
    icon: "refresh",
    hint: "Refresh",
    onClick: this.refreshGridIcon.bind(this)
  };

  constructor(private houseClient: HouseClient,
    private agenteDeCargaClient: AgenteDeCargaClient,
    private receitaFederalClient: ReceitaFederalClient,
    private localStorageService: LocalStorageService,
    private statusService: StatusService) {
    this.statusRFB = this.statusService.getStatusRFB();

  }

  ngOnInit(): void {
    this.filtroDataProcessamento = new Date();
    this.filtroDataProcessamento.setHours(0, 0, 0, 0);
    this.statusData = this.statusService.getStatus();
    this.usuarioInfo = this.localStorageService.getLocalStore().UsuarioInfo;

    this.refreshAgentesDeCarga();
  }

  onDataProcessamentoChanged(e: any) {
    let data: Date = new Date(e.value);
    data.setHours(0, 0, 0, 0);

    this.filtroDataProcessamento = data;
    this.refreshGrid(this.curAgenteDeCarga);
  }

  refreshAgentesDeCarga() {
    this.curAgenteDeCarga = -1;
    this.botoesGBItems = [];
    this.agenteDeCargaClient.listarAgentesDeCargaSimples()
      .subscribe(res => {
        if (res.result.Sucesso) {
          this.botoesGBItems = this.mapearButtonGroup(res.result.Dados);
          if (res.result.Dados && res.result.Dados.length > 0) {
            this.curAgenteDeCarga = res.result.Dados[0].AgenteDeCargaId;
            this.refreshGrid(res.result.Dados[0].AgenteDeCargaId);
          }
          return;
        }
        notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
      }, err => {
        notify(err, 'error', environment.ErrorTimeout);
      });

  }

  async refreshGrid(agenteDeCargaId: number) {
      let input: HouseListarRequest = {
      DataProcessamento: this.filtroDataProcessamento,
      AgenteDeCargaId: agenteDeCargaId
    }

    await this.houseClient.listarHouses(input)
      .toPromise()
      .then(res => {
        if (res.result.Sucesso) {
          this.dataHouse = res.result.Dados;
          this.checkHouseList();
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
        this.uploadRFB(this.curAgenteDeCarga);
      }
    });
  }

  onItemClick(e) {
    if (e.itemData.agenteid == this.curAgenteDeCarga) return;
    this.curAgenteDeCarga = e.itemData.agenteid;
    this.refreshGrid(e.itemData.agenteid);
  }

  private mapearButtonGroup(dados: AgenteDeCargaListaSimplesResponse[]) {
    let arrayBG: any = [];
    if (dados == null) return arrayBG;

    for (var i in dados.sort(function (a, b) {
      if (a.Nome > b.Nome) {
        return 1;
      }
      if (a.Nome < b.Nome) {
        return -1;
      }
      return 0;
    })) {
      const item = {
        icon: 'assets/img/icons/wood-pallet.svg',
        alignment: "left",
        text: dados[i].Nome,
        agenteid: dados[i].AgenteDeCargaId
      };
      arrayBG.push(item);
    }
    return arrayBG;
  }

  async uploadRFB(agenteDeCargaId: number) {
    const input: SubmeterRFBHouseByIdsRequest = {
      DataProcessamento: this.filtroDataProcessamento,
      FreightFowarderId: agenteDeCargaId,
      HouseIds: this.selectedItems
    };

    this.receitaFederalClient.submeterHouseAgenteDeCargaPorIds(input)
      .subscribe(res => {
        if (res.result.Sucesso) {
          notify("Arquivo Submetido com Sucesso!", 'success', environment.ErrorTimeout);
        }
        else {
          if (res.result.Notificacoes == undefined) {
            notify("Erro desconhecido!", 'error', environment.ErrorTimeout);
          }
          else {
            notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
          }
        }
        this.refreshGrid(agenteDeCargaId);
      }, err => {
        notify(err, 'error', environment.ErrorTimeout);
      });
  }

  onRowPrepared(e: any) {
    if (e.rowType == 'data') {
      if (e.data.SituacaoRFB == 3)
        e.rowElement.style.color = 'red';
    }
  }

  onEditorPreparing(e: any) {
    if(e.type !== 'selection')
      return;

    if(e.parentType != 'dataRow')
      return;

    e.editorOptions.disabled = this.isDisabled(e.row.data);
  }

  textToHtml(value) {
    return value.text;
  }

  checkHouseList() {
    for(let idx=0; idx < this.selectedItems.length; idx++) {
      const findIndex = this.dataHouse.find(x => x.HouseId == this.selectedItems[idx]);
      if(findIndex) {
        if(this.isDisabled(findIndex))
          this.selectedItems.splice(idx, 1);
      }
    }
  }

  isDisabled(item: HouseResponseDto): boolean
  {
    return item.SituacaoRFB === 2 && !item.Reenviar;
  }

  onSelectionChanged(e: any) {
    this.botaoUploadEnabled = e.selectedRowKeys && e.selectedRowKeys.length != 0;
    if (e.selectedRowKeys && e.selectedRowKeys.length != 0) {
      for(let data of e.selectedRowsData) {
        if(this.isDisabled(data))
          e.component.deselectRows(data.HouseId);
      };
    }
  }

}
