import { Test, TestingModule } from '@nestjs/testing';
import { OgStorageService } from './og-storage.service';

describe('OgStorageService', () => {
  let service: OgStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OgStorageService],
    }).compile();

    service = module.get<OgStorageService>(OgStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
