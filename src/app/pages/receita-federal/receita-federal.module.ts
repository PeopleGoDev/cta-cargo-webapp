import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceitaFederalComponent } from './receita-federal.component';
import { DxButtonModule,
  DxDateBoxModule,
  DxButtonGroupModule,
  DxToolbarModule,
  DxDataGridModule } from 'devextreme-angular';
import { ReceitaFederalClient } from 'app/shared/proxy/ctaapi';
import { ButtonModule } from 'app/@shared/atoms/button/button.module';
import { PipesModule } from 'app/shared/util/pipes.module';

@NgModule({
  declarations: [ReceitaFederalComponent],
  imports: [
    CommonModule,
    DxButtonModule,
    DxDateBoxModule,
    DxButtonGroupModule,
    DxToolbarModule,
    DxDataGridModule,
    PipesModule,
    ButtonModule
  ],
  exports: [ ReceitaFederalComponent ],
  providers: [ReceitaFederalClient]
})

export class ReceitaFederalModule { }
