import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreasList } from './areas-list';

describe('AreasList', () => {
  let component: AreasList;
  let fixture: ComponentFixture<AreasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreasList],
    }).compileComponents();

    fixture = TestBed.createComponent(AreasList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
