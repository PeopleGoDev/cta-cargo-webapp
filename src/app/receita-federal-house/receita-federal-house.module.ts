import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceitaFederalHouseComponent } from './receita-federal-house.component';
import { DxButtonGroupModule, DxButtonModule, DxDataGridModule, DxDateBoxModule, DxLoadPanelModule, DxPopupModule, DxToolbarModule } from 'devextreme-angular';
import { HouseClient } from 'app/shared/proxy/ctaapi';


@NgModule({
  declarations: [ReceitaFederalHouseComponent],
  imports: [
    CommonModule,
    DxButtonModule,
    DxDateBoxModule,
    DxButtonGroupModule,
    DxPopupModule,
    DxToolbarModule,
    DxDataGridModule
  ],
  providers: [HouseClient]
})
export class ReceitaFederalHouseModule { }
