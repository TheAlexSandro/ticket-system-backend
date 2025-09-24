import { Injectable, HttpStatus, Res, Req } from "@nestjs/common";
import { Helper } from "../../resources/helper/Helper";
import { Response } from "express";
import errors from "../../resources/errors/errors";
import { Database } from "../../resources/database/Database";
import { AdminGateway } from "./admin.gateway";
import { Tokenify } from "../../resources/helper/Tokenify";
import { RedisCache } from "src/resources/database/Redis";

type CameraStatus = "on" | "off";
type CameraPermissions = "all" | "admin";
type ScanningMethod = "id" | "name";

@Injectable()
export class AdminService {
  constructor(
    private adminGate: AdminGateway,
    private readonly tokenify: Tokenify
  ) {}

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
      (error) => {
        if (error)
          return Helper.response(
            res,
            HttpStatus.OK,
            false,
            error,
            errors["400"]["UNKNOWN_ERROR"].code
          );
        this.adminGate.sendCameraStatus(status == "on");
        return Helper.response(
          res,
          HttpStatus.OK,
          true,
          "Success!",
          null,
          status == "on"
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
      (error) => {
        if (error)
          return Helper.response(
            res,
            HttpStatus.OK,
            false,
            error,
            errors["400"]["UNKNOWN_ERROR"].code
          );

        this.adminGate.logoutCamera();
        return Helper.response(res, HttpStatus.OK, true, "Success!", null);
      }
    );
  }

  scanningMethod(@Res() res: Response, method: ScanningMethod | null) {
    if (!method)
      return Helper.response(
        res,
        HttpStatus.OK,
        false,
        errors["404"]["EMPTY_PARAMETER"].message.replace("{param}", "method"),
        errors["404"]["EMPTY_PARAMETER"].code
      );

    if (!["id", "name"].includes(method))
      return Helper.response(
        res,
        HttpStatus.OK,
        false,
        "Value hanya menerima id dan name",
        errors["404"]["EMPTY_PARAMETER"].code
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
            errors["400"]["UNKNOWN_ERROR"].code
          );

        this.adminGate.logoutCamera();
        return Helper.response(res, HttpStatus.OK, true, "Success!", null);
      }
    );
  }

  drop(@Res() res: Response, @Req() req: Request) {
    const getJWT = (req as any).cookies["auth_token"];
    if (!getJWT)
      return Helper.response(
        res,
        HttpStatus.OK,
        false,
        "Not logged in",
        errors["401"]["UNAUTHORIZED_ACCESS"].code
      );
    const verif = this.tokenify.verifyJWT(getJWT);
    if (!verif)
      return Helper.response(
        res,
        HttpStatus.OK,
        false,
        "Invalid token",
        errors["401"]["UNAUTHORIZED_ACCESS"].code
      );

    Database.get("admin_session", "token", getJWT, (err, rest) => {
      if (err)
        return Helper.response(
          res,
          HttpStatus.OK,
          false,
          err,
          errors["400"]["UNKNOWN_ERROR"].code
        );
      if (!rest)
        return Helper.response(
          res,
          HttpStatus.OK,
          false,
          "Invalid token",
          errors["401"]["UNAUTHORIZED_ACCESS"].code
        );

      Database.drop("admin_session");
      res.cookie("auth_token", "", {
        httpOnly: true,
        secure: true,
        sameSite: String(process.env["COOKIE_SAME_SITE"]) as
          | "lax"
          | "strict"
          | "none"
          | undefined,
        path: "/",
        expires: new Date(0),
        domain: String(process.env["COOKIE_DOMAIN"])
      });
      res.cookie("auth_token", "", {
        httpOnly: true,
        secure: true,
        sameSite: String(process.env["COOKIE_SAME_SITE"]) as
          | "lax"
          | "strict"
          | "none"
          | undefined,
        path: "/signin",
        expires: new Date(0),
        domain: String(process.env["COOKIE_DOMAIN"])
      });
      res.cookie("auth_token", "", {
        httpOnly: true,
        secure: true,
        sameSite: String(process.env["COOKIE_SAME_SITE"]) as
          | "lax"
          | "strict"
          | "none"
          | undefined,
        path: "/admin",
        expires: new Date(0),
        domain: String(process.env["COOKIE_DOMAIN"])
      });
      this.adminGate.refresh();
      return Helper.response(res, HttpStatus.OK, true, "Success!", null);
    });
  }

  getTotal(@Res() res: Response) {
    RedisCache.main()
      .get("total_pengunjung")
      .then((total_pengunjung) => {
        RedisCache.main()
          .get("ticket_data")
          .then((ticket_data) => {
            const parseTicketData = ticket_data ? JSON.parse(ticket_data).length : 0;
            const parsePengunjungData = total_pengunjung ? JSON.parse(total_pengunjung).length : 0;
            const listTicketData = ticket_data ? JSON.parse(ticket_data) : [];
            const listPengunjungData = total_pengunjung ? JSON.parse(total_pengunjung) : [];

            const totals =  { total_pengunjung: parsePengunjungData, total_ticket: parseTicketData };
            const list = { ticket_data: listTicketData, pengunjung_data: listPengunjungData };

            return Helper.response(res, HttpStatus.OK, true, "Success!", null, { total: totals, data_list: list });
          });
      });
  }
}
