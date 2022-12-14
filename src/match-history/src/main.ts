import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3600;
  await app.listen(port, () => {
    console.log(`Server on ${port}`);
  });
}
bootstrap();
