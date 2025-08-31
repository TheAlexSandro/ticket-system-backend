import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { UsersService } from "./users.service";
import { Public } from "src/resources/security/public.decorator";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("scan")
  scan(@Res() res: Response, @Query("method") method: string | null, @Query("identifier") identifier: string | null) {
    return this.usersService.scan(res, method, identifier);
  }
}
