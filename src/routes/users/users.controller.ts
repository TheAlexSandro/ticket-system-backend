import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("get")
  getUsers(@Res() res: Response) {
    return this.usersService.getUsers(res);
  }
}
