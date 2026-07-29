import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCity } from './edit-city';

describe('EditCity', () => {
  let component: EditCity;
  let fixture: ComponentFixture<EditCity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCity],
    }).compileComponents();

    fixture = TestBed.createComponent(EditCity);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
