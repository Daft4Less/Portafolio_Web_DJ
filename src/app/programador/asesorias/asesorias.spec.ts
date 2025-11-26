import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Asesorias } from './asesorias';

describe('Asesorias', () => {
  let component: Asesorias;
  let fixture: ComponentFixture<Asesorias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Asesorias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Asesorias);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
