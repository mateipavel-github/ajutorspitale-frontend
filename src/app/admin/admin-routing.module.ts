import { MetadataEditorComponent } from './metadata/editor/metadata-editor.component';
import { AuthGuardService } from './../_middleware/route-guards/auth-guard.service';
import { ListDeliveriesComponent } from './deliveries/list-deliveries/list-deliveries.component';
import { EditDeliveryComponent } from './deliveries/edit-delivery/edit-delivery.component';
import { EditRequestComponent } from './requests/edit-request/edit-request.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ListRequestsComponent } from './requests/list-requests/list-requests.component';
import { AdminComponent } from './admin.component';



const routes: Routes = [
  {
    path: 'admin', component: AdminComponent, canActivate: [AuthGuardService],
    children: [
      { path: 'requests', component: ListRequestsComponent },
      { path: 'requests/:filter', component: ListRequestsComponent },
      { path: 'request/:id', component: EditRequestComponent },
      { path: 'deliveries', component: ListDeliveriesComponent },
      { path: 'deliveries/:filter', component: ListDeliveriesComponent },
      { path: 'delivery/:id', component: EditDeliveryComponent },
      { path: 'delivery/new', component: EditDeliveryComponent },
      { path: 'metadata', component: MetadataEditorComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class AdminRoutingModule { }
