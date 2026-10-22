import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );

  const config = new DocumentBuilder()
    .setTitle('Omni Play')
    .setDescription('Omni Play stream and game backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  app.useLogger(app.get(Logger));

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const configSwagger: SwaggerCustomOptions = {
    useGlobalPrefix: true,
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
    },
  };

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/v1/docs', app, documentFactory, configSwagger);

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
