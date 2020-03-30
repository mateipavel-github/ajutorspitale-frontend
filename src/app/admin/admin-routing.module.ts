import { EditRequestComponent } from './requests/edit-request/edit-request.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ListRequestsComponent } from './requests/list-requests/list-requests.component';
import { AdminComponent } from './admin.component';



const routes: Routes = [
  {
    path: 'admin', component: AdminComponent,
    children: [
      { path: 'requests', component: ListRequestsComponent },
      { path: 'request/:id', component: EditRequestComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class AdminRoutingModule { }
