import { BootstrapInterfaceModule } from './../_shared/bootstrap-interface/bootstrap-interface.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { RequestsComponent } from './requests/requests.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminComponent } from './admin.component';



@NgModule({
  declarations: [RequestsComponent, DashboardComponent, AdminComponent],
  imports: [
    CommonModule,
    BootstrapInterfaceModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
