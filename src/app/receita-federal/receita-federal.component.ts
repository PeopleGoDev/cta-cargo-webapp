import { Component, OnInit, ViewChild } from '@angular/core';
import { MasterListarRequestDto, MasterResponseDto } from 'app/shared/model/dto/masterdto';
import { PortoIATAResponseDto } from 'app/shared/model/dto/portoiatadto';
import { StatusVoo } from 'app/shared/model/statusvoo';
import { ReceitaFederalClient, UsuarioInfoResponse, VooClient, VooListaResponseDto, VooListarInputDto, VooResponseDto, VooUploadInput } from 'app/shared/proxy/ctaapi';
import { LocalStorageService } from 'app/shared/services/localstorage.service';
import { MasterService } from 'app/shared/services/master.service';
import { StatusService } from 'app/shared/services/status.service';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-receita-federal',
  templateUrl: './receita-federal.component.html',
  styleUrls: ['./receita-federal.component.css']
})

export class ReceitaFederalComponent implements OnInit {
  @ViewChild("masterDataGrid") masterDataGrid;
  refreshIcon: any;
  filtroDataVoo: Date;
  vooData: VooListaResponseDto[];
  vooDetalheLista: VooResponseDto[] = [];
  mastersData: Array<MasterResponseDto>;
  botoesGBItems: any = [];
  portosData: Array<PortoIATAResponseDto>;
  statusData: Array<StatusVoo>;
  statusRFB: Array<StatusVoo>;
  curVoo: number = -1;
  botaoUploadEnabled: boolean = false;
  private usuarioInfo: UsuarioInfoResponse;

  constructor(private masterService: MasterService,
    private localstorageService: LocalStorageService,
    private statusService: StatusService,
    private vooClient: VooClient,
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
            this.botoesGBItems = this.AutoMapper(this.vooData);
            this.curVoo = this.vooData[0].VooId;
            this.refreshVooDetalhe();
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

  async refreshVooDetalhe() {
    this.vooDetalheLista = [];
    this.vooClient.obterVooPorId(this.curVoo)
      .subscribe(res => {
        if (res.result.Sucesso) {

          this.vooDetalheLista.push(res.result.Dados);
          if (res.result.Dados)
            this.botaoUploadEnabled = true;
        }
        else {
          notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
          this.botaoUploadEnabled = false;
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout)
      });
  }

  async refreshGrid() {
    let input: MasterListarRequestDto = new MasterListarRequestDto();

    input.EmpresaId = +this.usuarioInfo.EmpresaId;
    input.VooId = this.curVoo;

    let res = await this.masterService.Listar(input);
    if (res.Sucesso) {
      this.mastersData = res.Dados;
    }
    else {
      this.mastersData = null;
      notify(res.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
    }
  }

  async UploadCompleto() {
    let input: VooUploadInput = {
      UsuarioId: +this.usuarioInfo.UsuarioId,
      VooId: this.curVoo
    }

    this.receitaFederalClient.submeterVooCompleto(input)
      .subscribe(res => {
        if (res.result.Sucesso) {
          this.refreshVooDetalhe();
          this.refreshGrid();
          notify("Arquivo Submetido com Sucesso!", 'success', environment.ErrorTimeout);
        }
        else {
          if (res.result.Notificacoes == undefined) {
            notify("Erro desconhecido!", 'error', environment.ErrorTimeout)
          }
          else {
            notify(res.result.Notificacoes[0].Mensagem, 'error', environment.ErrorTimeout);
          }
          this.refreshVooDetalhe();
          this.refreshGrid();
        }
      }, err => {
        notify(err, 'error', environment.ErrorTimeout)
      });
  }

  AutoMapper(dados: VooListaResponseDto[]) {
    let arrayBG: any = [];
    if (dados == null) return arrayBG;

    for (var i in dados) {
      let item = {
        icon: "airplane",
        alignment: "left",
        text: dados[i].Numero,
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

  OnItemClick(e) {
    if (e.itemData.vooid == this.curVoo) return;
    this.curVoo = e.itemData.vooid;
    this.refreshVooDetalhe();
    this.refreshGrid();
  }

  OnRowPrepared(e: any) {
    if (e.rowType == 'data') {
      if (e.data.SituacaoRFBId == 3)
        e.rowElement.style.color = 'red';
    }
  }

  OnMasterRowPrepared(e: any) {

    if (e.rowType != 'data' || e.data.SituacaoRFB != 3) return;

    e.rowElement.style.color = 'red';

    return;

  }

  UploadAction() {
    if (this.vooDetalheLista == undefined || this.vooDetalheLista == null || this.vooDetalheLista.length == 0) {
      this.botaoUploadEnabled = false;
      return;
    }
    switch (this.vooDetalheLista[0].SituacaoRFBId) {
      case 0:
        if (this.vooDetalheLista[0].StatusId == 1) {
          this.botaoUploadEnabled = true;
          return;
        }
        this.botaoUploadEnabled = false;
      case 1:
        this.botaoUploadEnabled = true;
        return;
      case 3:
        this.botaoUploadEnabled = true;
        return;
    }

    // foreach em cada master

  }

  OnClickUpload(e: any) {
    let result = confirm("<i>Você tem certeza?</i>", "Você está prestes a enviar os dados para a Receita Federal. Confirma ?");
    result.then((dialogResult) => {
      if (dialogResult) {
        this.UploadCompleto();
      }
    });
  }

}