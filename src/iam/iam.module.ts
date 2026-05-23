import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { HashingService } from './hashing/hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt/bcrypt.service';
import { AccessTokenGuard } from './guards/access-token/access-token.guard';
import { AuthenticationService } from './authentication/authentication.service';
import { AuthenticationController } from './authentication/authentication.controller';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './guards/authentication/authentication.guard';

import { RolesGuard } from './authorization/guards/roles/roles.guard';

// import { minutes, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
// import { UserEntity } from 'src/db/entities/user.entity';

@Module({
  imports: [
    // TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    // ThrottlerModule.forRoot([
    //     {
    //       name: 'default', // If name is not provided, the name is given as default
    //       ttl: minutes(1), // Time window in minutes
    //       limit: 10000, // Number of allowed requests in that window
    //     }
    //  ]),
  ],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    AccessTokenGuard,
    AuthenticationService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },    
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard
    // }
    
  ],
  controllers: [AuthenticationController],
})
export class IamModule {}
