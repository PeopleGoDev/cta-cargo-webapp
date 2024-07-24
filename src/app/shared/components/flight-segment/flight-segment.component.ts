import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { VooTrechoResponse } from 'app/shared/proxy/ctaapi';

@Component({
  selector: 'app-flight-segment',
  templateUrl: './flight-segment.component.html',
  styleUrls: ['./flight-segment.component.css']
})
export class FlightSegmentComponent implements OnInit {

  @Input() value: VooTrechoResponse[] = [];
  @Input() readOnly: boolean = false;
  @Output() onChanged: EventEmitter<VooTrechoResponse[]> = new EventEmitter<VooTrechoResponse[]>();

  customMaskRules: any = {
    X: /[A-Z]/g,
  }

  constructor(private dataPipe: DatePipe) { }

  ngOnInit(): void {
  }

  click(e: any) {
    if (this.readOnly)
      return;

    if (!this.value)
      this.value = [];

    if (this.value.length === 0) {
      this.value.push({ AeroportoDestinoCodigo: '', DataHoraChegadaEstimada: undefined, DataHoraSaidaEstimada: undefined, Id: undefined });
      this.onChanged.emit(this.value);
      return;
    }

    if (this.value[this.value.length - 1].AeroportoDestinoCodigo.trim().length === 3) {
      this.value.push({ AeroportoDestinoCodigo: '', DataHoraChegadaEstimada: undefined, DataHoraSaidaEstimada: undefined, Id: undefined });
      this.onChanged.emit(this.value);
    }
  }

  onDataHoraChegadaEstimadaChanged(e, trecho: VooTrechoResponse) {
    if (e.value instanceof Date) {
      const date: any = this.getUTC(e.value);
      trecho.DataHoraChegadaEstimada = date.toISOString().substring(0, 19);
    }

    if (typeof e.value == 'string')
      trecho.DataHoraChegadaEstimada = e.value;

    this.onChanged.emit(this.value);
  }

  onDataHoraSaidaEstimadaChanged(e, trecho: VooTrechoResponse) {
    if (e.value instanceof Date) {
      const date: any = this.getUTC(e.value);
      trecho.DataHoraSaidaEstimada = date.toISOString().substring(0, 19);
    }

    if (typeof e.value == 'string')
      trecho.DataHoraSaidaEstimada = e.value;

    this.onChanged.emit(this.value);
  }

  removeTrecho(idx) {
    this.value.splice(idx,1);
    this.onChanged.emit(this.value);
  }

  private getUTC(date: Date) {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  }
}
