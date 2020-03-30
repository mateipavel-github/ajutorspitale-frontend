import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRequestNeedsComponent } from './edit-request-needs.component';

describe('EditRequestNeedsComponent', () => {
  let component: EditRequestNeedsComponent;
  let fixture: ComponentFixture<EditRequestNeedsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditRequestNeedsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRequestNeedsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
