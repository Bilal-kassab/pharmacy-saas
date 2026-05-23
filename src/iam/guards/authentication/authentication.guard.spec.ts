import { Test } from '@nestjs/testing';
import { AuthenticationGuard } from './authentication.guard';
import { AccessTokenGuard } from '../access-token/access-token.guard';

describe('AuthenticationGuard', () => {
  it('should be defined', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthenticationGuard,
        { provide: AccessTokenGuard, useValue: { canActivate: jest.fn().mockResolvedValue(true) } },
      ],
    }).compile();

    expect(moduleRef.get(AuthenticationGuard)).toBeDefined();
  });
});
