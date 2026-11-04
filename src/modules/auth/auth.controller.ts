import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { Public } from 'src/common/decorators/public.decorator';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { VerificationEmailDto } from './dto/verificationEmail.dto';
import { ResendVerificationOtpCodeDto } from './dto/ResendVerificationOtpCode.dto';
import { SignInDto } from './dto/signing.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @ApiBody({ type: SignUpDto })
  @ApiCreatedResponse({
    description: 'کد تایید با موفقیت ارسال شد',
  })
  @ApiBadRequestResponse({ description: 'کاربر قبلا ثبت نام کرد' })
  @ApiBadRequestResponse({ description: 'گذرواژه وارد شده اشتباه است' })
  @HttpCode(HttpStatus.CREATED)
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Public()
  @Post('verification')
  @ApiBody({ type: VerificationEmailDto })
  @ApiOkResponse({ description: 'ثبت نام با موفقیت انجام شد' })
  @ApiBadRequestResponse({ description: 'کد تأیید منقضی شده یا وجود ندارد' })
  @ApiBadRequestResponse({ description: 'کد تأیید اشتباه است' })
  verificationEmail(@Body() verificationEmail: VerificationEmailDto) {
    return this.authService.verificationEmail(verificationEmail);
  }

  @Public()
  @Post('resend-verification')
  @ApiBody({ type: ResendVerificationOtpCodeDto })
  @ApiOkResponse({ description: 'کد تایید با موفقیت ارسال شد' })
  @ApiBadRequestResponse({ description: 'کاربر قبلا ثبت نام کرد' })
  @ApiBadRequestResponse({ description: 'ایمیل قبلاً تأیید شده است' })
  ResendVerificationOtpCode(
    @Body() resendVerificationOtpCode: ResendVerificationOtpCodeDto,
  ) {
    return this.authService.resendVerificationOtpCode(
      resendVerificationOtpCode,
    );
  }

  @Public()
  @Post('signin')
  @ApiBody({ type: SignInDto })
  @ApiOkResponse({ description: 'با موفقیت وارد شدید' })
  @ApiBadRequestResponse({ description: 'کاربر قبلا ثبت نام کرد' })
  @ApiBadRequestResponse({ description: 'ایمیل قبلاً تأیید شده است' })
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }
}
