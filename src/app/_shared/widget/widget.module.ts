import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MedicalUnitInputSearchComponent } from './../medical-unit-input-search/medical-unit-input-search.component';
import { Nl2BrPipe } from './../nl2br.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoadingButtonComponent } from './../loading-button/loading-button.component';
import { LoadingStatusComponent } from './../loading-status/loading-status.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';


const componentsAndPipes = [
  LoadingStatusComponent,
  LoadingButtonComponent,
  MedicalUnitInputSearchComponent,
  Nl2BrPipe
];

@NgModule({
  declarations: componentsAndPipes,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: componentsAndPipes
})

export class WidgetModule { }
