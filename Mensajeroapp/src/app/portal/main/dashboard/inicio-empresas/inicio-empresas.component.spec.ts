import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InicioEmpresasComponent } from './inicio-empresas.component';

describe('InicioEmpresasComponent', () => {
  let component: InicioEmpresasComponent;
  let fixture: ComponentFixture<InicioEmpresasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InicioEmpresasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InicioEmpresasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
