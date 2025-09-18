import { HttpStatus } from "@nestjs/common";
import { Response } from "express";

export class Helper {
  static response(
    res: Response,
    status_code: HttpStatus,
    ok: boolean,
    message: string | Error | null = null,
    error_code: string | null = null,
    result: any = null
  ): void {
    const responseData = this.cleanJSON({
      status_code,
      ok,
      error_code,
      message: message instanceof Error ? message.message : message,

      result,
    });

    res.status(status_code).json(responseData);
  }

  static cleanJSON<T extends Record<string, any>>(data: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== undefined && value !== null
      )
    ) as Partial<T>;
  }

  static generateID = (length: number): string => {
    const characters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const panjangKarakter = characters.length;
    let result = "";

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * panjangKarakter));
    }

    return result;
  };

  static getFileSizeFromBase64(base64String: string): number {
    const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    let base64 = base64String;
    if (matches && matches.length === 3) {
      base64 = matches[2];
    }

    const sizeInBytes =
      (base64.length * 3) / 4 -
      (base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0);
    return sizeInBytes;
  }
}
