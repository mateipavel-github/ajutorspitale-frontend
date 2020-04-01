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



const routes: Routes = [
  {
    path: 'admin', component: AdminComponent, canActivate: [AuthGuardService],
    children: [
      { path: 'requests', component: ListRequestsComponent, data: {expectedRoles: ['admin', 'volunteer']} },
      { path: 'requests/:flag', component: ListRequestsComponent, data: { expectedRoles: ['admin', 'volunteer'] } },
      { path: 'request/:id', component: EditRequestComponent, data: { expectedRoles: ['admin', 'volunteer'] } },
      { path: 'deliveries', component: ListDeliveriesComponent, data: { expectedRoles: ['admin', 'volunteer', 'delivery_agent'] } },
      { path: 'deliveries/:flag', component: ListDeliveriesComponent, data: { expectedRoles: ['admin', 'volunteer', 'delivery_agent'] } },
      { path: 'delivery/:id', component: EditDeliveryComponent, data: { expectedRoles: ['admin', 'volunteer', 'delivery_agent'] }  },
      { path: 'delivery/new', component: EditDeliveryComponent, data: { expectedRoles: ['admin', 'volunteer', 'delivery_agent'] } },
      { path: 'metadata', component: MetadataEditorComponent, data: { expectedRoles: ['admin'] } },
      { path: 'users', component: ListUsersComponent, data: { expectedRoles: ['admin'] } }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class AdminRoutingModule { }
