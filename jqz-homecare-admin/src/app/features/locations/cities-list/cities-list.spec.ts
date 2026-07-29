import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitiesList } from './cities-list';

describe('CitiesList', () => {
  let component: CitiesList;
  let fixture: ComponentFixture<CitiesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitiesList],
    }).compileComponents();

    fixture = TestBed.createComponent(CitiesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
