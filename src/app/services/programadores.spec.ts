import { TestBed } from '@angular/core/testing';

import { Programadores } from './programadores';

describe('Programadores', () => {
  let service: Programadores;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Programadores);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
