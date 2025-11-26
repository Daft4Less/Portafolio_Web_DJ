import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmAsesorias } from './adm-asesorias';

describe('AdmAsesorias', () => {
  let component: AdmAsesorias;
  let fixture: ComponentFixture<AdmAsesorias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmAsesorias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmAsesorias);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
