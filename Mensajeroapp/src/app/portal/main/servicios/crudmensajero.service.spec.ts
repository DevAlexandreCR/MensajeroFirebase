import { TestBed } from '@angular/core/testing';

import { CrudmensajeroService } from './crudmensajero.service';

describe('CrudmensajeroService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CrudmensajeroService = TestBed.get(CrudmensajeroService);
    expect(service).toBeTruthy();
  });
});
