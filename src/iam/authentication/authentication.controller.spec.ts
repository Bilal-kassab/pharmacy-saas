import { Test } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationController', () => {
  it('should be defined', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [{ provide: AuthenticationService, useValue: {} }],
    }).compile();

    expect(moduleRef.get(AuthenticationController)).toBeDefined();
  });
});
