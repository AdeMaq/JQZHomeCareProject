import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPractitioner } from './add-practitioner';

describe('AddPractitioner', () => {
  let component: AddPractitioner;
  let fixture: ComponentFixture<AddPractitioner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPractitioner],
    }).compileComponents();

    fixture = TestBed.createComponent(AddPractitioner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
