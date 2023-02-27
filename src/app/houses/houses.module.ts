import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousesComponent } from './houses.component';
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
    PipesModule
  ],
  exports: [HousesComponent]
})
export class HousesModule { }
