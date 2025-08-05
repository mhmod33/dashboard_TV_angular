import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultPricesComponent } from './default-prices.component';

describe('DefaultPricesComponent', () => {
  let component: DefaultPricesComponent;
  let fixture: ComponentFixture<DefaultPricesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultPricesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefaultPricesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
