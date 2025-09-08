import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { AdminGateway } from "./admin.gateway";
import { Tokenify } from "../../resources/helper/Tokenify";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env["JWT_SECRET"],
      signOptions: { expiresIn: "1h" },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminGateway, Tokenify],
  exports: [Tokenify],
})
export class AdminModule {}
