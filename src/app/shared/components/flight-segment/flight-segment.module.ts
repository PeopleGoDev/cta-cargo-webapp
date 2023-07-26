import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  ],
  exports: [FlightSegmentComponent]
})
export class FlightSegmentModule { }
