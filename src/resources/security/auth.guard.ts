import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Helper } from "../helper/Helper";
import errors from "../errors/errors";
import { Tokenify } from "../helper/Tokenify";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { Request, Response } from "express";
import { join } from "path";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tokenify: Tokenify
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;
    try {
      const P_token = request.body["P_token"] as string | null;
      const isApproved = await this.tokenify.verifyToken(request, res, P_token);
      if (!isApproved) {
        Helper.response(
          res,
          HttpStatus.UNAUTHORIZED,
          false,
          "P_token kadaluarsa.",
          errors["401"]["ACCESS_DENIED"].code
        );
        return false;
      }

      return true;
    } catch {
      Helper.response(
        res,
        HttpStatus.UNAUTHORIZED,
        false,
        errors["401"]["ACCESS_DENIED"].message,
        errors["401"]["ACCESS_DENIED"].code
      );
      return false;
    }
  }
}
