import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { Helper } from '../helper/Helper';
import errors from '../errors/errors';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      Helper.response(
        res,
        HttpStatus.UNAUTHORIZED,
        false,
        errors['401']['ACCESS_DENIED'].message,
        errors['401']['ACCESS_DENIED'].code,
      );
      return false;
    }

    const token = authHeader.split(' ')[1];
    const validToken = String(process.env['AUTH_TOKEN']);

    if (token != validToken) {
      Helper.response(
        res,
        HttpStatus.UNAUTHORIZED,
        false,
        errors['401']['ACCESS_DENIED'].message,
        errors['401']['ACCESS_DENIED'].code,
      );
      return false;
    }

    return true;
  }
}
