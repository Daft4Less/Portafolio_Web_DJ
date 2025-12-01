import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmProgramadores } from './adm-programadores';

describe('AdmProgramadores', () => {
  let component: AdmProgramadores;
  let fixture: ComponentFixture<AdmProgramadores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmProgramadores]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmProgramadores);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
