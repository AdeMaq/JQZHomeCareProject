import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitDetails } from './visit-details';

describe('VisitDetails', () => {
  let component: VisitDetails;
  let fixture: ComponentFixture<VisitDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(VisitDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
