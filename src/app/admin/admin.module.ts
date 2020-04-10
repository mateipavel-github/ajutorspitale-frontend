import { EditOfferComponent } from './offers/edit-offer/edit-offer.component';
import { ListOffersComponent } from './offers/list-offers/list-offers.component';
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
import { MetadataEditorComponent } from './metadata/editor/metadata-editor.component';
import { RequestsFilterFormComponent } from './requests/list-requests/filter-form/filter-form.component';
import { OffersFilterFormComponent } from './offers/list-offers/filter-form/filter-form.component';
import { ListUsersComponent } from './users/list-users/list-users.component';
import { MatTableModule } from '@angular/material/table';
import { EditOfferNeedsComponent } from './offers/edit-offer/edit-offer-needs/edit-offer-needs.component';
import { EditOfferDataComponent } from './offers/edit-offer/edit-offer-data/edit-offer-data.component';



@NgModule({
  // tslint:disable-next-line:max-line-length
  declarations: [
    ListRequestsComponent,
    ListOffersComponent,
    EditOfferComponent,
    EditOfferNeedsComponent,
    EditOfferDataComponent,
    DashboardComponent,
    AdminComponent,
    EditRequestComponent,
    EditRequestNeedsComponent,
    EditRequestDataComponent,
    ListDeliveriesComponent,
    EditDeliveryComponent,
    MetadataEditorComponent,
    RequestsFilterFormComponent,
    OffersFilterFormComponent,
    ListUsersComponent
  ],
  imports: [
    CommonModule,
    WidgetModule,
    BootstrapInterfaceModule,
    MatTableModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
