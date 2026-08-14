import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRating } from './edit-rating';

describe('EditRating', () => {
  let component: EditRating;
  let fixture: ComponentFixture<EditRating>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditRating],
    }).compileComponents();

    fixture = TestBed.createComponent(EditRating);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
