import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NcmSelectorComponent } from './ncm-selector.component';
import { NcmClient } from 'app/shared/proxy/ctaapi';
import { DxAutocompleteModule } from 'devextreme-angular';


@NgModule({
  declarations: [NcmSelectorComponent],
  imports: [
    CommonModule,
    DxAutocompleteModule
  ],
  providers: [NcmClient],
  exports: [NcmSelectorComponent]
})
export class NcmSelectorModule { }
