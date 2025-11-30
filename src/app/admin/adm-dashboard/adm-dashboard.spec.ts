import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmDashboard } from './adm-dashboard';

describe('AdmDashboard', () => {
  let component: AdmDashboard;
  let fixture: ComponentFixture<AdmDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
