import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

import { UsersModule } from "./routes/users/users.module";
import { AuthModule } from "./routes/auth/auth.module";
import { AdminModule } from "./routes/admin/admin.module";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./resources/security/auth.guard";

@Module({
  imports: [
    UsersModule,
    AuthModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
