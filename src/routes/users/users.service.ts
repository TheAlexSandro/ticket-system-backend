import { Injectable, HttpStatus, Res } from "@nestjs/common";
import { Helper } from "../../resources/helper/Helper";
import { Response } from "express";
import errors from "src/resources/errors/errors";
import { Tickets } from "src/resources/tickets/Tickets";
import { RedisCache } from "src/resources/database/Redis";
import { Database } from "src/resources/database/Database";

type IdentifierMethod = "id" | "name";

@Injectable()
export class UsersService {
  private ticket: Tickets;

  constructor() {
    this.ticket = new Tickets();
  }

  admin(@Res() res: Response): void {
    Database.add("admin_dashboard", "admin", "id");
    return Helper.response(res, HttpStatus.OK, true, "Success!", null);
  }

  scan(
    @Res() res: Response,
    method: string | null,
    identifier: string | null
  ): void {
    if (!identifier || !method)
      return Helper.response(
        res,
        HttpStatus.OK,
        false,
        errors["404"]["EMPTY_PARAMETER"].message.replace(
          "{param}",
          "method, identifier"
        ),
        errors["404"]["EMPTY_PARAMETER"].code
      );
    if (!["id", "name"].includes(method))
      return Helper.response(
        res,
        HttpStatus.OK,
        false,
        errors["404"]["INVALID_VALUE_IN_PARAMETER"].message
          .replace("{param}", "method")
          .replace("{accept}", "id, name"),
        errors["404"]["INVALID_VALUE_IN_PARAMETER"].code
      );

    const ident = identifier.toLowerCase();
    RedisCache.main()
      .get(ident)
      .then((r) => {
        if (r) {
          const rst = JSON.parse(r).map((item: any) => ({
            ...item,
            is_scanned: true,
          }));

          return Helper.response(
            res,
            HttpStatus.OK,
            true,
            "Resolved!",
            null,
            rst
          );
        }

        return this.ticket.get(
          method as IdentifierMethod,
          ident,
          (error, result) => {
            if (error)
              return Helper.response(
                res,
                HttpStatus.OK,
                false,
                error,
                errors["400"]["UNKNOWN_ERROR"].code
              );
            if (!result)
              return Helper.response(
                res,
                HttpStatus.OK,
                false,
                errors["404"]["USER_NOT_FOUND"].message,
                errors["404"]["USER_NOT_FOUND"].code
              );
            RedisCache.main().set(ident, JSON.stringify(result));
            if (method == "id") {
              RedisCache.main().set(
                result[0].nama.toLowerCase(),
                JSON.stringify(result)
              );
            } else {
              RedisCache.main().set(
                result[0].id.toLowerCase(),
                JSON.stringify(result)
              );
            }
            RedisCache.main()
              .get("total_pengunjung")
              .then((total) => {
                if (total) {
                  RedisCache.main().set("total_pengunjung", Number(total) + 1);
                } else {
                  RedisCache.main().set("total_pengunjung", 1);
                }
              });

            return Helper.response(
              res,
              HttpStatus.OK,
              true,
              "Resolved!",
              null,
              result
            );
          }
        );
      })
      .catch((err) => {
        return Helper.response(
          res,
          HttpStatus.OK,
          false,
          err,
          errors["400"]["UNKNOWN_ERROR"].code
        );
      });
  }
}
