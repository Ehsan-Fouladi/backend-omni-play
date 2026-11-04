import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class SignUpDto {
  @ApiProperty({ example: 'amir-ali' })
  @IsString()
  @IsNotEmpty({ message: 'نام کاربری الزامی است' })
  username: string;

  @ApiProperty({ example: 'example@gmail.com' })
  @IsEmail()
  @IsNotEmpty({ message: 'ایمیل الزامی است' })
  email: string;

  @ApiProperty({ example: 'StrongP@ss123!' })
  @IsStrongPassword()
  @IsNotEmpty({ message: 'گذرواژه الزامی است' })
  password: string;

  @ApiProperty({ example: 'StrongP@ss123!' })
  @IsString()
  @IsNotEmpty({ message: 'تایید رمز عبور الزامی است' })
  confirmPassword: string;
}
