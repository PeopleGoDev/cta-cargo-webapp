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
  providers: [PortoIATAClient]
})
export class HousesModule { }
