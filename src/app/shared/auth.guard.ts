import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { LocalStorageService } from './services/localstorage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router,
    private localstorage: LocalStorageService) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let res = this.localstorage.getLocalStore();
    if (res !== undefined && res.AccessToken) {
      return true;
    }
    return this.router.parseUrl('notfound');
  }
}

@Injectable({
  providedIn: 'root'
})
export class AirCargoGuard implements CanActivate {
  constructor(private router: Router,
    private localstorage: LocalStorageService) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let res = this.localstorage.getLocalStore();
    if (res !== undefined && res.AccessToken &&
      (res.UsuarioInfo?.UserProfile === "AirCargo" || res.UsuarioInfo?.UserProfile === "Both")) {
      return true;
    }
    return this.router.parseUrl('notfound');
  }
}

@Injectable({
  providedIn: 'root'
})
export class FreightFowarderGuard implements CanActivate {
  constructor(private router: Router,
    private localstorage: LocalStorageService) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let res = this.localstorage.getLocalStore();
    if (res !== undefined && res.AccessToken &&
      (res.UsuarioInfo?.UserProfile === "FreightFowarder" || res.UsuarioInfo?.UserProfile === "Both")) {
      return true;
    }
    return this.router.parseUrl('notfound');
  }
}