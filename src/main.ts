import { config } from 'dotenv';
config({ path: '.env' });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthGuard } from './resources/security/auth.guard';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalGuards(new AuthGuard());
  app.use(cookieParser());
  app.enableCors({
    origin: process.env["FRONTEND_URL"]?.split(","),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });

  await app.listen(8000, () => {
    console.log("OK")
  });
}
bootstrap();
