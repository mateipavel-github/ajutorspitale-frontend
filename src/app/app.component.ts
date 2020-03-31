import { AuthService } from './_services/auth.service';
import { DataService } from './_services/data.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'frontend';
  appLoaded = false;

  public constructor(public dataService: DataService, private authService: AuthService) {
    this.bootstrap();
  }

  public bootstrap() {

    this.dataService.bootstrap().subscribe(success => {
      this.appLoaded = true;
    });

  }
}
