import { TestBed } from '@angular/core/testing';

import { Proyectos } from './proyectos';

describe('Proyectos', () => {
  let service: Proyectos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Proyectos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
