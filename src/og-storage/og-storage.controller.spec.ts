import { Test, TestingModule } from '@nestjs/testing';
import { OgStorageController } from './og-storage.controller';

describe('OgStorageController', () => {
  let controller: OgStorageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OgStorageController],
    }).compile();

    controller = module.get<OgStorageController>(OgStorageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
