import { WidgetModule } from './../_shared/widget/widget.module';
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
import { ListDeliveriesComponent } from './deliveries/list-deliveries/list-deliveries.component';
import { EditDeliveryComponent } from './deliveries/edit-delivery/edit-delivery.component';



@NgModule({
  // tslint:disable-next-line:max-line-length
  declarations: [
    ListRequestsComponent,
    DashboardComponent,
    AdminComponent,
    EditRequestComponent,
    EditRequestNeedsComponent,
    EditRequestDataComponent,
    ListDeliveriesComponent,
    EditDeliveryComponent
  ],
  imports: [
    CommonModule,
    WidgetModule,
    BootstrapInterfaceModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
