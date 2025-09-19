import { Injectable, HttpStatus, Res, Req } from "@nestjs/common";
import { Helper } from "../../resources/helper/Helper";
import { Response, Request, CookieOptions } from "express";
import errors from "../../resources/errors/errors";
import { Database } from "../../resources/database/Database";
import { Password } from "../../resources/helper/Password";
import { Tokenify } from "../../resources/helper/Tokenify";

@Injectable()
export class AuthService {
  constructor(private readonly tokenify: Tokenify) {}

  generateAuthentication(@Res() res: Response) {
    const r = this.tokenify.generateRefreshToken(res);
    return Helper.response(res, HttpStatus.OK, true, "Success!", null, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      P_token: r["P_token"],
    });
  }

  signUp(
    @Res() res: Response,
    username: string | null,
    password: string | null
  ) {
    if (!username || !password)
      return Helper.response(
        res,
        HttpStatus.OK,
        false,
        errors["404"]["EMPTY_PARAMETER"].message.replace(
          "{param}",
          "username, password"
        ),
        errors["404"]["EMPTY_PARAMETER"].code
      );

    const IDs = Helper.generateID(10);
    const salt = Password.generateSalt();
    const encrypt = Password.hashPassword(password, salt);

    Database.add(
      "user",
      IDs,
      "username",
      { password: encrypt, salt },
      (error) => {
        if (error)
          return Helper.response(
            res,
            HttpStatus.OK,
            false,
            error,
            errors["400"]["UNKNOWN_ERROR"].code
          );
        return Helper.response(res, HttpStatus.OK, true, "Success!");
      }
    );
  }

  getUsername(@Res() res: Response, username: string | null) {
    if (!username)
      return Helper.response(
        res,
        HttpStatus.OK,
        false,
        errors["404"]["EMPTY_PARAMETER"].message.replace("{param}", "username"),
        errors["404"]["EMPTY_PARAMETER"].code
      );

    Database.get("user", "username", username, (error, result) => {
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
          "Not Found",
          errors["404"]["USER_NOT_FOUND"].code
        );

      return Helper.response(res, HttpStatus.OK, true, "Success!");
    });
  }

  signIn(
    @Res() res: Response,
    username: string | null,
    password: string | null
  ) {
    if (!username || !password)
      return Helper.response(
        res,
        HttpStatus.OK,
        false,
        errors["404"]["EMPTY_PARAMETER"].message.replace(
          "{param}",
          "username, password"
        ),
        errors["404"]["EMPTY_PARAMETER"].code
      );

    Database.get("user", "username", username, (error, result) => {
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
          "Not Found",
          errors["404"]["USER_NOT_FOUND"].code
        );
      const pwd = result["password"];
      const salt = result["salt"];
      const validate = Password.verifyPassword(password, salt, pwd);
      if (!validate)
        return Helper.response(
          res,
          HttpStatus.OK,
          false,
          errors["401"]["UNAUTHORIZED_ACCESS"].message,
          errors["401"]["UNAUTHORIZED_ACCESS"].code
        );

      const token = this.tokenify.generateJWT({ username });
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: String(process.env["COOKIE_SAME_SITE"]) as
          | "lax"
          | "strict"
          | "none"
          | undefined,
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
        domain: String(process.env["COOKIE_DOMAIN"])
      });
      Database.add("admin_session", token, "token");
      return Helper.response(res, HttpStatus.OK, true, "Success!");
    });
  }

  signOut(@Res() res: Response, @Req() req: Request) {
    const getJWT = (req as any).cookies["auth_token"];
    Database.remove("admin_session", "token", getJWT);
    return Helper.response(res, HttpStatus.OK, true, "Success!");
  }

  verify(@Res() res: Response, @Req() req: Request) {
    const getJWT = (req as any).cookies["auth_token"];
    if (!getJWT)
      return Helper.response(
        res,
        HttpStatus.OK,
        false,
        "Not logged in",
        errors["401"]["UNAUTHORIZED_ACCESS"].code
      );

    try {
      this.tokenify.verifyJWT(getJWT);
    } catch {
      return Helper.response(
        res,
        HttpStatus.OK,
        false,
        "Invalid token",
        errors["401"]["UNAUTHORIZED_ACCESS"].code
      );
    }

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

      Database.get(
        "admin_dashboard",
        "id",
        "admin",
        (err, r) => {
          if (err)
            return Helper.response(
              res,
              HttpStatus.OK,
              false,
              err,
              errors["400"]["UNKNOWN_ERROR"].code
            );

          return Helper.response(res, HttpStatus.OK, true, "Success!", null, r);
        }
      );
    });
  }

  clearCookie(@Res() res: Response) {
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
    return Helper.response(res, HttpStatus.OK, true, "Success!", null);
  }
}
