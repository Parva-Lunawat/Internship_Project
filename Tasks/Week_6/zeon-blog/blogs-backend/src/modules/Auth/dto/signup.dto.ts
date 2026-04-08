import { IsEmail, IsString, MinLength, MaxLength, IsStrongPassword } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "src/modules/Users/entities/user.entities";

export class SignupDto {
    @ApiProperty({ example: 'abcd' })
    @IsString()
    @MinLength(4, { message: 'Name must be at least 4 characters long' })
    @MaxLength(128)
    name: string;

    // @ApiProperty({ example: 'reader' })
    // @IsEnum(UserRole)
    // role: UserRole;

    @ApiProperty({ example: 'codal@codaldemo.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Codal@123'})
    @IsString()
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    }, {
        message: 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters'
    })
    password: string;

    @ApiProperty({ example: 'Codal@123'})
    @IsString()
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    }, {
        message: 'Confirmation password must meet complexity requirements'
    })
    confirmPassword: string;
}