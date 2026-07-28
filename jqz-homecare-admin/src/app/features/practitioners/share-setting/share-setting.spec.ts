import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareSetting } from './share-setting';

describe('ShareSetting', () => {
  let component: ShareSetting;
  let fixture: ComponentFixture<ShareSetting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareSetting],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareSetting);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
