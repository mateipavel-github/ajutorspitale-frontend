import { MatExpansionModule } from '@angular/material/expansion';
import { NotesComponent } from './../notes/notes.component';
import { NeedsShortlistComponent } from './../needs-shortlist/needs-shortlist.component';
import { NeedsEditorComponent } from './../needs-editor/needs-editor.component';
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
import { FlexLayoutModule } from '@angular/flex-layout';
import { SponsorAutocompleteComponent } from '../sponsor-autocomplete/sponsor-autocomplete.component';

@NgModule({
  declarations: [
    LoadingStatusComponent,
    LoadingButtonComponent,
    MedicalUnitInputSearchComponent,
    NeedsEditorComponent,
    NeedsShortlistComponent,
    Nl2BrPipe,
    SponsorAutocompleteComponent,
    NotesComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatAutocompleteModule,
    MatExpansionModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule
  ],
  exports: [
    LoadingStatusComponent,
    LoadingButtonComponent,
    MedicalUnitInputSearchComponent,
    NeedsEditorComponent,
    NeedsShortlistComponent,
    Nl2BrPipe,
    SponsorAutocompleteComponent,
    NotesComponent
  ]
})

export class WidgetModule { }
