import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveCustomerComponent } from './remove-customer.component';

describe('RemoveCustomerComponent', () => {
  let component: RemoveCustomerComponent;
  let fixture: ComponentFixture<RemoveCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoveCustomerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoveCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
