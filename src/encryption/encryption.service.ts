// encryption.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService implements OnModuleInit {
    private key: Buffer;
    private algorithm: string;

    constructor(private readonly configService: ConfigService) { }

    onModuleInit() {
        // Ambil kunci dan algoritma dari .env
        const keyString = this.configService.get<string>('ENCRYPTION_KEY');
        this.algorithm = this.configService.get<string>('ENCRYPTION_ALGORITHM')!;

        // Pastikan kunci dan algoritma ada
        if (!keyString || !this.algorithm) {
            throw new Error('ENCRYPTION_KEY and ENCRYPTION_ALGORITHM must be defined in .env');
        }

        // Ubah kunci string menjadi buffer dan pastikan panjangnya sesuai
        this.key = Buffer.from(keyString, 'hex');
        // AES-256 membutuhkan kunci sepanjang 32 byte (256 bit)
        if (this.key.length !== 32) {
            throw new Error(`ENCRYPTION_KEY must be 32 characters long for aes-256-cbc, ${this.key.length}`);
        }
    }

    // Metode untuk enkripsi
    encrypt(text: string): string {
        const iv = crypto.randomBytes(16); // IV (Initialization Vector) acak
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        // Gabungkan IV dengan data terenkripsi untuk dekripsi nanti
        return iv.toString('hex') + ':' + encrypted;
    }

    // Metode untuk dekripsi
    decrypt(encryptedText: string): string {
        // Memastikan input adalah string dan tidak kosong
        if (!encryptedText || typeof encryptedText !== 'string') {
            throw new Error('Invalid encrypted data format');
        }

        const parts = encryptedText.split(':');

        // Validasi: Pastikan ada dua bagian (IV dan data terenkripsi)
        if (parts.length !== 2) {
            throw new Error('Invalid encrypted data format');
        }

        // Mengambil IV dan data terenkripsi dengan aman
        const iv = Buffer.from(parts[0], 'hex');
        const encryptedData = parts[1];

        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }
}