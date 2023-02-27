import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxPopupModule, DxTextBoxModule, DxValidatorModule, DxLoadPanelModule, DxDataGridModule, DxButtonModule } from 'devextreme-angular';
import { CiaaereasComponent } from './ciaaereas.component';
import { HttpClientModule } from '@angular/common/http'
import { PipesModule } from 'app/shared/util/pipes.module';
import { CiaAereaClient, UploadClient } from 'app/shared/proxy/ctaapi';

@NgModule({
  declarations: [ CiaaereasComponent ],
  imports: [
    CommonModule,
    DxLoadPanelModule,
    DxDataGridModule,
    DxPopupModule,
    DxTextBoxModule,
    DxValidatorModule,
    DxButtonModule,
    HttpClientModule,
    PipesModule
  ],
  providers: [CiaAereaClient, UploadClient]
})
export class CiaaereasModule { }
