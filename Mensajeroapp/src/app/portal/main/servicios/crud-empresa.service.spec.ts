import { TestBed } from '@angular/core/testing';

import { CrudUsuarioService } from './crud-usuario.service';

describe('CrudEmpresaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CrudUsuarioService = TestBed.get(CrudUsuarioService);
    expect(service).toBeTruthy();
  });
});
