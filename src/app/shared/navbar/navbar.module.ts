import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { DxPopupModule, DxSelectBoxModule, DxButtonModule } from 'devextreme-angular';

@NgModule({
    imports: [
        RouterModule, 
        CommonModule, 
        DxPopupModule, 
        DxSelectBoxModule,
        DxButtonModule],
    declarations: [NavbarComponent],
    exports: [NavbarComponent]
})

export class NavbarModule { }
