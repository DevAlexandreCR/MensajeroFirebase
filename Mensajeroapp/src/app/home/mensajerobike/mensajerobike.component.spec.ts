import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MensajerobikeComponent } from './mensajerobike.component';

describe('MensajerobikeComponent', () => {
  let component: MensajerobikeComponent;
  let fixture: ComponentFixture<MensajerobikeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MensajerobikeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MensajerobikeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
