import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxButtonModule, DxDataGridModule, DxLoadPanelModule, DxPopupModule, DxTextBoxModule, DxValidatorModule } from 'devextreme-angular';
import { AgenteCargaComponent } from './agente-carga.component';
import { PipesModule } from 'app/shared/util/pipes.module';
import { AgenteDeCargaClient, UploadClient } from 'app/shared/proxy/ctaapi';

@NgModule({
  declarations: [AgenteCargaComponent],
  imports: [
    CommonModule,
    DxLoadPanelModule,
    DxDataGridModule,
    DxPopupModule,
    DxTextBoxModule,
    DxValidatorModule,
    DxButtonModule,
    PipesModule
  ],
  providers: [AgenteDeCargaClient, UploadClient]
})
export class AgenteCargaModule { }
