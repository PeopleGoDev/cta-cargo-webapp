import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule, DxDateBoxModule, DxLoadPanelModule } from 'devextreme-angular';
import { UsuariosComponent } from './usuarios.component';
import { UsuarioClient } from 'app/shared/proxy/ctaapi';

@NgModule({
  declarations: [UsuariosComponent],
  imports: [
    CommonModule,
    DxDataGridModule,
    DxDateBoxModule,
    DxLoadPanelModule
  ],
  providers: [UsuarioClient]
})
export class UsuariosModule { }
