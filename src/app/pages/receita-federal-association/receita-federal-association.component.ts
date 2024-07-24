import { Component, OnInit, ViewChild } from '@angular/core';
import { StatusVoo } from 'app/shared/model/statusvoo';
import { AgenteDeCargaClient, AgenteDeCargaListaSimplesResponse, HouseClient, HouseListarRequest, MasterHouseAssociationHouseItemResponse, MasterHouseAssociationSummaryUploadResponse, MasterHouseAssociationUploadResponse, ReceitaFederalClient, SubmeterRFBMasterHouseItemRequest, SubmeterRFBMasterHouseRequest, UsuarioInfoResponse } from 'app/shared/proxy/ctaapi';
import { LocalStorageService } from 'app/shared/services/localstorage.service';
import { StatusService } from 'app/shared/services/status.service';
import { DxPopupComponent } from 'devextreme-angular';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-receita-federal-association',
  templateUrl: './receita-federal-association.component.html',
  styleUrls: ['./receita-federal-association.component.css']
})
export class ReceitaFederalAssociationComponent implements OnInit {
  @ViewChild("popconfirm") popUpConfirm: DxPopupComponent;
  filtroDataProcessamento: Date = undefined;
  botoesGBItems: any = [];
  curAgenteDeCarga: number = -1;
  usuarioInfo: UsuarioInfoResponse;
  dataHouse: any[] = [];
  botaoUploadEnabled: boolean = false;
  botaoUploadLabel: string = 'Submeter RFB';
  checkedAll: boolean = false;
  statusRFB: StatusVoo[] = [];
  refreshIcon = {
    icon: "refresh",
    hint: "Refresh",
    onClick: this.refreshGridIcon.bind(this)
  };
  totalChecked: number = 0;

  constructor(private agenteDeCargaClient: AgenteDeCargaClient,
    private localStorageService: LocalStorageService,
    private houseClient: HouseClient,
    private receitaFederalClient: ReceitaFederalClient,
    private statusService: StatusService) {
    this.statusRFB = this.statusService.getStatusRFB();
  }

  ngOnInit(): void {
    this.filtroDataProcessamento = new Date();
    this.filtroDataProcessamento.setHours(0, 0, 0, 0);
    this.usuarioInfo = this.localStorageService.getLocalStore().UsuarioInfo;
    this.refreshAgentesDeCarga();
  }

  onDataProcessamentoChanged(e: any) {
    let data: Date = new Date(e.value);
    data.setHours(0, 0, 0, 0);

    this.filtroDataProcessamento = data;
    this.refreshGrid(this.curAgenteDeCarga);
  }

  async refreshAgentesDeCarga() {
    this.curAgenteDeCarga = -1;
    this.botoesGBItems = null;

    await this.agenteDeCargaClient.listarAgentesDeCargaSimples()
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
    this.totalChecked = 0;
    this.checkedAll = false;

    let input: HouseListarRequest = {
      DataProcessamento: this.filtroDataProcessamento,
      AgenteDeCargaId: agenteDeCargaId
    }

    this.houseClient.listhouseassociationupload(input)
      .toPromise()
      .then(res => {
        if (res.status) {
          this.dataHouse = this.checkResult(res.result);
          this.sumCheckedItens();
        }
        else {
          this.dataHouse = [];
        }
      })
      .catch(err => {
        notify(err, 'error', 3000);
      })
  }

  private checkResult(result: MasterHouseAssociationUploadResponse[]): any[] {
    if (!result)
      return [];

    return result.map(item => {
      return {
        checked: this.checkChecked(item.Houses),
        disabled: this.checkDisable(item.Houses),
        Number: item.Number,
        Summary: this.calcSummary(item.Houses),
        Houses: item.Houses,
        Id: item.Summary?.Id,
        RFBCreationStatus: item.Summary?.RFBCreationStatus,
        RFBCancelationStatus: item.Summary?.RFBCancelationStatus,
      }
    });
  }

