import { AdminModule } from './admin/admin.module';

import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { BootstrapInterfaceModule } from './_shared/bootstrap-interface/bootstrap-interface.module';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BootstrapInterfaceModule,
    HttpClientModule,
    RouterModule,

    AdminModule,

    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
