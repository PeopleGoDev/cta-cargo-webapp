import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpecialInstructionComponent } from './special-instruction.component';
import { DxAutocompleteModule } from 'devextreme-angular';
import { NaturezaCargaClient } from 'app/shared/proxy/ctaapi';



@NgModule({
  declarations: [SpecialInstructionComponent],
  imports: [
    CommonModule,
    DxAutocompleteModule
  ], providers: [NaturezaCargaClient],
  exports: [SpecialInstructionComponent]
})
export class SpecialInstructionModule { }
