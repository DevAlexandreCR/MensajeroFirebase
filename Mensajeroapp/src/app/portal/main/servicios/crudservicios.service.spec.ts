import { TestBed } from '@angular/core/testing';

import { CrudserviciosService } from './crudservicios.service';

describe('CrudserviciosService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CrudserviciosService = TestBed.get(CrudserviciosService);
    expect(service).toBeTruthy();
  });
});
