import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Programadores } from './programadores';

describe('Programadores', () => {
  let component: Programadores;
  let fixture: ComponentFixture<Programadores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Programadores]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Programadores);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
