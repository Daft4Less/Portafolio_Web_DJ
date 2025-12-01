import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarjetaProyecto } from './tarjeta-proyecto';

describe('TarjetaProyecto', () => {
  let component: TarjetaProyecto;
  let fixture: ComponentFixture<TarjetaProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TarjetaProyecto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TarjetaProyecto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
