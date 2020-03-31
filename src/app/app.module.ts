import { AdminModule } from './admin/admin.module';

import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { BootstrapInterfaceModule } from './_shared/bootstrap-interface/bootstrap-interface.module';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NewRequestComponent } from './website/new-request/new-request.component';
import { WidgetModule } from './_shared/widget/widget.module';
import { LoginComponent } from './auth/login/login.component';
import { HttpErrorInterceptor } from './_middleware/http/http-error.interceptor';
import { HttpAuthInterceptor } from './_middleware/http/http-auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    NewRequestComponent,
    LoginComponent
  ],
  imports: [
    WidgetModule,
    BootstrapInterfaceModule,
    HttpClientModule,
    RouterModule,

    AdminModule,

    AppRoutingModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpAuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
