import { Test } from '@nestjs/testing';
import { HashingService } from './hashing.service';

describe('HashingService (token)', () => {
  it('should be injectable via token', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        { provide: HashingService, useValue: { hash: jest.fn(), compare: jest.fn() } },
      ],
    }).compile();

    expect(moduleRef.get(HashingService)).toBeDefined();
  });
});
