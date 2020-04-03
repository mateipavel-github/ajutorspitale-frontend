import { LoginComponent } from './auth/login/login.component';
import { NewRequestComponent } from './website/new-request/new-request.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { 'path': '', redirectTo: 'user/login', pathMatch: 'full'},
  { 'path': 'new-request', component: NewRequestComponent },
  { 'path': 'new-request/:id', component: NewRequestComponent },
  //
  { 'path': 'user/login', component: LoginComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
