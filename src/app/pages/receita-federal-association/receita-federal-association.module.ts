import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceitaFederalAssociationComponent } from './receita-federal-association.component';
import { DxButtonGroupModule, DxButtonModule, DxDataGridModule, DxDateBoxModule, DxPopupModule, DxToolbarModule } from 'devextreme-angular';
import { ButtonModule } from '@shared/atoms/button/button.module';
import { PipesModule } from 'app/shared/util/pipes.module';

@NgModule({
  declarations: [ReceitaFederalAssociationComponent],
  imports: [
    CommonModule,
    DxButtonModule,
    DxDateBoxModule,
    DxButtonGroupModule,
    DxPopupModule,
    DxToolbarModule,
    DxDataGridModule,
    PipesModule,
    ButtonModule
  ]
})
export class ReceitaFederalAssociationModule { }
