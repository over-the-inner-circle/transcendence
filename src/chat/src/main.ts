import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = parseInt(process.env.SERVER_PORT);
  console.log(process.env.PG_HOST);
  console.log(parseInt(process.env.PG_PORT));
  console.log(process.env.PG_USERNAME);
  console.log(process.env.PG_PASSWORD);
  console.log(process.env.PG_DATABASE);
  await app.listen(port, () => console.log(`chat server on ${port}`));
}
bootstrap();
