import { BootstrapInterfaceModule } from './../_shared/bootstrap-interface/bootstrap-interface.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { ListRequestsComponent } from './requests/list-requests/list-requests.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminComponent } from './admin.component';
import { EditRequestComponent } from './requests/edit-request/edit-request.component';
import { EditRequestNeedsComponent } from './requests/edit-request/edit-request-needs/edit-request-needs.component';
import { EditRequestDataComponent } from './requests/edit-request/edit-request-data/edit-request-data.component';



@NgModule({
  declarations: [ListRequestsComponent, DashboardComponent, AdminComponent, EditRequestComponent, EditRequestNeedsComponent, EditRequestDataComponent],
  imports: [
    CommonModule,
    BootstrapInterfaceModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
