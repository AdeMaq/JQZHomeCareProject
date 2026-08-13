import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackagesList } from './packages-list';

describe('PackagesList', () => {
  let component: PackagesList;
  let fixture: ComponentFixture<PackagesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackagesList],
    }).compileComponents();

    fixture = TestBed.createComponent(PackagesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
