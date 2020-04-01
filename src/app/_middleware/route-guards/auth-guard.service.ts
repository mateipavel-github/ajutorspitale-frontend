import { AuthService } from './../../_services/auth.service';
import { Injectable } from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(public auth: AuthService, public router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {

    const expectedRole = 'expectedRole' in route.data ? route.data.expectedRole : '';

    if ( !this.auth.isLoggedIn() || (expectedRole !== '' && this.auth.currentUserValue.role !== expectedRole)) {
      this.router.navigate(['user/login']);
      return false;
    }
    return true;
  }
}
