import { Module } from '@nestjs/common';
import { OgStorageService } from './og-storage.service';

@Module({
  providers: [OgStorageService]
})
export class OgStorageModule {}
