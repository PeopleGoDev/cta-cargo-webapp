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
