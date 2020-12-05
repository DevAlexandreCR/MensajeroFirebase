import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MensajerogoComponent } from './mensajerogo.component';

describe('MensajerogoComponent', () => {
  let component: MensajerogoComponent;
  let fixture: ComponentFixture<MensajerogoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MensajerogoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MensajerogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