  private calcSummary(houses: any): MasterHouseAssociationSummaryUploadResponse {

    const sum = houses.reduce((accumulator, current) => {

      return {
        TotalPackageQuantity: accumulator.TotalPackageQuantity + current.PackageQuantity,
        TotalPieceQuantity: accumulator.TotalPieceQuantity + current.TotalPieceQuantity,
        TotalWeight: accumulator.TotalWeight + convertToKGM(current.TotalWeight, current.TotalWeightUnit)
      }

      function convertToKGM(value, unit) {
        if (unit == 'KGM')
          return value;
        if (unit == 'LBS')
          return (value * 0.453592);
        return 0
      }
    }, { TotalPackageQuantity: 0, TotalPieceQuantity: 0, TotalWeight: 0 });

    const result: MasterHouseAssociationSummaryUploadResponse = {
      OriginLocation: houses[0].OriginLocation,
      DestinationLocation: houses[0].DestinationLocation,
      TotalWeight: sum.TotalWeight,
      TotalWeightUnit: 'KGM',
      PackageQuantity: sum.TotalPackageQuantity,
      TotalPieceQuantity: sum.TotalPieceQuantity,
    }
    return result;
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

  refreshGridIcon() {
    this.refreshGrid(this.curAgenteDeCarga);
  }

  onItemClick(e) {
    if (e.itemData.agenteid == this.curAgenteDeCarga) return;
    this.curAgenteDeCarga = e.itemData.agenteid;
    this.refreshGrid(e.itemData.agenteid);
  }

  onClickUpload(e: any) {
    let result = confirm("<i>Você tem certeza?</i>", "Você está prestes a enviar os dados para a Receita Federal. Confirma ?");
    result.then((dialogResult) => {
      if (dialogResult) {
        this.uploadRFB();
      }
    });
  }

  async uploadRFB() {
    const param: SubmeterRFBMasterHouseRequest = {
      FreightFowarderId: this.curAgenteDeCarga,
      Masters: this.dataHouse.filter(item => item.checked && !item.disabled)
        .map(master => {
          return {
            MasterNumber: master.Number,
            OriginLocation: master.Summary.OriginLocation,
            DestinationLocation: master.Summary.DestinationLocation,
            TotalWeight: master.Summary.TotalWeight,
            TotalWeightUnit: master.Summary.TotalWeightUnit,
            PackageQuantity: master.Summary.PackageQuantity,
            TotalPiece: master.Summary.TotalPieceQuantity
          } as SubmeterRFBMasterHouseItemRequest;
        })
    }
    await this.receitaFederalClient.submeterAssociacaoHouseMaster(param)
      .subscribe(res => {
        if (res.result.Sucesso) {
          notify("Arquivo Submetido com Sucesso!", 'success', environment.ErrorTimeout);
        }
        else {
          if (res.result.Notificacoes == undefined) {
            notify("Erro desconhecido!", 'error', environment.ErrorTimeout)
          }
          else {
            notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
          }
        }
        this.refreshGrid(this.curAgenteDeCarga);
      }, err => {
        notify(err, 'error', environment.ErrorTimeout)
      });
  }

  onCheckChange(event) {
    this.dataHouse[event.target.value].checked = event.target.checked;
    event.target.checked ? this.totalChecked++ : this.totalChecked--;
  }

  onCheckAllChange(event) {
    if (event.target.checked) {
      this.dataHouse.forEach(element => {
        if (!element.disabled)
          element.checked = true;
      });
      this.sumCheckedItens();
    } else {
      this.dataHouse.forEach(element => {
        if (!element.disabled)
          element.checked = false;
      });
      this.totalChecked = 0;
    }
  }

  sumCheckedItens() {
    this.totalChecked = this.dataHouse.reduce((accumulator, actual) => {
      var soma = accumulator + (actual.checked && !actual.disabled ? 1 : 0);
      return soma;
    }, 0);
  }

  private checkDisable(houses: MasterHouseAssociationHouseItemResponse[]): boolean {
    return houses.filter(x => x.AssociationStatusId == 2).length == houses.length;
  }

  private checkChecked(houses: MasterHouseAssociationHouseItemResponse[]): boolean {
    return houses.filter(x => x.AssociationStatusId == 1 || x.AssociationStatusId == 2).length == houses.length;
  }

  removeAssociationHandle(item) {
    let result = confirm("<i>Uma operação de exclusão será aceito até a primeira<br/> chegada da viagem no Brasil e caso esteja vinculada a<br/> um documento de saída.<br/><br/> Deseja continuar ?</i>", "Atenção!");
    result.then((dialogResult) => {
      if (dialogResult) {
        this.removeAssociation(item);
      }
    });
  }

  verifyAssociationHandle(item) {
    let result = confirm("<i>Deseja continuar ?</i>", "Atenção!");
    result.then((dialogResult) => {
      if (dialogResult) {
        this.removeAssociation(item);
      }
    });
  }

  removeAssociation(item) {
    this.receitaFederalClient.cancelarAssociacaoHouseMaster(item.Id)
      .subscribe(res => {
        if (res.result.Sucesso) {
          notify("Exclusão de associação submetida com sucesso!", 'success', environment.ErrorTimeout);
        }
        else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout)
      });
  }

}
