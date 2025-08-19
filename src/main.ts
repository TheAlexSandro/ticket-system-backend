import { config } from "dotenv";
config({ path: ".env" });

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AuthGuard } from "./resources/security/auth.guard";
import * as cookieParser from "cookie-parser";
import { ExpressAdapter } from "@nestjs/platform-express";
import * as express from "express";

const server = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.useGlobalGuards(new AuthGuard());
  app.use(cookieParser());
  app.enableCors({
    origin: process.env["FRONTEND_URL"]?.split(","),
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  });

  await app.init();
}

bootstrap();

export default server;
