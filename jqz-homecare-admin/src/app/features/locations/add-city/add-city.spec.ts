import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCity } from './add-city';

describe('AddCity', () => {
  let component: AddCity;
  let fixture: ComponentFixture<AddCity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCity],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCity);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
