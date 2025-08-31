import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { OgStorageModule } from './og-storage/og-storage.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }), OgStorageModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
