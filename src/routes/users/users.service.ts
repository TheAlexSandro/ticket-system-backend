import { Injectable, HttpStatus, Res } from "@nestjs/common";
import { Helper } from "../../resources/helper/Helper";
import { Response } from "express";
import errors from "src/resources/errors/errors";
import { Tickets } from "src/resources/tickets/Tickets";

type IdentifierMethod = "id" | "name";

@Injectable()
export class UsersService {
  private ticket: Tickets;

  constructor() {
    this.ticket = new Tickets();
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

    return this.ticket.get(
      method as IdentifierMethod,
      identifier,
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
  }
}
