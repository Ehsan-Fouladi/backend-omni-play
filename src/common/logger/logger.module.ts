import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { LoggerConfigService } from './logger.service';

@Module({
  imports: [
    ConfigModule,
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const loggerConfig = new LoggerConfigService(configService);
        return loggerConfig.createLoggerConfig();
      },
    }),
  ],
  providers: [LoggerConfigService],
  exports: [LoggerConfigService],
})
export class LoggerModule {}
