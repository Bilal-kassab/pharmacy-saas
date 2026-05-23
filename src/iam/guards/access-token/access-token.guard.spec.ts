// import { AccessTokenGuard } from './access-token.guard';

// describe('AccessTokenGuard', () => {
//   it('should be defined', () => {
//     expect(new AccessTokenGuard()).toBeDefined();
//   });
// });

// import { Test } from '@nestjs/testing';
// import { JwtService } from '@nestjs/jwt';
// import { AccessTokenGuard } from './access-token.guard';

// describe('AccessTokenGuard', () => {
//   it('should be defined', async () => {
//     const moduleRef = await Test.createTestingModule({
//       providers: [
//         AccessTokenGuard,
//         { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
//       ],
//     }).compile();

//     expect(moduleRef.get(AccessTokenGuard)).toBeDefined();
//   });
// });



import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenGuard } from './access-token.guard';

describe('AccessTokenGuard', () => {
  it('should be defined', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AccessTokenGuard,
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        { provide: 'CONFIGURATION(jwt)', useValue: { secret: 'test', audience: 'test', issuer: 'test' } },
      ],
    }).compile();

    expect(moduleRef.get(AccessTokenGuard)).toBeDefined();
  });
});
