import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LbdchartModule } from '../lbdchart/lbdchart.module';
import { HomeComponent } from './home.component';

@NgModule({
  declarations: [ HomeComponent ],
  imports: [
    CommonModule,
    LbdchartModule
  ],
  exports: [ HomeComponent]
})
export class HomeModule { }
