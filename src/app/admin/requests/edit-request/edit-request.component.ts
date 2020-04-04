import { SessionDataService } from './../../../_services/session-data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from './../../../_services/data.service';
import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { SnackbarComponent } from 'src/app/_shared/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-request',
  templateUrl: './edit-request.component.html',
  styleUrls: ['./edit-request.component.css']
})
export class EditRequestComponent implements OnInit {

  dataLoaded = false;
  showNeedsText = true;
  statusChanging = false;
  assignChanging = false;

  constructor(public dataService: DataService, public sessionData: SessionDataService,
                private route: ActivatedRoute, private snackBar: MatSnackBar) {

    this.route.paramMap.pipe(switchMap((params) => {
      this.sessionData.currentRequestId = params.get('id');
      return dataService.getRequest(params.get('id'));
    })).subscribe(serverResponse => {
      this.dataLoaded = true;
      this.sessionData.currentRequest = serverResponse['data'];
      this.showNeedsText = !(this.sessionData.currentRequest.needs && this.sessionData.currentRequest.needs.length > 0);
    });

  }

  onUnassign() {
    this.assignChanging = true;
    this.dataService.unassignCurrentUserFromRequest(this.sessionData.currentRequestId).subscribe(serverResponse => {
      this.assignChanging = false;
      if (serverResponse['success']) {
        this.sessionData.currentRequest.assigned_user_id = this.sessionData.currentRequest.assigned_user = null;
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
    this.dataService.assignCurrentUserToRequest(this.sessionData.currentRequestId).subscribe(serverResponse => {
      this.assignChanging = false;
      if (serverResponse['success']) {
        this.sessionData.currentRequest.assigned_user = serverResponse['assigned_user'];
        this.sessionData.currentRequest.assigned_user_id = serverResponse['assigned_user_id'];
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

  onChangeRequestStatus(status) {
    this.statusChanging = true;
    this.dataService.changeRequestStatus(this.sessionData.currentRequestId, status).subscribe(serverResponse => {
      this.statusChanging = false;
      if (serverResponse['success']) {
        this.sessionData.currentRequest.status = status;
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
