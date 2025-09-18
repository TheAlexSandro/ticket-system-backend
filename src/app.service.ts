import { Injectable, HttpStatus, Res } from "@nestjs/common";
import { Helper } from "./resources/helper/Helper";
import { Response } from "express";

@Injectable()
export class AppService {
  index(@Res() res: Response): any {
    return Helper.response(res, HttpStatus.OK, true, "I am alive!");
  }

  ping(@Res() res: Response): void {
    return Helper.response(res, HttpStatus.OK, true, "Pong!");
  }
}
