import { AuthService } from '../../../_services/auth.service'
import { SessionDataService } from '../../../_services/session-data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../../../_services/data.service';
import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { SnackbarComponent } from 'src/app/_shared/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.component.html',
  styleUrls: ['./edit-offer.component.css']
})
export class EditOfferComponent implements OnInit {

  dataLoaded = false;
  showNeedsText = true;
  statusChanging = false;
  assignChanging = false;
  newNote = new FormControl();
  showScriptNeeds = false;

  constructor(public dataService: DataService, public sessionData: SessionDataService,
                private route: ActivatedRoute, private snackBar: MatSnackBar, private authService: AuthService) {

    this.route.paramMap.pipe(switchMap((params) => {
      this.sessionData.currentOfferId = params.get('id');
      return dataService.getOffer(params.get('id'));
    })).subscribe(serverResponse => {
      this.dataLoaded = true;
      this.sessionData.currentOffer = serverResponse['data'];
      this.showNeedsText = !(this.sessionData.currentOffer.needs && this.sessionData.currentOffer.needs.length > 0);
    });

  }

  onSaveNote() {
    this.newNote.disable();
    const data = { item_id: this.sessionData.currentOfferId, content: this.newNote.value };
    this.dataService.addOfferNote(data).subscribe(serverResponse => {
      this.newNote.enable();
      this.newNote.setValue('');
      if (serverResponse['success']) {
        this.sessionData.currentOffer.notes.push(serverResponse['data']['new_note']);
      }
    }, error => {
        this.newNote.enable();
        this.newNote.setValue('');
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: { message: error['message'] },
          panelClass: 'snackbar-error',
          duration: 5000
        });
    });
  }

  onUnassign() {
    this.assignChanging = true;
    this.dataService.unassignCurrentUserFromOffer(this.sessionData.currentOfferId).subscribe(serverResponse => {
      this.assignChanging = false;
      if (serverResponse['success']) {
        this.sessionData.currentOffer.assigned_user_id = this.sessionData.currentOffer.assigned_user = null;
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: { message: 'Cererea a fost eliberată și poate fi preluată de alt voluntar.' },
          panelClass: 'snackbar-success'
        });
      } else {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: { message: serverResponse['success'] },
          panelClass: 'snackbar-error',
          duration: 5000
        });
      }
    });
  }

  onAssign() {
    this.assignChanging = true;
    this.dataService.assignCurrentUserToOffer(this.sessionData.currentOfferId).subscribe(serverResponse => {
      this.assignChanging = false;
      if (serverResponse['success']) {
        this.sessionData.currentOffer.assigned_user = serverResponse['data']['assigned_user'];
        this.sessionData.currentOffer.assigned_user_id = serverResponse['data']['assigned_user']['id'];
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: { message: 'Ai preluat cererea.' },
          panelClass: 'snackbar-success'
        });
      } else {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: { message: serverResponse['error'] },
          panelClass: 'snackbar-error',
          duration: 5000
        });
      }
    });
  }

  onChangeOfferStatus(status) {
    this.statusChanging = true;
    this.dataService.changeOfferStatus(this.sessionData.currentOfferId, status).subscribe(serverResponse => {
      this.statusChanging = false;
      if (serverResponse['success']) {
        this.sessionData.currentOffer.status = status;
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: { message: 'Statusul a fost schimbat.' },
          panelClass: 'snackbar-success'
        });
      } else {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: { message: serverResponse['success'] },
          panelClass: 'snackbar-error',
          duration: 5000
        });
      }
    });
  }

  ngOnInit(): void {
  }

}
