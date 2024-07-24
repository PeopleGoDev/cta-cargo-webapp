import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FlightTypeEnum, RfbStatus } from 'app/shared/collections/data';
import { VooUploadResponse } from 'app/shared/proxy/ctaapi';

@Component({
  selector: 'app-flight-detail',
  templateUrl: './flight-detail.component.html',
  styleUrls: ['./flight-detail.component.css']
})
export class FlightDetailComponent implements OnChanges {
  @Input() voo: VooUploadResponse;
  @Output('onScheduleClick') scheduleClick = new EventEmitter<Date>();
  @Output('onActualClick') actualClick = new EventEmitter<any>();

  displayedStatus = RfbStatus;
  isScheduleAvailable: boolean = false;
  isActualAvailable: boolean = false;
  popupVisible: boolean = false;
  buttonScheduleCaption = "Submeter Saída Estimativa";
  buttonRealCaption = "Submeter Saída Real";
  flightTypeEnum = FlightTypeEnum;
  uploadButtonOptions: any;
  actualTime: Date = null;

  constructor() {
    this.uploadButtonOptions = {
      width: 300,
      text: 'Enviar',
      type: 'default',
      stylingMode: 'contained',
      onClick: () => {
        this.popupVisible = false;
      },
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    this.isScheduleAvailable = false;
    this.isActualAvailable = false;
    this.buttonScheduleCaption = "Submeter Saída Estimativa";
    this.buttonRealCaption = "Submeter Saída Real";

    if (this.voo) {
      this.actualTime = this.voo.DataHoraSaidaReal;
      if (this.voo.SituacaoRFBId !== 2 || this.voo.Reenviar)
        this.isActualAvailable = true;

      if ((this.voo.ScheduleSituationRFB !== 2 && this.voo.SituacaoRFBId !== 2) || this.voo.Reenviar)
        this.isScheduleAvailable = true;

      if (this.voo.SituacaoRFBId === 1) {
        this.buttonRealCaption = "Verificar Voo";
      }

      if (this.voo.ScheduleSituationRFB === 1) {
        this.buttonScheduleCaption = "Verificar Voo Agendamento";
      }
    }
  }

  onScheduleClick(e: any) {
    this.scheduleClick.emit();
  }

  onActualClick(e: any) {
    if (this.buttonRealCaption == 'Verificar Voo') {
      this.actualClick.emit(null);
      return;
    }
    this.popupVisible = true;
  }

  onActualConfirmClick(e: any) {
    this.actualClick.emit(this.actualTime);
    this.popupVisible = false;
  }
}
