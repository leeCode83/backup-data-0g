// src/users/dto/create-user.dto.ts

import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString({ message: 'Address harus berupa string.' })
    @IsNotEmpty({ message: 'Address tidak boleh kosong.' })
    readonly walletAddress: string;

    @IsString({ message: 'Private key harus berupa string.' })
    @IsNotEmpty({ message: 'Private key tidak boleh kosong.' })
    @MinLength(64, { message: 'Private key harus minimal 64 karakter.' })
    readonly privateKey: string;
}