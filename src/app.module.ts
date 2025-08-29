import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { OgStorageModule } from './og-storage/og-storage.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }), OgStorageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
