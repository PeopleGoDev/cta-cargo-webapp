import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousesComponent } from './houses.component';
import { DxDataGridModule , 
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
  DxAutocompleteModule,
  DxSwitchModule} from 'devextreme-angular';
import { PipesModule } from 'app/shared/util/pipes.module';
import { CertificadoDigitalClient, NcmClient, PortoIATAClient } from 'app/shared/proxy/ctaapi';
import { NcmSelectorModule } from 'app/shared/components/ncm-selector/ncm-selector.module';
import { SpecialInstructionModule } from 'app/shared/components/special-instruction/special-instruction.module';

@NgModule({
  declarations: [HousesComponent],
  imports: [
    CommonModule,
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
    DxAutocompleteModule,
    DxSwitchModule,
    NcmSelectorModule,
    SpecialInstructionModule,
    PipesModule
  ],
  exports: [HousesComponent],
  providers: [PortoIATAClient, CertificadoDigitalClient]
})
export class HousesModule { }
