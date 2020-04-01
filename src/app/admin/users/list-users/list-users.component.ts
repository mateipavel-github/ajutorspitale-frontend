import { DataService } from 'src/app/_services/data.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatTable } from '@angular/material/table';

@Component({
  selector: 'app-list-users',
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.css']
})
export class ListUsersComponent implements OnInit {

  users;
  usersLoaded = false;
  formLoading = false;
  userEditForm: FormGroup;
  displayedColumns: string[] = ['id', 'name', 'email', 'phone_number', 'role', 'actions'];

  @ViewChild(MatTable) usersTable: MatTable<any>;

  constructor(public dataService: DataService) {

    this.dataService.getUsers().subscribe(serverResponse => {
      this.usersLoaded = true;
      this.users = serverResponse['data']['items'];
    });

  }

  ngOnInit(): void {
    this.userEditForm = new FormGroup({
        id: new FormControl(),
        name: new FormControl(),
        phone_number: new FormControl(),
        role_type_id: new FormControl(),
        email: new FormControl(),
        password: new FormControl()
    });
  }

  onEditUser(index) {
    const data = this.users[index];
    this.userEditForm.setValue({
      id: data.id,
      name: data.name,
      email: data.email,
      phone_number: data.phone_number,
      role_type_id: data.role_type_id,
      password: ''
    });
  }

  onSaveUser() {
    const data = this.userEditForm.value;
    if (data.id > 0 && !data.password) {
      delete data.password;
    }
    this.formLoading = true;
    this.dataService.saveUser(this.userEditForm.value).subscribe(serverResponse => {
      this.formLoading = false;
      if (serverResponse['success']) {
        this.resetForm();
        if (data.id > 0) {
          this.users[this.findUserIndexById(data.id)] = serverResponse['data']['item'];
        } else {
          this.users.push(serverResponse['data']['item']);
        }
        this.usersTable.renderRows();
      } else {
        alert(serverResponse['error']);
      }
    });
  }

  public findUserIndexById(id) {
    this.users.forEach((user, index) => {
      if (user.id === id) {
        return index;
      }
    });
    return null;
  }

  onDeleteUser(id) {
    this.dataService.deleteUser(id).subscribe(serverResponse => {
      if (serverResponse['success']) {
        this.users.splice(this.findUserIndexById(id), 1);
        this.usersTable.renderRows();
      } else {
        alert(serverResponse['error']);
      }
    });
  }

  resetForm() {
    this.userEditForm.reset();
  }

}
