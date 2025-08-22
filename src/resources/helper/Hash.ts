import crypto from "crypto";
import { Helper } from "./Helper";

export class Hash {
  static hashToken(token: string, salt: string = ""): string {
    return crypto
      .createHash("sha256")
      .update(token + salt)
      .digest("hex");
  }

  static generateToken(customSalt?: string): object {
    const P_token = Helper.generateID(100);
    const salt = customSalt ?? crypto.randomBytes(16).toString("hex");
    const hashed = this.hashToken(P_token, salt);

    return { P_token, salt, hashed };
  }

  static verifyToken(P_token: string, salt: string, hashed: string): boolean {
    const check = this.hashToken(P_token, salt);
    return check === hashed;
  }
}
