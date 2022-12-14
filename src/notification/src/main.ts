import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const PORT = parseInt(process.env.SERVER_PORT);
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT, () => console.log(`Server on ${PORT}`));
}
bootstrap();
