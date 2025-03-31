import { Component, OnInit, ViewChild } from '@angular/core';
import { StatusVoo } from 'app/shared/model/statusvoo';
import { AddMasterHouseAssociationRequest, AddRFBMasterHouseItemRequest, AgenteDeCargaClient, AgenteDeCargaListaSimplesResponse, HouseClient, HouseListarRequest, MasterHouseAssociationHouseItemResponse, MasterHouseAssociationOpenMasterItem, MasterHouseAssociationSummaryUploadResponse, MasterHouseAssociationUploadResponse, ReceitaFederalClient, RemoveMasterHouseAssociationRequest, RemoveRFBMasterHouseItemRequest, SubmeterRFBMasterHouseRequest, SubmitAssociatonRequest, SubmitRFBMasterHouseRequest, UpdateMasterHouseAssociationRequest, UpdateRFBMasterHouseItemRequest, UsuarioInfoResponse } from 'app/shared/proxy/ctaapi';
import { LocalStorageService } from 'app/shared/services/localstorage.service';
import { StatusService } from 'app/shared/services/status.service';
import { DxPopupComponent } from 'devextreme-angular';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import { environment } from 'environments/environment';

interface HouseAssociationUploadState {
  processDate?: Date;
  currentFreightFowarder?: number;
}

interface selectedMaster {
  index: number;
  checked: boolean;
  disabled: boolean;
  houses: Array<selectedMasterHouse>;
}

interface selectedMasterHouse {
  index: number;
  id: number;
  checked: boolean;
}

interface selectedAssociation {
  disabled: boolean;
  associations: selectedAssociationPackage[],
}

interface selectedAssociationPackage {
  index: number;
  id: number;
  checked: boolean;
  disabled: boolean;
};

@Component({
  selector: 'app-receita-federal-association',
  templateUrl: './receita-federal-association.component.html',
  styleUrls: ['./receita-federal-association.component.css']
})
export class ReceitaFederalAssociationComponent implements OnInit {
  @ViewChild("popconfirm") popUpConfirm: DxPopupComponent;
  @ViewChild("popmasterdate") popMasterDate: DxPopupComponent;
  componentState: HouseAssociationUploadState = {};
  filtroDataProcessamento: Date = undefined;
  botoesGBItems: any = [];
  curAgenteDeCarga: number | undefined;
  usuarioInfo: UsuarioInfoResponse;
  dataHouse: MasterHouseAssociationUploadResponse[] = [];
  openMaster: MasterHouseAssociationOpenMasterItem[] = [];
  selectedHouses: MasterHouseAssociationOpenMasterItem;
  botaoUploadEnabled: boolean = false;
  botaoUploadLabel: string = 'Submeter RFB';
  checkedAll: boolean = false;
  statusRFB: StatusVoo[] = [];
  changeMasterDate: Date | undefined;
  popupVisible: boolean = false;
  popupEditVisible: boolean = false;
  refreshIcon = {
    icon: "refresh",
    hint: "Refresh",
    onClick: this.refreshGridIcon.bind(this)
  };
  totalChecked: number = 0;
  selectedOpenHouse: Array<selectedMaster>;
  selectedAssociation: selectedAssociation;
  selectedAssociated: MasterHouseAssociationUploadResponse;

  constructor(private agenteDeCargaClient: AgenteDeCargaClient,
    private localStorageService: LocalStorageService,
    private houseClient: HouseClient,
    private receitaFederalClient: ReceitaFederalClient,
    private statusService: StatusService,
    private state: LocalStorageService) {
    this.statusRFB = this.statusService.getStatusRFB();
  }

  ngOnInit(): void {
    this.filtroDataProcessamento = new Date();
    this.filtroDataProcessamento.setHours(0, 0, 0, 0);
    this.usuarioInfo = this.localStorageService.getLocalStore().UsuarioInfo;
    this.refreshAgentesDeCarga();
    this.getState();
    this.refreshGrid(this.curAgenteDeCarga);
  }

