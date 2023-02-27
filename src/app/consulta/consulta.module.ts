import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsultaComponent } from './consulta.component';
import { MasterDetailComponent } from 'app/masters/components/master-detail/master-detail.component';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
  declarations: [ConsultaComponent],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [ConsultaComponent]
})
export class ConsultaModule { }
