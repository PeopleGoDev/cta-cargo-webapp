import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoosComponent } from './voos.component';
import { DxLoadPanelModule, DxDataGridModule, DxDateBoxModule, DxButtonModule, DxDrawerModule, DxFormModule, DxScrollViewModule } from 'devextreme-angular';
import { VooClient } from 'app/shared/proxy/ctaapi';
import { FlightSegmentModule } from 'app/shared/components/flight-segment/flight-segment.module';
import { VooCloneSegmentComponent } from './voo-clone-segment/voo-clone-segment.component';

@NgModule({
  declarations: [VoosComponent, VooCloneSegmentComponent],
  imports: [
    CommonModule,
    DxLoadPanelModule, 
    DxDataGridModule,
    DxDateBoxModule,
    DxButtonModule,
    DxDrawerModule,
    DxFormModule,
    DxScrollViewModule,
    FlightSegmentModule
  ],
  exports: [ VoosComponent],
  providers: [VooClient]
})
export class VoosModule { }
