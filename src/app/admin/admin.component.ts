import { AuthService } from './../_services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  protected currentPage;
  public currentUser;

  constructor(private router: Router, public authService: AuthService, private titleService: Title) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.titleService.setTitle('Administrare@' + this.titleService.getTitle());
  }

  hasAccess(roles) {
    return this.authService.hasAccess(roles);
  }

  ngOnInit(): void {
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/user/login']);
  }

}
