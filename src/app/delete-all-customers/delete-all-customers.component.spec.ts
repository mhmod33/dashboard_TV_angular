import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAllCustomersComponent } from './delete-all-customers.component';

describe('DeleteAllCustomersComponent', () => {
  let component: DeleteAllCustomersComponent;
  let fixture: ComponentFixture<DeleteAllCustomersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteAllCustomersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteAllCustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
