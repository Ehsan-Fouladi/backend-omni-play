import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer';

@Injectable()
export class MailerConfigService implements MailerOptionsFactory {
  constructor(private readonly configService: ConfigService) {}
  createMailerOptions(): Promise<MailerOptions> | MailerOptions {
    return {
      transport: {
        host: this.configService.get<string>('MAIL_HOST'),
        port: Number(this.configService.get<number>('MAIL_PORT')),
        auth: {
          user: this.configService.get<string>('MAIL_USER'),
          pass: this.configService.get<string>('MAIL_PASS'),
        },
      },
      defaults: {
        from: this.configService.get<string>('MAIL_FROM'),
      },
    };
  }
}
