import { Controller, Body, Post, Res, Req } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { Response } from "express";

type CameraStatus = "on" | "off";
type CameraPermissions = "all" | "admin";
type ScanningMethod = "id" | "name";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post("getInfo")
  getInfo(@Res() res: Response): void {
    this.adminService.getInfo(res);
  }

  @Post("cameraStatus")
  cameraStatus(
    @Res() res: Response,
    @Body("status") status: CameraStatus | null
  ): void {
    return this.adminService.cameraStatus(res, status);
  }

  @Post("cameraPermissions")
  cameraPermissions(
    @Res() res: Response,
    @Body("role") role: CameraPermissions | null
  ): void {
    return this.adminService.cameraPermissions(res, role);
  }

  @Post("scanningMethod")
  scanningMethod(
    @Res() res: Response,
    @Body("method") method: ScanningMethod | null
  ): void {
    return this.adminService.scanningMethod(res, method);
  }

  @Post("forceRefresh")
  drop(@Res() res: Response, @Req() req: Request): void {
    return this.adminService.drop(res, req);
  }

  @Post("getTotal")
  getTotal(@Res() res: Response): void {
    return this.adminService.getTotal(res);
  }
}
