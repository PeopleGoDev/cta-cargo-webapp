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

  constructor() { }

  ngOnInit(): void {
  }

  click(e: any) {
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

  onTextChange(e: any) {
    this.onChanged.emit(this.value);
  }

  removeTrecho(idx) {
    this.value.splice(idx);
    this.onChanged.emit(this.value);
  }
}
