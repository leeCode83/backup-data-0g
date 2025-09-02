import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { OgStorageModule } from './og-storage/og-storage.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { EncryptionModule } from './encryption/encryption.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }), OgStorageModule, PrismaModule, UsersModule, EncryptionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
