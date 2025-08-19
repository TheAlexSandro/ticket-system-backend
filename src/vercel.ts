import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as serverless from "serverless-http";

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
      origin: process.env['FRONTEND_URL']?.split(","),
      credentials: true,
    });
    await app.init();
    cachedServer = serverless(app.getHttpAdapter().getInstance());
  }
  return cachedServer;
}

export default async function handler(req: any, res: any) {
  const server = await bootstrap();
  return server(req, res);
}
