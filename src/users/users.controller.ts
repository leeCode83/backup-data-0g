import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/users.dto';
import { EncryptionService } from 'src/encryption/encryption.service';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService, private checkBang: EncryptionService) { }

    @Post('register')
    async createUser(@Body() dto: CreateUserDto) {
        return this.userService.createUser(dto);
    }
}
