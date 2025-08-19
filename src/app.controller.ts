import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  index(@Res() res: Response): object {
    return this.appService.index(res);
  }

  @Get("ping")
  Ping(@Res() res: Response): void {
    return this.appService.ping(res);
  }
}
