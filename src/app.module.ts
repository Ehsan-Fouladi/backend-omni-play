import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import configuration from './core/config/configuration';
import { DatabaseModule } from './core/database/database.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                  ignore: 'pid,hostname',
                  translateTime: 'SYS:standard',
                },
              }
            : undefined,
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        customLogLevel: (req, res, err) => {
          if (err || res.statusCode >= 500) {
            return 'error';
          }

          const url = req.url ?? '';

          if (url === '/api/v1/metrics' || url.startsWith('/api/v1/metrics?')) {
            return 'silent';
          }

          if (res.statusCode >= 400) {
            return 'warn';
          }

          return 'info';
        },
      },
    }),
    PrometheusModule.register(),
    DatabaseModule,
    AuthModule,
  ],
})
export class AppModule {}
