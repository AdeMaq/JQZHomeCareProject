import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingsList } from './ratings-list';

describe('RatingsList', () => {
  let component: RatingsList;
  let fixture: ComponentFixture<RatingsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingsList],
    }).compileComponents();

    fixture = TestBed.createComponent(RatingsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
