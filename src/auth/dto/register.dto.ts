import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password (min 6 characters)', example: 'securepassword' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'User name', example: 'John Doe' })
  @IsNotEmpty()
  name: string;
}
