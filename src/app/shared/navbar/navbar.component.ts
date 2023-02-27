import { Component, OnInit, ElementRef } from '@angular/core';
import { ROUTES } from '../../sidebar/sidebar.component';
import { Location } from '@angular/common';
import { LocalStorageService } from '../services/localstorage.service';
import { Router } from '@angular/router';
import { UsuarioLoginInfo } from '../model/usuarioinfo';
import { UsuarioInfoResponse, UsuarioLoginResponse } from '../proxy/ctaapi';

@Component({
    selector: 'navbar-cmp',
    templateUrl: 'navbar.component.html'
})

export class NavbarComponent implements OnInit {
    private listTitles: any[];
    location: Location;
    private toggleButton: any;
    private sidebarVisible: boolean;
    usuarioInfo: UsuarioInfoResponse;
    NomeLogado: string;
    VooSelecionado: string;
    popupVisible: boolean = false;

    constructor(location: Location,
        private element: ElementRef,
        private localstorageService: LocalStorageService,
        private router: Router) {
        this.location = location;
        this.sidebarVisible = false;
    }

    ngOnInit() {
        this.listTitles = ROUTES.filter(listTitle => listTitle.location == 'sidebar');
        const navbar: HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
        this.usuarioInfo = this.localstorageService.getLocalStore().UsuarioInfo;

        if (this.usuarioInfo !== undefined) {
            this.NomeLogado = this.usuarioInfo.Nome + ' ' + this.usuarioInfo.Sobrenome;
        }
    }

    sidebarOpen() {
        const toggleButton = this.toggleButton;
        const body = document.getElementsByTagName('body')[0];
        setTimeout(function () {
            toggleButton.classList.add('toggled');
        }, 500);
        body.classList.add('nav-open');

        this.sidebarVisible = true;
    };

    sidebarClose() {
        const body = document.getElementsByTagName('body')[0];
        this.toggleButton.classList.remove('toggled');
        this.sidebarVisible = false;
        body.classList.remove('nav-open');
    };

    sidebarToggle() {
        if (this.sidebarVisible === false) {
            this.sidebarOpen();
        } else {
            this.sidebarClose();
        }
    };

    getTitle() {
        var titlee = this.location.prepareExternalUrl(this.location.path());
        if (titlee.charAt(0) === '#') {
            titlee = titlee.slice(1);
        }

        for (var item = 0; item < this.listTitles.length; item++) {
            if (this.listTitles[item].path === titlee) {
                return this.listTitles[item].title;
            }
        }
        return 'Dashboard';
    }

    logout() {
        this.localstorageService.logout();
        this.router.navigate(['/login']);
    }


}
