import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceitaFederalMasterComponent } from './receita-federal-master.component';
import { DxButtonGroupModule, DxButtonModule, DxDataGridModule, DxDateBoxModule, DxToolbarModule } from 'devextreme-angular';
import { PipesModule } from 'app/shared/util/pipes.module';
import { ButtonModule } from '@shared/atoms/button/button.module';

@NgModule({
  declarations: [ReceitaFederalMasterComponent],
  imports: [
    CommonModule,
    DxButtonModule,
    DxDateBoxModule,
    DxButtonGroupModule,
    DxToolbarModule,
    DxDataGridModule,
    PipesModule,
    ButtonModule
  ]
})
export class ReceitaFederalMasterModule { }
