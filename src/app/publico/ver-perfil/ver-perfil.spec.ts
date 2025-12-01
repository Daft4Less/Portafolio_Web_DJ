import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerPerfil } from './ver-perfil';

describe('VerPerfil', () => {
  let component: VerPerfil;
  let fixture: ComponentFixture<VerPerfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerPerfil]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerPerfil);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
