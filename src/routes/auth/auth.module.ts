import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { Tokenify } from "src/resources/helper/Tokenify";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env["JWT_SECRET"]
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, Tokenify],
  exports: [Tokenify],
})
export class AuthModule {}
