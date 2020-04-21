import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsSearchAndSelectComponent } from './requests-search-and-select.component';

describe('RequestsSearchAndSelectComponent', () => {
  let component: RequestsSearchAndSelectComponent;
  let fixture: ComponentFixture<RequestsSearchAndSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestsSearchAndSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestsSearchAndSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
