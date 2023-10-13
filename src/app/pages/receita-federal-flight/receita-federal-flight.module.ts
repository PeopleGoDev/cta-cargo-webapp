import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceitaFederalFlightComponent } from './receita-federal-flight.component';
import { DxButtonModule,
  DxDateBoxModule,
  DxButtonGroupModule,
  DxToolbarModule,
  DxDataGridModule, 
  DxDropDownButtonModule} from 'devextreme-angular';
import { ReceitaFederalClient } from 'app/shared/proxy/ctaapi';
import { ButtonModule } from 'app/@shared/atoms/button/button.module';
import { PipesModule } from 'app/shared/util/pipes.module';

@NgModule({
  declarations: [ReceitaFederalFlightComponent],
  imports: [
    CommonModule,
    DxButtonModule,
    DxDateBoxModule,
    DxButtonGroupModule,
    DxToolbarModule,
    DxDataGridModule,
    DxDropDownButtonModule,
    PipesModule,
    ButtonModule
  ],
  exports: [ReceitaFederalFlightComponent],
  providers: [ReceitaFederalClient]
})

export class ReceitaFederalFlightModule { }
