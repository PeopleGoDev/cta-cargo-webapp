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
  @Output('onScheduleClick') scheduleClick = new EventEmitter<any>();
  @Output('onActualClick') actualClick = new EventEmitter<any>();

  displayedStatus = RfbStatus;
  isScheduleAvailable: boolean = false;
  isActualAvailable: boolean = false;
  buttonScheduleCaption = "Submeter Saída Estimativa";
  buttonRealCaption = "Submeter Saída Real";
  flightTypeEnum = FlightTypeEnum;

  ngOnChanges(changes: SimpleChanges) {
    this.isScheduleAvailable = false;
    this.isActualAvailable = false;
    this.buttonScheduleCaption = "Submeter Saída Estimativa";
    this.buttonRealCaption = "Submeter Saída Real";

    if (this.voo) {
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
    this.scheduleClick.emit(e);
  }

  onActualClick(e: any) {
    this.actualClick.emit(e);
  }
}
