import { Controller, Get, Res } from "@nestjs/common";
import { AppService } from "./app.service";
import { Response } from "express";
import { Public } from "./resources/security/public.decorator";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  index(@Res() res: Response): object {
    return this.appService.index(res);
  }

  @Public()
  @Get("ping")
  Ping(@Res() res: Response): void {
    return this.appService.ping(res);
  }
}
