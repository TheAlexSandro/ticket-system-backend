import { Injectable, HttpStatus, Res } from "@nestjs/common";
import { Helper } from "../../resources/helper/Helper";
import { Response } from "express";

@Injectable()
export class UsersService {
  getUsers(@Res() res: Response): void {
    return Helper.response(res, HttpStatus.OK, true, "OK");
  }
}
