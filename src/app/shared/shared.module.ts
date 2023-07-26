import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'app/@shared/atoms/button/button.module';
import { InputComponent } from '@shared/atoms/input/input.component';
import { FormsModule } from '@angular/forms';
import { TextMaskModule } from 'angular2-text-mask';
import { MasterDetailComponent } from 'app/masters/components/master-detail/master-detail.component';
import { SelectComponent } from '@shared/atoms/select/select.component';
import { TitleComponent } from './components/title/title.component';
import { NcmSelectorModule } from './components/ncm-selector/ncm-selector.module';
import { FlightSegmentModule } from './components/flight-segment/flight-segment.module';

@NgModule({
  declarations: [InputComponent, SelectComponent, MasterDetailComponent, TitleComponent],
  imports: [
    CommonModule,
    ButtonModule,
    FormsModule,
    TextMaskModule,
    NcmSelectorModule,
    FlightSegmentModule
  ], 
  exports: [InputComponent, SelectComponent, MasterDetailComponent, TitleComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule { }
