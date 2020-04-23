import { HasUnsavedData } from './_interfaces/has-unsaved-data.interface';
import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UnsavedDataGuardGuard implements CanDeactivate<unknown> {
  canDeactivate(
    component: HasUnsavedData,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (component.hasUnsavedData && component.hasUnsavedData()) {
      return confirm('Ai făcut modificări care nu sunt salvate. Sigur vrei să pleci?');
    }

    return true;

  }
  
}
