import { BadGatewayException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/users.dto';
import { EncryptionService } from 'src/encryption/encryption.service';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService, private encryptService: EncryptionService) { }

    async createUser(dto: CreateUserDto) {
        const { walletAddress, privateKey } = dto;

        const encryptedKey = this.encryptService.encrypt(privateKey);

        const newUser = await this.prisma.user.create({
            data: {
                walletAddress: walletAddress,
                privateKey: encryptedKey
            }
        });

        if(!newUser){
            throw new BadGatewayException('User creation failed. Please try again later.');
        }

        return newUser;
    }

}
