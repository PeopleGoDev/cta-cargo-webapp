import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortoIataComponent } from './porto-iata.component';
import { DxDataGridModule, DxLoadPanelModule } from 'devextreme-angular';

@NgModule({
  declarations: [PortoIataComponent],
  imports: [
    CommonModule,
    DxDataGridModule,
    DxLoadPanelModule
  ],
  exports: [PortoIataComponent]
})
export class PortoIataModule { }
