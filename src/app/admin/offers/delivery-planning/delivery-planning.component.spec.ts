import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryPlanningComponent } from './delivery-planning.component';

describe('DeliveryPlanningComponent', () => {
  let component: DeliveryPlanningComponent;
  let fixture: ComponentFixture<DeliveryPlanningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliveryPlanningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
