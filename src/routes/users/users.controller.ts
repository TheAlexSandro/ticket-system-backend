import { Body, Controller, Post, Res } from "@nestjs/common";
import { Response } from "express";
import { UsersService } from "./users.service";
import { Public } from "src/resources/security/public.decorator";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post("scan")
  scan(@Res() res: Response, @Body("method") method: string | null, @Body("identifier") identifier: string | null) {
    return this.usersService.scan(res, method, identifier);
  }
}
