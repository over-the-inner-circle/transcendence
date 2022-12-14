import { HttpExceptionFilter } from './common/http/exception/http-exception.filter';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  const port = process.env.SERVER_PORT || 8282;
  await app.listen(port, () => {
    console.log(`Server on ${port}`);
  });
}
bootstrap();
