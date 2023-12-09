import { Component, OnInit } from '@angular/core';
import { FlightTypeEnum } from 'app/shared/collections/data';
import { PortoIATAResponseDto } from 'app/shared/model/dto/portoiatadto';
import { StatusVoo } from 'app/shared/model/statusvoo';
import { FileUploadResponse, FlightUploadRequest, MasterClient, MasterListarRequest, MasterResponseDto, ReceitaFederalClient, UsuarioInfoResponse, VooClient, VooListaResponseDto, VooListarInputDto, VooResponseDto } from 'app/shared/proxy/ctaapi';
import { LocalStorageService } from 'app/shared/services/localstorage.service';
import { StatusService } from 'app/shared/services/status.service';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import { environment } from 'environments/environment';


@Component({
  selector: 'app-receita-federal-master',
  templateUrl: './receita-federal-master.component.html',
  styleUrls: ['./receita-federal-master.component.css']
})

export class ReceitaFederalMasterComponent implements OnInit {
  refreshIcon: any;
  filtroDataVoo: Date;
  vooData: VooListaResponseDto[];
  vooDetalheLista: VooResponseDto[] = [];
  mastersData: MasterResponseDto[] = [];
  botoesGBItems: any = [];
  portosData: Array<PortoIATAResponseDto>;
  statusData: Array<StatusVoo>;
  statusRFB: Array<StatusVoo>;
  curVoo: number = -1;
  botaoUploadEnabled: boolean = false;
  private usuarioInfo: UsuarioInfoResponse;
  flightTypeEnum = FlightTypeEnum;

  constructor(private localstorageService: LocalStorageService,
    private statusService: StatusService,
    private vooClient: VooClient,
    private masterClient: MasterClient,
    private receitaFederalClient: ReceitaFederalClient) {

    this.statusData = this.statusService.getStatus();
    this.statusRFB = this.statusService.getStatusRFB();

    this.refreshIcon = {
      icon: "refresh",
      hint: "Refresh",
      onClick: this.refreshGrid.bind(this)
    };
  }

  ngOnInit(): void {
    this.filtroDataVoo = new Date();
    this.usuarioInfo = this.localstorageService.getLocalStore().UsuarioInfo;
    this.refreshListaVoos();
  }

  async refreshListaVoos() {
    this.filtroDataVoo.setSeconds(0);
    this.filtroDataVoo.setMinutes(0);
    this.filtroDataVoo.setHours(0);

    let input: VooListarInputDto = {
      DataVoo: this.filtroDataVoo
    }

    this.curVoo = -1;
    this.vooData = [];
    this.vooDetalheLista = [];
    this.mastersData = null;
    this.botoesGBItems = null;
    this.botaoUploadEnabled = false;

    this.vooClient.listarVoosLista(input)
      .subscribe(res => {
        if (res.result.Sucesso) {
          this.vooData = res.result.Dados;
          if (this.vooData.length > 0) {
            this.botoesGBItems = this.autoMapper(this.vooData);
            this.curVoo = this.vooData[0].VooId;
            this.refreshGrid();
          }
        }
        else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout);
      });
  }

  async refreshGrid() {
    const input: MasterListarRequest = {
      VooId: this.curVoo
    }

    let res = await this.masterClient.listarMasters(input)
    .subscribe(res => {
    if (res.result.Sucesso) {
      this.mastersData = res.result.Dados;
      this.enableUploadButton(res.result.Dados);
    }
    else {
      this.mastersData = null;
      notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
    }});
  }

  private enableUploadButton(dados: MasterResponseDto[]) {
    dados.forEach(item => {
      var enabled = (item.SituacaoRFB !== 2 || (item.SituacaoRFB ===2 && item.Reenviar));
      if(enabled) {
        this.botaoUploadEnabled = true;
        return;
      }
    })
  }

  async uploadCompleto() {
    let input: FlightUploadRequest = {
      FlightId: this.curVoo
    }

    this.receitaFederalClient.submeterMasterVooCompleto(input)
      .subscribe(res => {
        if (res.result.Sucesso) {
          this.updateList(res.result.Dados);
          notify("Arquivo Submetido com Sucesso!", 'success', environment.ErrorTimeout);
        }
        else {
          if (res.result.Notificacoes == undefined) {
            notify("Erro desconhecido!", 'error', environment.ErrorTimeout)
          }
          else {
            notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
          }
          this.refreshGrid();
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout)
      });
  }

  updateList(dados: FileUploadResponse[]) {

    if(!dados)
      return;

    dados.forEach(item => {
      const foundIdx = this.mastersData.findIndex(x => x.MasterId == item.Id);
      if(foundIdx > -1) {
        this.getSituacaoRfbId(item, this.mastersData[foundIdx]);
      }
    })
  }

  getSituacaoRfbId(status: FileUploadResponse, data: MasterResponseDto) {
    switch (status.Status) {
      case 'Received':
        data.SituacaoRFB = 1;
        data.ProtocoloRFB = status.Protocol;
        data.CodigoErroRFB = null;
        data.DescricoErroRFB = null;
        break;
      case 'Processed':
        data.SituacaoRFB = 2;
        data.ProtocoloRFB = status.Protocol;
        data.CodigoErroRFB = null;
        data.DescricoErroRFB = null;
        break;
      case 'Rejected':
        data.SituacaoRFB = 3;
        data.ProtocoloRFB = status.Protocol;
        data.CodigoErroRFB = status.ErrorCode;
        data.DescricoErroRFB = status.Message;
        break;
    }
  }

  autoMapper(dados: VooListaResponseDto[]) {
    let arrayBG: any = [];
    if (dados == null) return arrayBG;

    for (var i in dados) {
      let item = {
        icon: "airplane",
        alignment: "left",
        text: dados[i].Numero + ' - ' + dados[i].CiaAereaNome + ' - ' + this.flightTypeEnum[dados[i].FlightType],
        vooid: dados[i].VooId
      };
      arrayBG.push(item);
    }
    return arrayBG;
  }

  handleValueDataChangeDataVoo(e) {
    this.filtroDataVoo = e.value;
    this.refreshListaVoos();
  }

  onItemClick(e) {
    if (e.itemData.vooid == this.curVoo) return;
    this.curVoo = e.itemData.vooid;
    this.refreshGrid();
  }

  onMasterRowPrepared(e: any) {
    if (e.rowType != 'data' || e.data.SituacaoRFB != 3) return;
    e.rowElement.style.color = 'red';
    return;
  }

  onClickUpload(e: any) {
    let result = confirm("<i>Você tem certeza?</i>", "Você está prestes a enviar os dados para a Receita Federal. Confirma ?");
    result.then((dialogResult) => {
      if (dialogResult) {
        this.uploadCompleto();
      }
    });
  }

}
