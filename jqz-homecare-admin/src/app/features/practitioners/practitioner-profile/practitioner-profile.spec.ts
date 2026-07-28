import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PractitionerProfile } from './practitioner-profile';

describe('PractitionerProfile', () => {
  let component: PractitionerProfile;
  let fixture: ComponentFixture<PractitionerProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PractitionerProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(PractitionerProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
