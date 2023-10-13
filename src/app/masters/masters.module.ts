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
  DxDropDownButtonModule,
  DxPopupModule,
  DxFileUploaderModule,
  DxScrollViewModule} from 'devextreme-angular';
import { PipesModule } from 'app/shared/util/pipes.module';
import { MasterClient, VooClient } from 'app/shared/proxy/ctaapi';
import { SharedModule } from 'app/shared/shared.module';
import { NcmSelectorModule } from 'app/shared/components/ncm-selector/ncm-selector.module';
import { SpecialInstructionModule } from 'app/shared/components/special-instruction/special-instruction.module';

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
    DxTextBoxModule,
    PipesModule,
    NcmSelectorModule,
    SpecialInstructionModule,
    DxFileUploaderModule,
    DxPopupModule,
    DxScrollViewModule,
    SharedModule
  ],
  exports: [MastersComponent],
  providers: [MasterClient, VooClient]
})
export class MastersModule { }
