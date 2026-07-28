import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PractitionersList } from './practitioners-list';

describe('PractitionersList', () => {
  let component: PractitionersList;
  let fixture: ComponentFixture<PractitionersList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PractitionersList],
    }).compileComponents();

    fixture = TestBed.createComponent(PractitionersList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
