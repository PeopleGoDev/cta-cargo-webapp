import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NaturezaCargaComponent } from './natureza-carga.component';
import { DxDataGridModule, DxLoadPanelModule } from 'devextreme-angular';

@NgModule({
  declarations: [NaturezaCargaComponent],
  imports: [
    CommonModule,
    DxDataGridModule,
    DxLoadPanelModule
  ],
  exports: [NaturezaCargaComponent]
})
export class NaturezaCargaModule { }
