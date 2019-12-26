import { TestBed } from '@angular/core/testing';

import { MappingService } from './mapping.service';

describe('MappingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MappingService = TestBed.get(MappingService);
    expect(service).toBeTruthy();
  });
});
