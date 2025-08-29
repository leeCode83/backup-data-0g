import { Injectable, Logger } from '@nestjs/common';
import { ZgFile, Indexer, Batcher, KvClient } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OgStorageService {
    private readonly logger = new Logger(OgStorageService.name);
    private signer: ethers.Wallet;
    private indexer: Indexer;

    constructor(private configService: ConfigService) { }

    async initialize(privateKey: string): Promise<void> {
        // Network Constants
        const RPC_URL = this.configService.get<string>('RPC_URL');
        const INDEXER_RPC = this.configService.get<string>('INDEXER_URL')!;

        try {
            const provider = new ethers.JsonRpcProvider(RPC_URL);
            this.signer = new ethers.Wallet(privateKey, provider);
            this.indexer = new Indexer(INDEXER_RPC);
            this.logger.log('0G Storage client initialized successfully.');
        } catch (error) {
            this.logger.error('Failed to initialize 0G Storage client.', error.stack);
            throw new Error('Initialization failed.');
        }
    }

    async uploadFile(filePath: string): Promise<{ rootHash: string; txHash: string }> {
        if (!this.signer || !this.indexer) {
            throw new Error('OgStorageService not initialized. Call `initialize` first.');
        }
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
            const RPC_URL = this.configService.get<string>('RPC_URL')!;
            const [tx, uploadErr] = await this.indexer.upload(file, RPC_URL, this.signer);
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
}
