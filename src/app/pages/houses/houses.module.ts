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
  DxAutocompleteModule} from 'devextreme-angular';
import { PipesModule } from 'app/shared/util/pipes.module';
import { PortoIATAClient } from 'app/shared/proxy/ctaapi';
import { NCMService } from 'app/shared/services/ncm.service';

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
    PipesModule
  ],
  exports: [HousesComponent],
  providers: [PortoIATAClient, NCMService]
})
export class HousesModule { }
