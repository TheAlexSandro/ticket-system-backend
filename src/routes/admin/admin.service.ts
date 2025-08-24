import { Injectable, HttpStatus, Res } from "@nestjs/common";
import { Helper } from "../../resources/helper/Helper";
import { Response } from "express";
import errors from "../../resources/errors/errors";
import { Database } from "../../resources/database/Database";
import { AdminGateway } from "./admin.gateway";

type CameraStatus = "on" | "off";
type CameraPermissions = "all" | "admin";

@Injectable()
export class AdminService {
  constructor(private adminGate: AdminGateway) {};

  getInfo(@Res() res: Response) {
    Database.get("admin_dashboard", "id", "admin", (error, result) => {
      if (error)
        return Helper.response(
          res,
          HttpStatus.OK,
          false,
          error,
          errors["400"]["UNKNOWN_ERROR"].code
        );
      return Helper.response(
        res,
        HttpStatus.OK,
        true,
        "Success!",
        null,
        { camera_permissions: result!["camera_permissions"], camera_status: result!["camera_status"] }
      );
    });
  }

  cameraStatus(@Res() res: Response, status: CameraStatus | null) {
    if (!status)
      return Helper.response(
        res,
        HttpStatus.OK,
        false,
        errors["404"]["EMPTY_PARAMETER"].message.replace("{param}", "status"),
        errors["404"]["EMPTY_PARAMETER"].code
      );

    if (!["on", "off"].includes(status))
      return Helper.response(
        res,
        HttpStatus.OK,
        false,
        "Value hanya menerima on dan off",
        errors["404"]["EMPTY_PARAMETER"].code
      );

    Database.edit(
      "admin_dashboard",
      "id",
      "admin",
      "camera_status",
      status,
      (error, result) => {
        if (error)
          return Helper.response(
            res,
            HttpStatus.OK,
            false,
            error,
            errors["400"]["UNKNOWN_ERROR"].code
          );
        this.adminGate.sendCameraStatus(status == "on" ? true : false);
        return Helper.response(
          res,
          HttpStatus.OK,
          true,
          "Success!",
          null,
          status == "on" ? true : false
        );
      }
    );
  }

  cameraPermissions(@Res() res: Response, role: CameraPermissions | null) {
    if (!role)
      return Helper.response(
        res,
        HttpStatus.OK,
        false,
        errors["404"]["EMPTY_PARAMETER"].message.replace("{param}", "role"),
        errors["404"]["EMPTY_PARAMETER"].code
      );

    if (!["all", "admin"].includes(role))
      return Helper.response(
        res,
        HttpStatus.OK,
        false,
        "Value hanya menerima all dan admin",
        errors["404"]["EMPTY_PARAMETER"].code
      );

    Database.edit(
      "admin_dashboard",
      "id",
      "admin",
      "camera_permissions",
      role,
      (error, result) => {
        if (error)
          return Helper.response(
            res,
            HttpStatus.OK,
            false,
            error,
            errors["400"]["UNKNOWN_ERROR"].code
          );

        if (role == "admin") { this.adminGate.logoutCamera() };
        return Helper.response(
          res,
          HttpStatus.OK,
          true,
          "Success!",
          null
        );
      }
    );
  }
}
