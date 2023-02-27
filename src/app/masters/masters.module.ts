import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MastersComponent } from './masters.component';
import { DxLoadPanelModule, 
  DxDataGridModule , 
  DxSelectBoxModule, 
  DxDateBoxModule, 
  DxButtonGroupModule, 
  DxNumberBoxModule, 
  DxToolbarModule,
  DxTextBoxModule, 
  DxButtonModule,
  DxValidatorModule,
  DxValidationGroupModule,
  DxTagBoxModule } from 'devextreme-angular';
import { PipesModule } from 'app/shared/util/pipes.module';
import { MasterClient, VooClient } from 'app/shared/proxy/ctaapi';
import { MasterDetailComponent } from './components/master-detail/master-detail.component';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
  declarations: [MastersComponent],
  imports: [
    CommonModule,
    DxDataGridModule,
    DxSelectBoxModule,
    DxDateBoxModule,
    DxNumberBoxModule,
    DxToolbarModule,
    DxTextBoxModule,
    DxButtonGroupModule,
    DxButtonModule,
    DxValidatorModule,
    DxValidationGroupModule,
    DxTagBoxModule,
    PipesModule,
    SharedModule
  ],
  exports: [MastersComponent],
  providers: [MasterClient, VooClient]
})
export class MastersModule { }
