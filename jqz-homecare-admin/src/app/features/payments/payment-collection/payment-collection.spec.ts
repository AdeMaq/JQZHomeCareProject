import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentCollection } from './payment-collection';

describe('PaymentCollection', () => {
  let component: PaymentCollection;
  let fixture: ComponentFixture<PaymentCollection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentCollection],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentCollection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
