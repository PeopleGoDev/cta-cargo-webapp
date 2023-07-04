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
  DxTagBoxModule, 
  DxDropDownButtonModule} from 'devextreme-angular';
import { PipesModule } from 'app/shared/util/pipes.module';
import { MasterClient, VooClient } from 'app/shared/proxy/ctaapi';
import { SharedModule } from 'app/shared/shared.module';
import { NcmSelectorModule } from 'app/shared/components/ncm-selector/ncm-selector.module';

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
    DxDropDownButtonModule,
    PipesModule,
    NcmSelectorModule,
    SharedModule
  ],
  exports: [MastersComponent],
  providers: [MasterClient, VooClient]
})
export class MastersModule { }
