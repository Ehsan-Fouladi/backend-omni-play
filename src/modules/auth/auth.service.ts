import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Auth } from './entities/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signing.dto';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { randomInt } from 'crypto';
import { RedisService } from 'src/common/redis/redis.service';
import { VerificationEmailDto } from './dto/verificationEmail.dto';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { MailerService } from '@nestjs-modules/mailer';
import { ResendVerificationOtpCodeDto } from './dto/ResendVerificationOtpCode.dto';
import { Profile } from '../profiles/entities/profile.entity';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly users: Repository<Auth>,
    private readonly redis: RedisService,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  private readonly OTP_TTL = 300;
  private readonly OTP_RESEND_TTL = 60;
  private readonly OTP_MAX_ATTEMPTS = 3;

  async findOneById(id: number): Promise<Auth | null> {
    return await this.users.findOneBy({ id });
  }

  private designEmailHtml(verify: string): string {
    if (!/^\d{6}$/.test(verify)) {
      throw new BadRequestException('Invalid verification code');
    }

    return `
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>تأیید حساب کاربری</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0b1020; font-family: Tahoma, Arial, sans-serif; direction: rtl;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0b1020; padding: 40px 15px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px; background-color: #151d30; border: 1px solid #26344f; border-radius: 16px; overflow: hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding: 35px 25px; background-color: #111a2c; border-bottom: 1px solid #26344f;">
                      <h1 style="margin: 0; color: #60a5fa; font-size: 28px; font-weight: bold; letter-spacing: 1px;">
                        GAMEZONE
                      </h1>
                      <p style="margin: 10px 0 0; color: #8493ad; font-size: 12px; letter-spacing: 2px;">
                        YOUR GAMING WORLD
                      </p>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td align="center" style="padding: 40px 30px 20px;">
                      <div style="width: 64px; height: 64px; line-height: 64px; margin: 0 auto 24px; border-radius: 18px; background-color: #1e3a5f; color: #60a5fa; font-size: 30px;">
                        &#10003;
                      </div>
                      <h2 style="margin: 0 0 15px; color: #f1f5f9; font-size: 23px;">
                        به دنیای بازی خوش آمدی!
                      </h2>
                      <p style="margin: 0; color: #a5b4ca; font-size: 14px; line-height: 2;">
                        فقط یک قدم تا ساخت حساب کاربری و شروع ماجراجویی باقی مانده است.<br />
                        برای تأیید آدرس ایمیل خود، کد زیر را وارد کن.
                      </p>
                    </td>
                  </tr>

                  <!-- OTP -->
                  <tr>
                    <td align="center" style="padding: 15px 30px 30px;">
                      <p style="margin: 0 0 15px; color: #94a3b8; font-size: 13px;">
                        کد تأیید حساب کاربری
                      </p>
                      <div style="display: inline-block; padding: 18px 35px; background-color: #0b1426; border: 1px solid #3b82f6; border-radius: 12px; color: #60a5fa; font-size: 34px; font-weight: bold; letter-spacing: 10px; direction: ltr;">
                        ${verify}
                      </div>
                      <p style="margin: 18px 0 0; color: #fbbf24; font-size: 12px;">
                        این کد فقط تا ۵ دقیقه اعتبار دارد.
                      </p>
                    </td>
                  </tr>

                  <!-- Security Notice -->
                  <tr>
                    <td style="padding: 0 30px 35px;">
                      <div style="padding: 16px; background-color: #1b263b; border-radius: 10px; border-right: 3px solid #3b82f6;">
                        <p style="margin: 0; color: #cbd5e1; font-size: 12px; line-height: 2;">
                          <strong style="color: #60a5fa;">نکته امنیتی:</strong>
                          این کد را در اختیار هیچ‌کس قرار نده. اگر این درخواست از طرف تو نبوده است، این ایمیل را نادیده بگیر.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding: 22px 25px; background-color: #111a2c; border-top: 1px solid #26344f;">
                      <p style="margin: 0 0 8px; color: #64748b; font-size: 11px;">
                        ساخته‌شده برای گیمرها، با عشق به بازی
                      </p>
                      <p style="margin: 0; color: #475569; font-size: 10px; direction: ltr;">
                        © ${new Date().getFullYear()} GAMEZONE. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  private async verifyOtpCode(email: string, code: string): Promise<void> {
    const otpKey = `verify:${email}`;
    const attemptsKey = `verify:attempts:${email}`;

    const script = `
    local stored = redis.call('GET', KEYS[1])

    if not stored then
      return -1
    end

    if stored == ARGV[1] then
      redis.call('DEL', KEYS[1], KEYS[2])
      return 1
    end

    local attempts = redis.call('INCR', KEYS[2])

    if attempts == 1 then
      redis.call('EXPIRE', KEYS[2], ARGV[2])
    end

    if attempts >= tonumber(ARGV[3]) then
      redis.call('DEL', KEYS[1], KEYS[2])
      return -2
    end

    return 0
  `;

    const result = await this.redis.client.eval(
      script,
      2,
      otpKey,
      attemptsKey,
      code,
      this.OTP_TTL,
      this.OTP_MAX_ATTEMPTS,
    );

    switch (result) {
      case 1:
        return;
      case -1:
        throw new BadRequestException('کد تأیید منقضی شده یا وجود ندارد');
      case -2:
        throw new BadRequestException(
          'سه بار کد اشتباه وارد کردید. لطفاً کد جدید درخواست کنید',
        );
      case 0:
        throw new BadRequestException('کد تأیید اشتباه است');
      default:
        throw new InternalServerErrorException('خطا در بررسی کد تأیید');
    }
  }

  private async sendVerificationOtpCode(email: string): Promise<void> {
    const otpKey = `verify:${email}`;
    const attemptsKey = `verify:attempts:${email}`;
    const resendKey = `verify:resend:${email}`;

    const verificationRandomCode = randomInt(100000, 1000000).toString();

    const cooldown = await this.redis.client.set(
      resendKey,
      '1',
      'EX',
      this.OTP_RESEND_TTL,
      'NX',
    );

    if (cooldown !== 'OK') {
      throw new HttpException(
        'لطفاً قبل از درخواست مجدد کد تایید، کمی صبر کنید',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    try {
      await this.redis.client.set(
        otpKey,
        verificationRandomCode,
        'EX',
        this.OTP_TTL,
      );

      await this.redis.client.del(attemptsKey);

      await this.mailerService.sendMail({
        to: email,
        subject: 'کد تأیید حساب کاربری',
        html: this.designEmailHtml(verificationRandomCode),
      });
    } catch {
      await this.redis.client.del(otpKey, attemptsKey, resendKey);
      throw new InternalServerErrorException(
        'ارسال ایمیل تأیید با خطا مواجه شد',
      );
    }
  }

  async signUp(dto: SignUpDto): Promise<ApiResponse<void>> {
    const email = dto.email.trim().toLowerCase();
    const username = dto.username.trim();

    const existingEmail = await this.users.findOne({
      where: { email },
    });

    const existingUsername = await this.users.findOne({
      where: { username },
    });

    if (existingEmail) {
      if (existingEmail.isVerified) {
        throw new BadRequestException('این ایمیل قبلاً ثبت نام کرده است');
      }

      if (existingUsername && existingUsername.id !== existingEmail.id) {
        throw new BadRequestException('این نام کاربری قبلاً ثبت شده است');
      }

      await this.sendVerificationOtpCode(email);

      return {
        statusCode: HttpStatus.OK,
        message: 'حساب شما هنوز تأیید نشده است. کد تأیید جدید ارسال شد',
      };
    }

    if (existingUsername) {
      throw new BadRequestException('این نام کاربری قبلاً ثبت شده است');
    }

    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('رمز عبور و تایید آن مطابقت ندارند');
    }

    const hashedPassword = await hash(dto.password, 10);

    const newUser = await this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(Auth);
      const profileRepository = manager.getRepository(Profile);

      const user = userRepository.create({
        username,
        email,
        password: hashedPassword,
        isVerified: false,
      });

      const saveUser = await userRepository.save(user);

      const profile = profileRepository.create({
        user: saveUser,
        level: 1,
        current_xp: 0,
        next_level_xp: 100,
        rank: 'Bronze',
        kills: 0,
        deaths: 0,
        matches_won: 0,
        matches_played: 0,
      });

      await profileRepository.save(profile);

      return saveUser;
    });

    await this.sendVerificationOtpCode(newUser.email);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'کد تایید با موفقیت ارسال شد',
    };
  }

  async verificationEmail(dto: VerificationEmailDto) {
    const email = dto.email.trim().toLowerCase();

    const verifyUser = await this.users.findOne({ where: { email } });

    if (!verifyUser) {
      throw new BadRequestException('کاربری با این ایمیل یافت نشد');
    }

    if (verifyUser?.isVerified) {
      throw new BadRequestException('ایمیل قبلاً تأیید شده است');
    }

    await this.verifyOtpCode(email, dto.code);

    verifyUser.isVerified = true;

    await this.users.save(verifyUser);

    const payload: JwtPayload = {
      sub: verifyUser.id,
      username: verifyUser.username,
      email: verifyUser.email,
      role: verifyUser.role,
    };

    return {
      statusCode: HttpStatus.OK,
      message: 'ثبت نام با موفقیت انجام شد',
      accessToken: this.jwtService.sign(payload),
    };
  }

  async resendVerificationOtpCode(dto: ResendVerificationOtpCodeDto): Promise<ApiResponse<void>> {
    const email = dto.email.trim().toLowerCase();

    const verifyUser = await this.users.findOne({ where: { email } });

    if (!verifyUser) {
      throw new BadRequestException('کاربری با این ایمیل یافت نشد');
    }

    if (verifyUser.isVerified) {
      throw new BadRequestException('ایمیل قبلاً تأیید شده است');
    }

    await this.sendVerificationOtpCode(email);

    return {
      statusCode: HttpStatus.OK,
      message: 'کد تأیید جدید ارسال شد',
    };
  }

  async signIn(dto: SignInDto) {
    const identifier = dto.identifier.trim();

    const isEmail = identifier.includes('@');

    const existingUser = await this.users.findOne({
      where: isEmail
        ? { email: identifier.toLowerCase() }
        : { username: identifier },
    });

    if (!existingUser) {
      throw new UnauthorizedException('نام کاربری یا گذرواژه اشتباه است');
    }

    if (!existingUser.isVerified) {
      throw new BadRequestException('حساب کاربری شما هنوز تأیید نشده است');
    }

    const isPasswordValid = await compare(dto.password, existingUser.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('نام کاربری یا گذرواژه اشتباه است');
    }

    existingUser.last_login_at = new Date();

    await this.users.save(existingUser);

    const payload: JwtPayload = {
      sub: existingUser.id,
      username: existingUser.username,
      email: existingUser.email,
      role: existingUser.role,
    };

    return {
      statusCode: HttpStatus.OK,
      message: 'ورود با موفقیت انجام شد',
      accessToken: this.jwtService.sign(payload),
    };
  }
}
