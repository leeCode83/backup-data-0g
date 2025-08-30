import { Module } from '@nestjs/common';
import { OgStorageService } from './og-storage.service';
import { OgStorageController } from './og-storage.controller';

@Module({
  providers: [OgStorageService],
  controllers: [OgStorageController]
})
export class OgStorageModule {}
