import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDeliveriesComponent } from './edit-deliveries.component';

describe('EditDeliveriesComponent', () => {
  let component: EditDeliveriesComponent;
  let fixture: ComponentFixture<EditDeliveriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditDeliveriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDeliveriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
