import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FlightSegmentComponent } from './flight-segment.component';
import { DxAutocompleteModule, DxButtonModule, DxDateBoxModule, DxTextBoxModule } from 'devextreme-angular';

@NgModule({
  declarations: [FlightSegmentComponent],
  imports: [
    CommonModule,
    DxAutocompleteModule,
    DxDateBoxModule,
    DxButtonModule,
    DxTextBoxModule
  ], providers: [DatePipe],
  exports: [FlightSegmentComponent]
})
export class FlightSegmentModule { }
