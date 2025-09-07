import { Body, Controller, Get, Post, Res } from "@nestjs/common";
import { Response } from "express";
import { UsersService } from "./users.service";
import { Public } from "src/resources/security/public.decorator";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Public()
  // @Get("admin")
  // admin(@Res() res: Response) {
  //   return this.usersService.admin(res);
  // }

  @Public()
  @Post("scan")
  scan(
    @Res() res: Response,
    @Body("method") method: string | null,
    @Body("identifier") identifier: string | null
  ) {
    return this.usersService.scan(res, method, identifier);
  }
}
