import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceitaFederalFlightComponent } from './receita-federal-flight.component';
import { DxButtonModule,
  DxDateBoxModule,
  DxButtonGroupModule,
  DxToolbarModule,
  DxDropDownButtonModule,
  DxPopupModule} from 'devextreme-angular';
import { ReceitaFederalClient } from 'app/shared/proxy/ctaapi';
import { ButtonModule } from 'app/@shared/atoms/button/button.module';
import { PipesModule } from 'app/shared/util/pipes.module';
import { FlightDetailComponent } from './flight-detail/flight-detail.component';

@NgModule({
  declarations: [ReceitaFederalFlightComponent, FlightDetailComponent],
  imports: [
    CommonModule,
    DxButtonModule,
    DxDateBoxModule,
    DxButtonGroupModule,
    DxToolbarModule,
    DxDropDownButtonModule,
    PipesModule,
    ButtonModule,
    DxPopupModule
  ],
  exports: [ReceitaFederalFlightComponent],
  providers: [ReceitaFederalClient]
})

export class ReceitaFederalFlightModule { }
