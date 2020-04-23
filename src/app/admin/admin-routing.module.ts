import { EditOfferComponent } from './offers/edit-offer/edit-offer.component';
import { ListOffersComponent } from './offers/list-offers/list-offers.component';
import { ListUsersComponent } from './users/list-users/list-users.component';
import { MetadataEditorComponent } from './metadata/editor/metadata-editor.component';
import { AuthGuardService } from './../_middleware/route-guards/auth-guard.service';
import { ListDeliveriesComponent } from './deliveries/list-deliveries/list-deliveries.component';
import { EditDeliveryComponent } from './deliveries/edit-delivery/edit-delivery.component';
import { EditRequestComponent } from './requests/edit-request/edit-request.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListRequestsComponent } from './requests/list-requests/list-requests.component';
import { AdminComponent } from './admin.component';
import { ReportsComponent } from './reports/reports.component';
import { DeliveryPlanningComponent } from './offers/delivery-planning/delivery-planning.component';
import { UnsavedDataGuardGuard } from '../unsaved-data-guard.guard';



const routes: Routes = [
  {
    path: 'admin', component: AdminComponent, canActivate: [AuthGuardService],
    children: [
      { path: 'requests', component: ListRequestsComponent, data: {accessScopes: ['requests.list']} },
      { path: 'requests/:flag', component: ListRequestsComponent, data: { accessScopes: ['requests.list'] } },
      { path: 'request/:id', component: EditRequestComponent, data: { accessScopes: ['requests.edit'] } },

      { path: 'offers', component: ListOffersComponent, data: { accessScopes: ['offers.list'] } },
      { path: 'offers/:flag', component: ListOffersComponent, data: { accessScopes: ['offers.list'] } },
      { path: 'offer/:id', component: EditOfferComponent, data: { accessScopes: ['offers.edit'] } },
      {
        path: 'delivery-plan/:plan_id',
        component: DeliveryPlanningComponent,
        canDeactivate: [UnsavedDataGuardGuard],
        data: {
          accessScopes: ['deliveryplans.list']
        }
      },
      { path: 'delivery-plan/:plan_id/:offer_id', component: DeliveryPlanningComponent, data: { accessScopes: ['deliveryplans.list'] } },

      { path: 'deliveries/:flag', component: ListDeliveriesComponent, data: { accessScopes: ['deliveryplans.list'] } },
      { path: 'delivery/:id', component: EditDeliveryComponent, data: { accessScopes: ['deliveries.edit'] }  },
      { path: 'delivery/new', component: EditDeliveryComponent, data: { accessScopes: ['deliveries.edit'] } },

      { path: 'metadata', component: MetadataEditorComponent, data: { accessScopes: ['metadata.edit'] } },
      { path: 'metadata/:type', component: MetadataEditorComponent, data: { accessScopes: ['metadata.edit'] } },
      { path: 'users', component: ListUsersComponent, data: { accessScopes: ['users.list'] } },

      { path: 'reports', component: ReportsComponent, data: { accessScopes: ['exports'] } },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class AdminRoutingModule { }
