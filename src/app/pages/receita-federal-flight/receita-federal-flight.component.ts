import { Component, OnInit, ViewChild } from '@angular/core';
import { FlightTypeEnum } from 'app/shared/collections/data';
import { PortoIATAResponseDto } from 'app/shared/model/dto/portoiatadto';
import { StatusVoo } from 'app/shared/model/statusvoo';
import { FlightUploadRequest, ReceitaFederalClient, VooClient, VooListaResponseDto, VooListarInputDto, VooUploadResponse } from 'app/shared/proxy/ctaapi';
import { StatusService } from 'app/shared/services/status.service';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import { environment } from 'environments/environment';

export class MasterUldUploadByFlightDto {
  public ULD: string
  public Master?: string
  public Quantidade?: number
  public Peso?: number
  public PesoUnidade?: string
  public TotalParcial?: string
}

const PartType = {
  'T': 'T - Total',
  'D': 'D - Parcial',
  'P': 'P - Parcial',
  'S': 'S - Total'
}

@Component({
  selector: 'app-receita-federal',
  templateUrl: './receita-federal-flight.component.html',
  styleUrls: ['./receita-federal-flight.component.css']
})

export class ReceitaFederalFlightComponent implements OnInit {
  @ViewChild("masterDataGrid") masterDataGrid;
  refreshIcon: any;
  filtroDataVoo: Date;
  vooData: VooListaResponseDto[];
  vooDetalhe: VooUploadResponse= {};
  vooDetalheLista: VooUploadResponse[] = [];
  mastersDetail: MasterUldUploadByFlightDto[];
  botoesGBItems: any = [];
  portosData: Array<PortoIATAResponseDto>;
  statusData: Array<StatusVoo>;
  statusRFB: Array<StatusVoo>;
  curVoo: number = -1;
  botaoUploadEnabled: boolean = false;
  botaoUploadLabel: string = "Submeter Receita Federal";
  partType = PartType;
  flightTypeEnum = FlightTypeEnum;

  constructor(private statusService: StatusService,
    private vooClient: VooClient,
    private receitaFederalClient: ReceitaFederalClient) {

    this.statusData = this.statusService.getStatus();
    this.statusRFB = this.statusService.getStatusRFB();

    this.refreshIcon = {
      icon: "refresh",
      hint: "Refresh",
      onClick: this.refreshVooDetalhe.bind(this)
    };
  }

  ngOnInit(): void {
    this.filtroDataVoo = new Date();
    this.refreshListaVoos();
  }

  async refreshListaVoos() {
    this.mastersDetail = [];
    this.filtroDataVoo.setSeconds(0);
    this.filtroDataVoo.setMinutes(0);
    this.filtroDataVoo.setHours(0);

    let input: VooListarInputDto = {
      DataVoo: this.filtroDataVoo
    }

    const item = {
      alignment: "left",
      text: 'Selecione o Voo',
      vooid: -1
    };

    this.curVoo = -1;
    this.vooData = [];
    this.vooDetalhe = undefined;
    this.vooDetalheLista = [];
    this.botoesGBItems = [];
    this.botoesGBItems.push(item);
    this.botaoUploadEnabled = false;

    this.vooClient.listarVoosLista(input)
      .subscribe(res => {
        if (res.result.Sucesso) {
          this.vooData = res.result.Dados;
          this.botoesGBItems = this.autoMapper(this.vooData);
        }
        else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout);
      });
  }

  async refreshVooDetalhe() {
    this.vooDetalheLista = [];
    this.vooDetalhe = undefined;
    this.mastersDetail = [];
    if(this.curVoo === -1) {
      this.botaoUploadEnabled = false;
      return;
    }
    this.vooClient.obterVooUploadPorId(this.curVoo)
      .subscribe(res => {
        if (res.result.Sucesso) {
          this.vooDetalhe = res.result.Dados;
          this.vooDetalheLista.push(res.result.Dados);
          this.enableUploadButton(res.result.Dados);
        }
        else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
          this.botaoUploadEnabled = false;
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout)
      });
  }

  private enableUploadButton(data: VooUploadResponse) {
    this.botaoUploadEnabled = (data?.SituacaoRFBId !== 2 || (data?.SituacaoRFBId === 2 && data?.Reenviar));
  }

  async uploadCompleto() {
    let input: FlightUploadRequest = {
      FlightId: this.curVoo
    }

    this.receitaFederalClient.submeterVooCompleto(input)
      .subscribe(res => {
        if (res.result.Sucesso) {
          this.refreshVooDetalhe();
          notify(res.result.Dados ?? "Arquivo Submetido com Sucesso!", 'success', environment.ErrorTimeout);
        }
        else {
          if (res.result.Notificacoes == undefined) {
            notify(res.result.Dados ?? "Erro desconhecido!", 'error', environment.ErrorTimeout)
          }
          else {
            notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
          }
          this.refreshVooDetalhe();
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout)
      });
  }

  async submitScheduledFlight() {
    let input: FlightUploadRequest = {
      FlightId: this.curVoo
    }

    this.receitaFederalClient.submitscheduledflight(input)
      .subscribe(res => {
        if (res.result.Sucesso) {
          this.refreshVooDetalhe();
          notify(res.result.Dados ?? "Arquivo Submetido com Sucesso!", 'success', environment.ErrorTimeout);
        }
        else {
          if (res.result.Notificacoes == undefined) {
            notify(res.result.Dados ?? "Erro desconhecido!", 'error', environment.ErrorTimeout)
          }
          else {
            notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
          }
          this.refreshVooDetalhe();
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout)
      });
  }

  autoMapper(dados: VooListaResponseDto[]) {
    let arrayBG: any = [];
    let item = {
      alignment: "left",
      text: 'Selecione o Voo',
      vooid: -1
    };
    arrayBG.push(item);
    if (dados == null) return arrayBG;

    for (const i in dados) {
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
    this.refreshVooDetalhe();
  }

  onRowPrepared(e: any) {
    if (e.rowType == 'data') {
      if (e.data.SituacaoRFBId == 3)
        e.rowElement.style.color = 'red';
    }
  }

  uploadAction() {
    if (this.vooDetalheLista == undefined) {
      this.botaoUploadEnabled = false;
      return;
    }
    switch (this.vooDetalheLista[0].SituacaoRFBId) {
      case 0:
        if (this.vooDetalheLista[0].StatusId === 1) {
          this.botaoUploadEnabled = true;
           break;
        }
        this.botaoUploadEnabled = false;
        break;
      case 1:
      case 3:
        this.botaoUploadEnabled = true;
        return;
      default:
        this.botaoUploadEnabled = false;
        break;
    }

  }

  onClickUpload(e: any) {
    let result = confirm("Você está prestes a enviar os dados para a Receita Federal. Confirma ?", "Você tem certeza ?");
    result.then((dialogResult) => {
      if (dialogResult) {
        this.uploadCompleto();
      }
    });
  }

  onScheduleClick(e: any) {
    let result = confirm("Você está prestes a enviar os dados de voo estimado para a Receita Federal. Confirma ?", "Você tem certeza ?");
    result.then((dialogResult) => {
      if (dialogResult) {
        this.submitScheduledFlight();
      }
    });
  }

}