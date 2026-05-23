import { Injectable } from '@nestjs/common';

import { compare, genSalt, hash } from 'bcrypt';
import { HashingService } from '../hashing/hashing.service';

@Injectable()
export class BcryptService implements HashingService {
  async hash(data: string): Promise<string> {
    const salt = await genSalt();
    return hash(data, salt);
  }
  async compare(data: string, hashedData: string): Promise<boolean> {
    return compare(data, hashedData);
  }
}
