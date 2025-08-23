import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Helper } from "../helper/Helper";
import errors from "../errors/errors";
import { Tokenify } from "../helper/Tokenify";
import { IS_PUBLIC_KEY } from "./public.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector, private tokenify: Tokenify) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const P_token = request.body["P_token"] as string | null;
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;
    if (request.method == "GET") return true;

    const authHeader = request.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      Helper.response(res, HttpStatus.UNAUTHORIZED, false,
        errors["401"]["ACCESS_DENIED"].message,
        errors["401"]["ACCESS_DENIED"].code
      );
      return false;
    }

    const token = authHeader.split(" ")[1];
    const validToken = String(process.env["AUTH_TOKEN"]);

    if (token !== validToken) {
      Helper.response(res, HttpStatus.UNAUTHORIZED, false,
        errors["401"]["ACCESS_DENIED"].message,
        errors["401"]["ACCESS_DENIED"].code
      );
      return false;
    }

    const isApproved = await this.tokenify.verifyToken(request, res, P_token);
    if (!isApproved) {
      Helper.response(res, HttpStatus.UNAUTHORIZED, false,
        errors["401"]["ACCESS_DENIED"].message,
        errors["401"]["ACCESS_DENIED"].code
      );
      return false;
    }

    return true;
  }
}
