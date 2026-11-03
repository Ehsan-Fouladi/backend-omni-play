import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import configuration from './core/config/configuration';
import { DatabaseModule } from './core/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { LoggerModule } from './common/logger/logger.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerConfigService } from './core/config/mailer.config';
import { RedisModule } from './common/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MailerModule.forRootAsync({ useClass: MailerConfigService }),
    PrometheusModule.register(),
    LoggerModule,
    DatabaseModule,
    RedisModule,
    AuthModule,
  ],
})
export class AppModule {}
