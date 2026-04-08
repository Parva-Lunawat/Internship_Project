import { IsEmail, IsString, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
    @ApiProperty({ example: 'codal@codaldemo.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Codal@123'})
    @IsString()
    @MinLength(8)
    @MaxLength(32)
    password: string;
}