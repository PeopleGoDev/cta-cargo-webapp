import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { DxPopupModule, DxSelectBoxModule, DxButtonModule, DxTextBoxModule, DxValidatorModule } from 'devextreme-angular';

@NgModule({
    imports: [
        RouterModule, 
        CommonModule, 
        DxPopupModule, 
        DxSelectBoxModule,
        DxButtonModule,
        DxTextBoxModule,
        DxValidatorModule
        ],
    declarations: [NavbarComponent],
    exports: [NavbarComponent]
})

export class NavbarModule { }
