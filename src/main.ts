import { config } from "dotenv";
config({ path: ".env" });

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AuthGuard } from "./resources/security/auth.guard";
import cookieParser from "cookie-parser";
import { Reflector } from "@nestjs/core";
import { Tokenify } from "./resources/helper/Tokenify";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);
  const tokenify = app.get(Tokenify);
  app.use(cookieParser());
  app.useGlobalGuards(new AuthGuard(reflector, tokenify));
  app.enableCors({
    origin: process.env["FRONTEND_URL"]?.split(","),
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  });

  await app.listen(8000, () => {
    console.log("OK");
  });
}
bootstrap();
