import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxButtonModule, DxLoadIndicatorModule } from 'devextreme-angular';
import { LoginComponent } from './login.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AccountClient } from 'app/shared/proxy/ctaapi';

@NgModule({
  declarations: [ LoginComponent ],
  imports: [
    CommonModule,
    DxButtonModule,
    DxLoadIndicatorModule,
    FormsModule,
    HttpClientModule
  ],
  exports: [ LoginComponent ],
  providers: [AccountClient]
})
export class LoginModule { }
