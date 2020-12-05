import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferidosGoComponent } from './referidos-go.component';

describe('ReferidosGoComponent', () => {
  let component: ReferidosGoComponent;
  let fixture: ComponentFixture<ReferidosGoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReferidosGoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferidosGoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
