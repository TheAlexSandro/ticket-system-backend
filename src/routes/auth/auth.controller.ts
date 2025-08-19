import { Controller, Post, Req, Res, Query } from "@nestjs/common";
import { Response, Request } from "express";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signUp")
  signUp(@Res() res: Response, @Query() username: string | null, @Query() password: string | null) {
    this.authService.signUp(res, username!['username'], password!['password']);
  }

  @Post("getUsername")
  getUsername(@Res() res: Response, @Query() username: string | null) {
    this.authService.getUsername(res, username!['username']);
  }

  @Post("signIn")
  signIn(@Res() res: Response, @Query() username: string | null, @Query() password: string | null) {
    this.authService.signIn(res, username!['username'], password!['password']);
  }

  @Post("signOut")
  signOut(@Res() res: Response, @Req() req: Request) {
    this.authService.signOut(res, req);
  }

  @Post("verify")
  verify(@Res() res: Response, @Req() req: Request) {
    this.authService.verify(res, req);
  }

  @Post("clearCookie")
  clearCookie(@Res() res: Response, @Req() req: Request) {
    this.authService.clearCookie(res, req);
  }
}
