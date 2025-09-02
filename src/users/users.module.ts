import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { EncryptionService } from 'src/encryption/encryption.service';

@Module({
  providers: [UsersService, PrismaService, EncryptionService],
  controllers: [UsersController]
})
export class UsersModule {}
