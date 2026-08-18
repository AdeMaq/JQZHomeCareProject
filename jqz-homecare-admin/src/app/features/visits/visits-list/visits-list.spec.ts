import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitsList } from './visits-list';

describe('VisitsList', () => {
  let component: VisitsList;
  let fixture: ComponentFixture<VisitsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitsList],
    }).compileComponents();

    fixture = TestBed.createComponent(VisitsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
