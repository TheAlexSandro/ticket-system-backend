import { AlumniSheet } from "./AlumniSheet";
import { RedisCache } from "../database/Redis";

type AlumniData = {
  nama: string;
  umur: string;
  phone: string;
  alamat: string;
  lulus_tahun: string;
  bukti: string;
};

type Callback<T> = (error: string | null, result: T) => void;

export class Alumni {
  private sheet: AlumniSheet;

  constructor() {
    this.sheet = new AlumniSheet();
  }

  public init(callback: Callback<string | null | AlumniData[]>) {
    return this.sheet.spreadsheet((error, result: AlumniData[] | null) => {
      if (error) return callback(error, null);
      RedisCache.main().set(
        String(process.env["REDIS_ALUMNI_IDENTIFIER"]),
        JSON.stringify(result),
        "EX",
        Number(process.env["REDIS_CACHE_TIMEOUT"])
      );
      return callback(null, result as AlumniData[]);
    });
  }
}
