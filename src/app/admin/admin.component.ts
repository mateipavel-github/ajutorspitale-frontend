import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  protected currentPage;

  constructor(private router: Router) {

    console.log(router.routerState.root.pathFromRoot);

  }

  ngOnInit(): void {
  }

}
