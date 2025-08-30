import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { OgStorageService } from './og-storage.service';
import { Response } from 'express';

@Controller('og-storage')
export class OgStorageController {
    constructor(private readonly ogStorageService: OgStorageService) { }

    @Post('upload')
    async uploadFile(
        @Body() privateKey: string,
        @Body() filePath: string,
        @Res() res: Response
    ) {
        if (!privateKey || !filePath) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: 'Parameter "privateKey" and "filePath" are required.'
            });
        }

        try {
            await this.ogStorageService.initialize(privateKey);
            const uploadResult = await this.ogStorageService.uploadFile(filePath);

            return res.status(HttpStatus.OK).json({
                message: 'File berhasil dicadangkan.',
                fileDetails: uploadResult
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Gagal mencadangkan file.',
                error: error.message
            });
        }
    }

}
