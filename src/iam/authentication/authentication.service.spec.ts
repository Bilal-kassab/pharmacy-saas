import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { AuthenticationService } from './authentication.service';
import { HashingService } from '../hashing/hashing/hashing.service';
import { UserEntity } from 'src/db/entities/user.entity';

describe('AuthenticationService', () => {
  it('should be defined', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        { provide: getRepositoryToken(UserEntity), useValue: { findOne: jest.fn(), save: jest.fn() } },
        { provide: HashingService, useValue: { hash: jest.fn(), compare: jest.fn() } },
        { provide: JwtService, useValue: { signAsync: jest.fn(), verifyAsync: jest.fn() } },
        { provide: 'CONFIGURATION(jwt)', useValue: { secret: 'test' } },
        { provide: DataSource, useValue: { transaction: jest.fn() } },
      ],
    }).compile();

    expect(moduleRef.get(AuthenticationService)).toBeDefined();
  });
});