  getState() {
    const key = 'HouseAssociationUploadState';
    this.componentState = this.state.getScreenState<HouseAssociationUploadState>(key);
    if (this.componentState != undefined) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const previewDate = new Date(this.componentState.processDate);
      previewDate.setHours(0, 0, 0, 0);
      if (previewDate.getDate() == today.getDate() && previewDate.getMonth() == today.getMonth()) {
        this.curAgenteDeCarga = this.componentState?.currentFreightFowarder;
        this.filtroDataProcessamento = previewDate;
      }
    }
  }

  setState() {
    const key = 'HouseAssociationUploadState';

    this.componentState = {
      processDate: this.filtroDataProcessamento,
      currentFreightFowarder: this.curAgenteDeCarga
    }
    const state = this.state.setScreenState<HouseAssociationUploadState>(key, this.componentState);
  }

  onDataProcessamentoChanged(e: any) {
    let data: Date = new Date(e.value);
    data.setHours(0, 0, 0, 0);

    this.filtroDataProcessamento = data;
    if (this.curAgenteDeCarga == -1) return;
    this.refreshGrid(this.curAgenteDeCarga);
  }

  async refreshAgentesDeCarga() {
    this.curAgenteDeCarga = -1;
    this.botoesGBItems = null;

    await this.agenteDeCargaClient.listarAgentesDeCargaSimples()
      .subscribe(res => {
        if (res.result.Sucesso) {
          this.botoesGBItems = this.mapearButtonGroup(res.result.Dados);
          const foundIdx = res.result.Dados.findIndex(x => x.AgenteDeCargaId == this.curAgenteDeCarga);
          return;
        }
        notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
      }, err => {
        notify(err, 'error', environment.ErrorTimeout);
      });
  }

  async refreshGrid(agenteDeCargaId: number) {
    if (agenteDeCargaId == undefined)
      return;
    this.dataHouse = [];
    this.totalChecked = 0;
    this.checkedAll = false;
    this.openMaster = [];
    this.selectedOpenHouse = [];
    this.selectedAssociation = {
      disabled: true,
      associations: []
    };

    let input: HouseListarRequest = {
      DataProcessamento: this.filtroDataProcessamento,
      AgenteDeCargaId: agenteDeCargaId
    }

    this.houseClient.forUploadList(input)
      .toPromise()
      .then(res => {
        if (res.status) {
          this.dataHouse = res.result.MasterAssociationItems;
          this.dataHouse.forEach((assocation, idx) => {
            this.selectedAssociation.associations.push({
              index: idx,
              id: assocation.Summary?.Id,
              checked: assocation.CreateRFPStatus != 2,
              disabled: assocation.CreateRFPStatus == 2
            })
          });
          const totalSelected = this.selectedAssociation.associations.filter(x => x.checked).length;
          this.selectedAssociation.disabled = totalSelected == 0;
          this.checkedAll = totalSelected == this.selectedAssociation.associations.length;

          res.result.OpenMasters?.forEach((master, idx) => {
            this.selectedOpenHouse.push({
              index: idx,
              checked: true,
              disabled: false,
              houses: []
            });
            master.Houses.forEach((house, idx2) => {
              this.selectedOpenHouse[idx].houses.push({ index: idx2, id: house.Id, checked: true });
            })
          });

          this.openMaster = res.result.OpenMasters;

          this.setState();
        }
        else {
          this.dataHouse = [];
        }
      })
      .catch(err => {
        notify(err, 'error', 3000);
      })
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

  openNewAssociation(e: any, idx: number) {
    this.selectedHouses = {};
    this.changeMasterDate = undefined;
    const master = { ...this.openMaster[idx] };
    const selectedMaster = this.selectedOpenHouse[idx];
    const houses = master.Houses.filter(x => selectedMaster.houses.findIndex(y => y.id == x.Id && y.checked) > -1)

    master.Houses = houses;

    this.selectedHouses = master;
    this.popupVisible = true;
  }

  onClickUpload() {
    let result = confirm("<i>Você tem certeza?</i>", "Você está prestes a enviar os dados para a Receita Federal. Confirma ?");
    result.then((dialogResult) => {
      if (dialogResult) {
        this.uploadRFB();
      }
    });
  }

  async uploadRFB() {
    const param: SubmitRFBMasterHouseRequest = {
      FreightFowarderId: this.curAgenteDeCarga,
      AssociationIds: this.selectedAssociation.associations.filter(x => x.checked)
        .map(x => x.id)
    }

    this.receitaFederalClient.submitHouseMasterAssociation(param)
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
        this.refreshGrid(this.curAgenteDeCarga);
      }, err => {
        notify(err, 'error', environment.ErrorTimeout);
      });
  }

  onCheckChange(e: any, idx: number) {
    this.selectedAssociation.associations[idx].checked = e.target.checked;
    const totalSelected = this.selectedAssociation.associations.filter(x => x.checked).length;

    if (e.target.checked) {
      this.selectedAssociation.disabled = false;
      this.checkedAll = totalSelected == this.selectedAssociation.associations.length;
    }
    else {
      this.selectedAssociation.disabled = totalSelected == 0;
      this.checkedAll = false;
    }
  }

  onCheckChangeItem(event: any, house: any) {
    house.Checked = event.target.checked;
  }

  onCheckAllChange(e: any) {
    this.selectedAssociation.associations.forEach(item => {
      if (!item.disabled)
        item.checked = e.target.checked;
    });
    this.selectedAssociation.disabled = this.selectedAssociation.associations.filter(x => x.checked).length == 0;
  }

  removeAssociationHandle(item: any) {
    let result = confirm("<i>Uma operação de exclusão será aceito até a primeira<br/> chegada da viagem no Brasil e caso esteja vinculada a<br/> um documento de saída.<br/><br/> Deseja continuar ?</i>", "Atenção!");
    result.then((dialogResult) => {
      if (dialogResult) {
        this.removeAssociation(item);
      }
    });
  }

  verifyAssociationHandle(item: any) {
    let result = confirm("<i>Deseja continuar ?</i>", "Atenção!");
    result.then((dialogResult) => {
      if (dialogResult) {
        this.checkRemoveAssociation(item);
      }
    });
  }

  removeAssociation(item: any) {
    const request: SubmitAssociatonRequest = {
      freightFowarderId: this.curAgenteDeCarga,
      associationId: item.Summary.Id
    };

    this.receitaFederalClient.submitAssociationRemove(request)
      .subscribe(res => {
        if (res.result.Sucesso) {
          const foundIdx = this.dataHouse.findIndex(x => x.DocumentId == res.result.Dados[0].DocumentId);
          this.dataHouse[foundIdx] = res.result.Dados[0];

          const foundAssIdx = this.selectedAssociation.associations.findIndex(x => x.id == res.result.Dados[0].Summary?.Id);
          if (foundAssIdx > -1) {
            this.selectedAssociation.associations[foundAssIdx].disabled = res.result.Dados[0].CreateRFPStatus == 2;
          }

          notify("Exclusão de associação submetida com sucesso!", 'success', environment.ErrorTimeout);
        }
        else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout)
      });
  }

  checkRemoveAssociation(item: any) {
    const request: SubmitAssociatonRequest = {
      freightFowarderId: this.curAgenteDeCarga,
      associationId: item.Summary.Id
    };

    this.receitaFederalClient.checkAssociationRemove(request)
      .subscribe(res => {
        if (res.result.Sucesso) {
          const foundIdx = this.dataHouse.findIndex(x => x.DocumentId == res.result.Dados[0].DocumentId);
          this.dataHouse[foundIdx] = res.result.Dados[0];

          const foundAssIdx = this.selectedAssociation.associations.findIndex(x => x.id == res.result.Dados[0].Summary?.Id);
          if (foundAssIdx > -1) {
            this.selectedAssociation.associations[foundAssIdx].disabled = res.result.Dados[0].CreateRFPStatus == 2;
          }

          notify("Exclusão de associação submetida com sucesso!", 'success', environment.ErrorTimeout);
        }
        else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout)
      });
  }

  openHouseCheckClick(e: any, idx: number, idx2: number) {
    if (e.target.checked) {
      this.selectedOpenHouse[idx].houses[idx2].checked = true;
      this.selectedOpenHouse[idx].disabled = false;
    }
    else {
      this.selectedOpenHouse[idx].houses[idx2].checked = false;
      this.selectedOpenHouse[idx].disabled = this.selectedOpenHouse[idx].houses.filter(x => x.checked).length == 0;
    }
  }

  onSubmitAssociation() {
    let result = confirm("<i>Você tem certeza?</i>", "Confirma a associação ?");
    result.then((dialogResult) => {
      if (dialogResult) {
        this.popupVisible = false;
        this.onSubmitAssociationApi();
      }
    });
  }

  onSubmitEditAssociation() {
    let result = confirm("<i>Você tem certeza?</i>", "Confirma a Alteração da Associação ?");
    result.then((dialogResult) => {
      if (dialogResult) {
        this.popupEditVisible = false;
        this.onSubmitEditAssociationApi();
      }
    });
  }

  onSubmitRemoveAssociation() {
    let result = confirm("<i>Deseja Desafazer Associação</i>", "Confirma ?");
    result.then((dialogResult) => {
      if (dialogResult) {
        this.popupEditVisible = false;
        this.onSubmitRemoveAssociationApi();
      }
    });
  }

  onSubmitAssociationApi() {
    const master: AddRFBMasterHouseItemRequest = {
      MasterNumber: this.selectedHouses.MasterNumber,
      CarrierDeclarationDate: this.changeMasterDate,
      HouseIds: this.selectedHouses.Houses.map(x => x.Id)
    };

    const request: AddMasterHouseAssociationRequest = {
      FreightFowarderId: this.curAgenteDeCarga,
      Masters: [master]
    }

    this.houseClient.adicionarMasterHouseAssociacao(request)
      .toPromise()
      .then(res => {
        if (res.result.Sucesso) {
          this.changeMasterDate = undefined;
          this.selectedHouses = {};
          this.refreshGrid(this.curAgenteDeCarga)
        }
      })
  }

  onSubmitEditAssociationApi() {
    const master: UpdateRFBMasterHouseItemRequest = {
      MessageHeaderDocumentoId: this.selectedAssociated.DocumentId,
      CarrierDeclarationDate: this.changeMasterDate,
      HouseIds: this.selectedAssociated.Houses.map(x => x.Id)
    };

    const request: UpdateMasterHouseAssociationRequest = {
      FreightFowarderId: this.curAgenteDeCarga,
      Associations: [master]
    }

    this.houseClient.atualizarMasterHouseAssociacao(request)
      .toPromise()
      .then(res => {
        if (res.result.Sucesso) {
          this.changeMasterDate = undefined;
          this.selectedHouses = {};
          this.refreshGrid(this.curAgenteDeCarga)
        }
      })
  }

  onSubmitRemoveAssociationApi() {
    const association: RemoveRFBMasterHouseItemRequest = {
      MessageHeaderDocumentoId: this.selectedAssociated.DocumentId
    };

    const request: RemoveMasterHouseAssociationRequest = {
      FreightFowarderId: this.curAgenteDeCarga,
      Associations: [association]
    }

    this.houseClient.desfazerMasterHouseAssociacao(request)
      .toPromise()
      .then(res => {
        if (res.result.Sucesso) {
          this.changeMasterDate = undefined;
          this.selectedHouses = {};
          this.refreshGrid(this.curAgenteDeCarga)
        }
      })
  }

  onEditAssociation(item: MasterHouseAssociationUploadResponse) {
    const associacao = Object.assign({}, item);
    const summary = Object.assign({}, item.Summary);

    associacao.Summary = summary;
    associacao.Houses = [];
    for (let i = 0; i < item.Houses.length; i++) {
      const house = Object.assign({}, item.Houses[i]);
      associacao.Houses.push(house);
    }

    this.selectedAssociated = associacao;
    this.changeMasterDate = this.selectedAssociated?.Summary?.IssueDate;
    this.popupEditVisible = true;
  }

  removeItemEditAssociacao(idx: number) {
    let result = confirm(`<i>Deseja Remover House ${this.selectedAssociated.Houses[idx].Number} Associação</i>`, "Confirma ?");
    result.then((dialogResult) => {
      if (dialogResult) {
        this.selectedAssociated.Houses.splice(idx, 1);
      }
    });

  }
}
