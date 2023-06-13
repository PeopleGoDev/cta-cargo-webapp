import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'app/shared/services/localstorage.service';
import { environment } from '../../environments/environment';

declare const $: any;
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
    location: string;
}
export const ROUTES: RouteInfo[] = [
    { path: 'painel', title: 'Painel de Controle',  icon: 'pe-7s-graph', class: '', location: 'sidebar' },
    { path: 'voos', title: 'Manifestar Voos',  icon: 'pe-7s-plane', class: '', location: 'sidebar' },
    { path: 'uldtag', title: 'ULD Tag',  icon: 'pe-7s-plugin', class: '', location: 'sidebar' },
    { path: 'masters', title: 'Manifestar Master',  icon: 'pe-7s-folder', class: '', location: 'sidebar' },
    { path: 'houses', title: 'Manifestar House',  icon: 'pe-7s-box2', class: '', location: 'sidebar' },
    { path: 'receita-federal', title: 'Submeter Voo RFB',  icon: 'pe-7s-cloud-upload', class: '', location: 'sidebar' },
    { path: 'receita-federal-master', title: 'Submeter Master RFB',  icon: 'pe-7s-cloud-upload', class: '', location: 'sidebar' },
    { path: 'receita-federal-house', title: 'Submeter House RFB',  icon: 'pe-7s-cloud-upload', class: '', location: 'sidebar' },
    { path: 'ciasaerea', title: 'Companhias Aéreas',  icon: 'pe-7s-folder', class: '', location: 'menuadmin' },
    { path: 'usuarios', title: 'Usuários',  icon: 'pe-7s-folder', class: '', location: 'menuadmin' },
    { path: 'porto-iata', title: 'Portos',  icon: 'pe-7s-folder', class: '', location: 'menuadmin' },
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})

export class SidebarComponent implements OnInit {
  menuItems: any[];
  company: string = '';
  imageUrl: string = '/assets/img/flying plane_1567082.png';

  constructor(private localstorage: LocalStorageService,
    private router: Router) { }

  ngOnInit() {
    const storage = this.localstorage.getLocalStore();
    this.company = storage.UsuarioInfo?.EmpresaNome ?? environment.company;
    this.imageUrl = storage.UsuarioInfo?.EmpresaLogoUrl ?? '/assets/img/flying plane_1567082.png';
    this.menuItems = ROUTES.filter(menuItem => menuItem.location == 'sidebar' );
  }

  isMobileMenu() {
      if ($(window).width() > 991) {
          return false;
      }
      return true;
  };

  logout() {
    this.localstorage.logout();
    this.router.navigate(['/login']);
  }
}
