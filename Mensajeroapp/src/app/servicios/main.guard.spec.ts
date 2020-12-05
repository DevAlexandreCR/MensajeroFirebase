import { TestBed, async, inject } from '@angular/core/testing';

import { MainGuards } from './main.guard';

describe('MainGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MainGuards]
    });
  });

  it('should ...', inject([MainGuards], (guard: MainGuards) => {
    expect(guard).toBeTruthy();
  }));
});
