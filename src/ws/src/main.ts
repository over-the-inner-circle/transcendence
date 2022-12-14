import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  process.on('unhandledRejection', (error) => {
    console.error('unhandled rejection => ', error); // This prints error with stack included (as for normal errors)
  });

  const app = await NestFactory.create(AppModule);
  const PORT = parseInt(process.env.SERVER_PORT);

  await app.listen(PORT, () => console.log(`ws-server on ${PORT}`));
}
bootstrap();
