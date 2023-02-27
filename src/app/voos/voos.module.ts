import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoosComponent } from './voos.component';
import { DxLoadPanelModule, DxDataGridModule, DxDateBoxModule } from 'devextreme-angular';
import { VooClient } from 'app/shared/proxy/ctaapi';

@NgModule({
  declarations: [VoosComponent],
  imports: [
    CommonModule,
    DxLoadPanelModule, 
    DxDataGridModule,
    DxDateBoxModule
  ],
  exports: [ VoosComponent],
  providers: [VooClient]
})
export class VoosModule { }
