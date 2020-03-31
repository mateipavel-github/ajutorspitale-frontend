import { LoadingStatusComponent } from './../loading-status/loading-status.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


const components = [
  LoadingStatusComponent
];

@NgModule({
  declarations: components,
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: components
})
export class WidgetModule { }
