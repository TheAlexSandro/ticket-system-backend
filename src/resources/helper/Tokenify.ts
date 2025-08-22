import { Hash } from "./Hash";
import { Database } from "../database/Database";
import { Injectable, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { JwtService } from "@nestjs/jwt";

type HashToken = { P_token: string; salt: string; hash: string };

@Injectable()
export class Tokenify {
  constructor(private readonly jwtService: JwtService) {}

  verifyToken(
    @Req() req: Request,
    @Res() res: Response,
    P_token: string | null
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!P_token) return resolve(false);

      const getToken = (req as any).cookies["refresh_token"];
      let jwts: object | boolean;

      try {
        jwts = this.jwtService.verify(getToken);
      } catch (e) {
        jwts = false;
      }

      if (!getToken || (typeof jwts == "boolean" && !jwts)) {
        return resolve(false);
      }

      Database.get("refresh_token", "token", getToken, (error, result) => {
        if (error || !result) {
          return resolve(false);
        }

        Database.get("hash_token", "token", P_token, (err, r) => {
          if (err || !r) {
            return resolve(false);
          }

          const verifyHash = Hash.verifyToken(P_token, r["salt"], r["hash"]);
          if (!verifyHash) {
            return resolve(false);
          }

          res.cookie("refresh_token", "", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
            expires: new Date(0),
          });

          return resolve(true);
        });
      });
    });
  }

  generateRefreshToken(@Res() res: Response): object {
    const duration = 5 * 60 * 1000;
    const hash = Hash.generateToken() as HashToken;
    const jwt = this.jwtService.sign({
      P_token: hash["P_token"],
      until: duration,
    });

    Database.add("refresh_token", jwt, "token");
    Database.add("hash_token", hash["P_token"], "token", {
      hash: hash["hashed"],
      hash_salt: hash["salt"],
    });
    res.cookie("refresh_token", jwt, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: duration,
    });

    return { P_token: hash["P_token"], refresh_token: jwt, duration };
  }

  generateJWT(data: object): string {
    const token = this.jwtService.sign({ data });
    return token;
  }

  verifyJWT(token: string): string {
    const r = this.jwtService.verify(token);
    return r;
  }
}
