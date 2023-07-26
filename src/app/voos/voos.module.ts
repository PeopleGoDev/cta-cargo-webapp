import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoosComponent } from './voos.component';
import { DxLoadPanelModule, DxDataGridModule, DxDateBoxModule } from 'devextreme-angular';
import { VooClient } from 'app/shared/proxy/ctaapi';
import { FlightSegmentModule } from 'app/shared/components/flight-segment/flight-segment.module';

@NgModule({
  declarations: [VoosComponent],
  imports: [
    CommonModule,
    DxLoadPanelModule, 
    DxDataGridModule,
    DxDateBoxModule,
    FlightSegmentModule
  ],
  exports: [ VoosComponent],
  providers: [VooClient]
})
export class VoosModule { }
