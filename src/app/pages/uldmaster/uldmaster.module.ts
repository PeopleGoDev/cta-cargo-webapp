import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DxDataGridModule,
  DxToolbarModule,
  DxButtonModule,
  DxDateBoxModule,
  DxButtonGroupModule,
  DxPopupModule,
  DxFormModule,
  DxTextBoxModule,
  DxValidatorModule,
  DxScrollViewModule
} from 'devextreme-angular';
import { UldmasterComponent } from './uldmaster.component';
import { MasteruldsumarioComponent } from 'app/pages/uldmaster/components/masteruldsumario/masteruldsumario.component';
import { UldClient, VooClient } from 'app/shared/proxy/ctaapi';
import { PipesModule } from 'app/shared/util/pipes.module';
import { UldMasterDetailComponent } from './components/uld-master-detail/uld-master-detail.component';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
  declarations: [UldmasterComponent, MasteruldsumarioComponent, UldMasterDetailComponent],
  imports: [
    CommonModule,
    DxDataGridModule,
    DxToolbarModule,
    DxButtonModule,
    DxDateBoxModule,
    DxButtonGroupModule,
    DxPopupModule,
    DxTextBoxModule,
    DxValidatorModule,
    DxFormModule,
    DxScrollViewModule,
    PipesModule,
    SharedModule
  ],
  exports: [UldmasterComponent],
  providers: [VooClient, UldClient]
})
export class UldmasterModule { }
