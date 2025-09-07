import { Injectable, HttpStatus, Res } from "@nestjs/common";
import { Helper } from "../../resources/helper/Helper";
import { Response } from "express";
import errors from "../../resources/errors/errors";
import { Database } from "../../resources/database/Database";
import { AdminGateway } from "./admin.gateway";

type CameraStatus = "on" | "off";
type CameraPermissions = "all" | "admin";
type ScanningMethod = "id" | "name";

@Injectable()
export class AdminService {
  constructor(private adminGate: AdminGateway) {}

  getInfo(@Res() res: Response) {
    Database.get("admin_dashboard", "id", "admin", (error, result) => {
      if (error)
        return Helper.response(
          res,
          HttpStatus.OK,
          false,
          error,
          errors["400"]["UNKNOWN_ERROR"].code,
        );
      return Helper.response(res, HttpStatus.OK, true, "Success!", null, {
        camera_permissions: result!["camera_permissions"],
        camera_status: result!["camera_status"],
        scanning_method: result!["scanning_method"],
      });
    });
  }

  cameraStatus(@Res() res: Response, status: CameraStatus | null) {
    if (!status)
      return Helper.response(
        res,
        HttpStatus.OK,
        false,
        errors["404"]["EMPTY_PARAMETER"].message.replace("{param}", "status"),
        errors["404"]["EMPTY_PARAMETER"].code,
      );

    if (!["on", "off"].includes(status))
      return Helper.response(
        res,
        HttpStatus.OK,
        false,
        "Value hanya menerima on dan off",
        errors["404"]["EMPTY_PARAMETER"].code,
      );

    Database.edit(
      "admin_dashboard",
      "id",
      "admin",
      "camera_status",
      status,
      (error) => {
        if (error)
          return Helper.response(
            res,
            HttpStatus.OK,
            false,
            error,
            errors["400"]["UNKNOWN_ERROR"].code,
          );
        this.adminGate.sendCameraStatus(status == "on");
        return Helper.response(
          res,
          HttpStatus.OK,
          true,
          "Success!",
          null,
          status == "on",
        );
      },
    );
  }

  cameraPermissions(@Res() res: Response, role: CameraPermissions | null) {
    if (!role)
      return Helper.response(
        res,
        HttpStatus.OK,
        false,
        errors["404"]["EMPTY_PARAMETER"].message.replace("{param}", "role"),
        errors["404"]["EMPTY_PARAMETER"].code,
      );

    if (!["all", "admin"].includes(role))
      return Helper.response(
        res,
        HttpStatus.OK,
        false,
        "Value hanya menerima all dan admin",
        errors["404"]["EMPTY_PARAMETER"].code,
      );

    Database.edit(
      "admin_dashboard",
      "id",
      "admin",
      "camera_permissions",
      role,
      (error) => {
        if (error)
          return Helper.response(
            res,
            HttpStatus.OK,
            false,
            error,
            errors["400"]["UNKNOWN_ERROR"].code,
          );

        this.adminGate.logoutCamera();
        return Helper.response(res, HttpStatus.OK, true, "Success!", null);
      },
    );
  }

  scanningMethod(@Res() res: Response, method: ScanningMethod | null) {
    if (!method)
      return Helper.response(
        res,
        HttpStatus.OK,
        false,
        errors["404"]["EMPTY_PARAMETER"].message.replace("{param}", "method"),
        errors["404"]["EMPTY_PARAMETER"].code,
      );

    if (!["id", "name"].includes(method))
      return Helper.response(
        res,
        HttpStatus.OK,
        false,
        "Value hanya menerima id dan name",
        errors["404"]["EMPTY_PARAMETER"].code,
      );

    Database.edit(
      "admin_dashboard",
      "id",
      "admin",
      "scanning_method",
      method,
      (error) => {
        if (error)
          return Helper.response(
            res,
            HttpStatus.OK,
            false,
            error,
            errors["400"]["UNKNOWN_ERROR"].code,
          );

        this.adminGate.logoutCamera();
        return Helper.response(res, HttpStatus.OK, true, "Success!", null);
      },
    );
  }
}
