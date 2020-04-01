import { AuthService } from './../../_services/auth.service';
import { Injectable } from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(public auth: AuthService, public router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {

    const expectedRoles = 'expectedRoles' in route.data ? route.data.expectedRole : [];

    if (!this.auth.isLoggedIn() || (expectedRoles.length !== 0 && expectedRoles.indexOf(this.auth.currentUserValue.role.slug) === -1 )) {
      this.router.navigate(['user/login']);
      return false;
    }
    return true;
  }
}
