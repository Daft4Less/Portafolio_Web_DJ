import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmUsuarios } from './adm-usuarios';

describe('AdmUsuarios', () => {
  let component: AdmUsuarios;
  let fixture: ComponentFixture<AdmUsuarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmUsuarios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmUsuarios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
