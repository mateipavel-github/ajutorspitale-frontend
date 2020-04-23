import { AuthService } from './../../_services/auth.service';
import { Injectable } from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(public auth: AuthService, public router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {

    const accessScopes = route.data?.accessScopes || null;

    if (accessScopes !== null && !this.auth.hasAccess(accessScopes)) {
      this.router.navigate(['user/login']);
      return false;
    }

    return true;
  }
}
