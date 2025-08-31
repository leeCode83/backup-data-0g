import { Injectable, Logger } from '@nestjs/common';
import { ZgFile, Indexer } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class OgStorageService {
    public readonly logger = new Logger(OgStorageService.name);
    // private signer: ethers.Wallet;
    // private indexer: Indexer;
    private clients = new Map<string, { signer: ethers.Wallet; indexer: Indexer }>();

    constructor(private configService: ConfigService) { }

    async initialize(privateKey: string): Promise<{ signer: ethers.Wallet; indexer: Indexer }> {
        if (this.clients.has(privateKey)) {
            this.logger.log(`Using cached client for private key.`);
            return this.clients.get(privateKey)!;
        }

        // Network Constants
        const RPC_URL = this.configService.get<string>('RPC_URL') || "https://evmrpc-testnet.0g.ai/";
        const INDEXER_RPC = this.configService.get<string>('INDEXER_RPC') || "https://indexer-storage-testnet-turbo.0g.ai";
        try {
            const provider = new ethers.JsonRpcProvider(RPC_URL);
            const signer = new ethers.Wallet(privateKey, provider);
            const indexer = new Indexer(INDEXER_RPC);

            const client = { signer, indexer };
            this.clients.set(privateKey, client);
            this.logger.log('0G Storage client initialized and cached successfully.');
            return client;
        } catch (error) {
            this.logger.error('Failed to initialize 0G Storage client.', error.stack);
            throw new Error('Initialization failed.');
        }
    }

    async uploadFile(privateKey: string, filePath: string): Promise<{ rootHash: string; txHash: string }> {
        const client = await this.initialize(privateKey);

        try {
            // Create file object from file path
            const file = await ZgFile.fromFilePath(filePath);

            // Generate Merkle tree for verification
            const [tree, treeErr] = await file.merkleTree();
            if (treeErr !== null) {
                throw new Error(`Error generating Merkle tree: ${treeErr}`);
            }

            // Get root hash for future reference
            console.log("File Root Hash:", tree?.rootHash());

            // Upload to network
            const RPC_URL = this.configService.get<string>('RPC_URL') || "https://evmrpc-testnet.0g.ai/";
            const [tx, uploadErr] = await client.indexer.upload(file, RPC_URL, client.signer);
            if (uploadErr !== null) {
                throw new Error(`Upload error: ${uploadErr}`);
            }

            console.log("Upload successful! Transaction:", tx);

            // Always close the file when done
            await file.close();

            return { rootHash: tx.rootHash as string, txHash: tx.txHash as string };
        } catch (error) {
            this.logger.error('Gagal mengunggah file ke 0G Storage', error.stack);
            throw error;
        }
    }

    async downloadFile(privateKey: string, rootHash: string): Promise<{ filePath: string; originalFileName: string }> {
        const client = await this.initialize(privateKey);

        try {
            // Membuat nama file sementara yang unik
            const randomName = randomBytes(16).toString('hex');
            const outputPath = path.join(__dirname, 'temp', randomName);

            // Periksa apakah direktori 'temp' ada, jika tidak, buatlah
            const tempDir = path.join(__dirname, 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            // Memulai proses unduh dengan verifikasi bukti Merkle
            const withProof = true;
            const err = await client.indexer.download(rootHash, outputPath, withProof);

            if (err !== null) {
                // Hapus file yang mungkin tidak lengkap
                if (fs.existsSync(outputPath)) {
                    fs.unlinkSync(outputPath);
                }
                throw new Error(`Download error: ${err}`);
            }

            this.logger.log(`Download successful for rootHash: ${rootHash}`);

            return { filePath: outputPath, originalFileName: rootHash };
        } catch (error) {
            this.logger.error('Gagal mengunduh file dari 0G Storage', error.stack);
            throw error;
        }
    }
}
