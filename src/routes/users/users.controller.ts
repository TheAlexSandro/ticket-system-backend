import { Body, Controller, Post, Res, Req } from "@nestjs/common";
import { Response } from "express";
import { UsersService } from "./users.service";
import { Public } from "src/resources/security/public.decorator";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post("scan")
  scan(
    @Res() res: Response,
    @Body("method") method: string | null,
    @Body("identifier") identifier: string | null
  ): void {
    return this.usersService.scan(res, method, identifier);
  }

  @Post("register")
  register(
    @Res() res: Response,
    @Body("nama") nama: string | null,
    @Body("umur") umur: string | null,
    @Body("phone") phone: string | null,
    @Body("lulus_tahun") lulus_tahun: string | null,
    @Body("alamat") alamat: string | null,
    @Body("bukti") bukti: string | null
  ): void {
    return this.usersService.register(
      res,
      nama,
      umur,
      phone,
      lulus_tahun,
      alamat,
      bukti
    );
  }

  @Post("getAlumni")
  getAlumni(@Res() res: Response, @Req() req: Request): void {
    return this.usersService.getAlumni(res, req);
  }
}
