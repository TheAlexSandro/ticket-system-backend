import { Controller, Post, Req, Res, Body } from "@nestjs/common";
import { Response, Request } from "express";
import { AuthService } from "./auth.service";
import { Public } from "../../resources/security/public.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("generateAuthentication")
  generateAuthentication(@Res() res: Response): void {
    this.authService.generateAuthentication(res);
  }

  @Post("signUp")
  signUp(
    @Res() res: Response,
    @Body("username") username: string | null,
    @Body("password") password: string | null,
  ): void {
    this.authService.signUp(res, username, password);
  }

  @Post("getUsername")
  getUsername(
    @Res() res: Response,
    @Body("username") username: string | null,
  ): void {
    this.authService.getUsername(res, username);
  }

  @Post("signIn")
  signIn(
    @Res() res: Response,
    @Body("username") username: string | null,
    @Body("password") password: string | null,
  ): void {
    this.authService.signIn(res, username, password);
  }

  @Post("signOut")
  signOut(@Res() res: Response, @Req() req: Request): void {
    this.authService.signOut(res, req);
  }

  @Post("verify")
  verify(@Res() res: Response, @Req() req: Request): void {
    this.authService.verify(res, req);
  }

  @Post("clearCookie")
  clearCookie(@Res() res: Response): void {
    this.authService.clearCookie(res);
  }
}
