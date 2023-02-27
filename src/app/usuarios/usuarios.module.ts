import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule, DxDateBoxModule, DxLoadPanelModule } from 'devextreme-angular';
import { UsuariosComponent } from './usuarios.component';

@NgModule({
  declarations: [UsuariosComponent],
  imports: [
    CommonModule,
    DxDataGridModule,
    DxDateBoxModule,
    DxLoadPanelModule
  ]
})
export class UsuariosModule { }
