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
    PipesModule
  ],
  exports: [HousesComponent],
  providers: [PortoIATAClient, CertificadoDigitalClient]
})
export class HousesModule { }
