import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioProyecto } from './formulario-proyecto';

describe('FormularioProyecto', () => {
  let component: FormularioProyecto;
  let fixture: ComponentFixture<FormularioProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioProyecto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioProyecto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
