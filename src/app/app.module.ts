import { NewOfferComponent } from './website/new-offer/new-offer.component';
import { AdminModule } from './admin/admin.module';

import { NgModule, LOCALE_ID } from '@angular/core';
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
import localeRo from '@angular/common/locales/ro';
import { registerLocaleData } from '@angular/common';
import { SnackbarComponent } from './_shared/snackbar/snackbar.component';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { NeedsEditorComponent } from './_shared/needs-editor/needs-editor.component';

// the second parameter 'fr-FR' is optional
registerLocaleData(localeRo, 'ro-RO');

@NgModule({
  declarations: [
    AppComponent,
    NewRequestComponent,
    NewOfferComponent,
    LoginComponent,
    SnackbarComponent
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
    Title,
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpAuthInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'ro-RO' },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 2000, verticalPosition: 'bottom', horizontalPosition: 'left' } }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
