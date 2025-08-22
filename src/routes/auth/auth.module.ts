import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { Tokenify } from "src/resources/helper/Tokenify";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env["JWT_SECRET"],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, Tokenify],
  exports: [Tokenify]
})
export class AuthModule {}
