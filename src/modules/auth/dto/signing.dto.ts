import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SignInDto {
  @ApiProperty({ example: 'amir-ali or example@gmail.com' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(254)
  identifier: string;

  @ApiProperty({ example: 'StrongP@ss123!' })
  @IsString()
  @IsNotEmpty({ message: 'گذرواژه الزامی است' })
  password: string;
}
