import { environment } from 'src/environments/environment';
import { DataService } from 'src/app/_services/data.service';
import { Injectable } from '@angular/core';
import { switchMap, map, catchError } from 'rxjs/operators';
import { of, BehaviorSubject, Observable } from 'rxjs';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements CanActivate {

  private currentUserSubject: BehaviorSubject<any>;
  public currentUser$: Observable<any>;

  constructor(private dataService: DataService, private router: Router) {
    this.currentUserSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  public isLoggedIn() {
    return this.currentUserSubject.value !== null;
  }

  public login(data: any) {

    data = {
      'login_identifier': data.login_identifier,
      'password': data.password,
    };

    return this.dataService.login(data).pipe(
      catchError(err => of(err)),
      map(serverResponse => {
        if (serverResponse.success) {
          const user = serverResponse.data.user;
          user.accessToken = serverResponse.data.access_token;
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
        return serverResponse;
      })
    );
  }

  public logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  canActivate(): boolean {
    if (!this.currentUserValue().id) {
      this.router.navigate(['login']);
      return false;
    } else {
      return true;
    }
  }
}
