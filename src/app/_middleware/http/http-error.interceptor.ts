import { Router } from '@angular/router';
import { AuthService } from '../../_services/auth.service';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService, private router: Router) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                this.authService.logout();
                this.router.navigate(['user', 'login']);
            }
            if (err.status === 500) {
                alert('Server error');
            }
            console.log(err);
            const error = err.error.message || err.statusText;
            return throwError(err.error);
        }));
    }
}
