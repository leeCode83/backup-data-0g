import { Body, Controller, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { OgStorageService } from './og-storage.service';
import { Response } from 'express';
import * as fs from 'fs';

@Controller('og-storage')
export class OgStorageController {
    constructor(private readonly ogStorageService: OgStorageService) { }

    @Post('upload')
    async uploadFile(
        @Body('privateKey') privateKey: string,
        @Body('filePath') filePath: string,
        @Res() res: Response
    ) {
        if (!privateKey || !filePath) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: 'Parameter "privateKey" and "filePath" are required.'
            });
        }

        try {
            const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;

            const uploadResult = await this.ogStorageService.uploadFile(formattedPrivateKey, filePath);

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

    @Get('download/:rootHash')
    async downloadFile(
        @Param('rootHash') rootHash: string,
        @Body('privateKey') privateKey: string,
        @Res() res: Response
    ) {
        if (!privateKey || !rootHash) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: 'Parameter "privateKey" and "rootHash" are required.'
            });
        }

        try {
            const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;

            const downloadResult = await this.ogStorageService.downloadFile(formattedPrivateKey, rootHash);

            // Menggunakan res.download untuk mengirim file ke pengguna
            return res.download(downloadResult.filePath, downloadResult.originalFileName, (err) => {
                if (err) {
                    // Tangani kesalahan saat mengirim file
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                        message: 'Gagal mengirim file.',
                        error: err.message
                    });
                }
                // Hapus file sementara setelah selesai
                fs.unlink(downloadResult.filePath, (unlinkErr) => {
                    if (unlinkErr) {
                        this.ogStorageService.logger.error('Gagal menghapus file sementara.', unlinkErr.stack);
                    }
                });
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Gagal mengunduh file.',
                error: error.message
            });
        }
    }

}
