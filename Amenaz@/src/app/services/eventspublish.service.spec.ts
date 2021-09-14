import { TestBed } from '@angular/core/testing';

import { EventspublishService } from './eventspublish.service';

describe('EventspublishService', () => {
  let service: EventspublishService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventspublishService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
