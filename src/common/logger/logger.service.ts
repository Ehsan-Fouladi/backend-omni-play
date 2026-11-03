import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Params } from 'nestjs-pino';

@Injectable()
export class LoggerConfigService {
  constructor(private readonly configService: ConfigService) {}

  createLoggerConfig(): Params {
    const isDevelopment =
      this.configService.get<string>('NODE_ENV') !== 'production';
    return {
      pinoHttp: {
        transport: isDevelopment
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
        level: isDevelopment ? 'debug' : 'info',
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
    };
  }
}
