import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RmqErrorFactory } from './common/rmq-module/types/rmq-error.factory';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
      exceptionFactory: RmqErrorFactory('user-service'),
    }),
  );
  const port = process.env.PORT || 3500;
  await app.listen(port);
}
bootstrap();
