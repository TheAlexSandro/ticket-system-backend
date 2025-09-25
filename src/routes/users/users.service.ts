import { Injectable, HttpStatus, Res, Req } from "@nestjs/common";
import { Helper } from "../../resources/helper/Helper";
import { Response } from "express";
import errors from "src/resources/errors/errors";
import { Tickets } from "src/resources/tickets/Tickets";
import { RedisCache } from "src/resources/database/Redis";
import { Database } from "src/resources/database/Database";
import { CDN } from "src/resources/alumni/CDN";
import { AlumniSheet } from "src/resources/alumni/AlumniSheet";
import { Alumni } from "src/resources/alumni/Alumni";

type IdentifierMethod = "id" | "name";

@Injectable()
export class UsersService {
  private ticket: Tickets;
  private alumniSheet: AlumniSheet;
  private alumnis: Alumni;

  constructor() {
    this.ticket = new Tickets();
    this.alumniSheet = new AlumniSheet();
    this.alumnis = new Alumni();
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
            this.ticket.addPengunjung(result[0]);

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

  register(
    @Res() res: Response,
    nama: string | null,
    umur: string | null,
    phone: string | null,
    lulus_tahun: string | null,
    alamat: string | null,
    bukti: string | null
  ) {
    if (!nama || !umur || !phone || !lulus_tahun || !alamat || !bukti)
      return Helper.response(
        res,
        HttpStatus.OK,
        false,
        errors["404"]["EMPTY_PARAMETER"].message.replace(
          "{param}",
          "nama, umur, phone, lulus_tahun, alamat, bukti"
        ),
        errors["404"]["EMPTY_PARAMETER"].code
      );
    if (
      Helper.getFileSizeFromBase64(bukti) > Number(process.env["MAX_FILE_SIZE"])
    )
      return Helper.response(
        res,
        HttpStatus.PAYLOAD_TOO_LARGE,
        false,
        errors["413"]["FILE_TOO_LARGE"].message,
        errors["413"]["FILE_TOO_LARGE"].code
      );

    const ident = nama.toLowerCase();
    RedisCache.main()
      .get(ident.replace(/\s+/g, ""))
      .then((r) => {
        if (r) {
          const rst = JSON.parse(r);
          return Helper.response(
            res,
            HttpStatus.OK,
            false,
            errors["400"]["USER_FOUND"].message,
            errors["400"]["USER_FOUND"].code,
            rst
          );
        }

        CDN.upload(
          bukti,
          (e, link: string) => {
            if (e)
              return Helper.response(
                res,
                HttpStatus.OK,
                false,
                e,
                errors["400"]["UNKNOWN_ERROR"].code
              );

            this.alumniSheet.addRow(
              {
                nama: nama.toUpperCase(),
                umur,
                phone: `+62${phone}`,
                alamat,
                lulus_tahun,
                bukti: link,
              },
              (e, r) => {
                RedisCache.main().set(
                  ident.replace(/\s+/g, ""),
                  JSON.stringify(r)
                );
                const teks = `NAMA LENGKAP: ${nama.toUpperCase()}\nUMUR: ${umur}\nNO HP: +62${phone}\nALAMAT: ${alamat}\nLULUSAN TAHUN: ${lulus_tahun}.`;

                return Helper.response(
                  res,
                  HttpStatus.OK,
                  true,
                  "Success!",
                  null,
                  {
                    url: `${process.env["API_WA"]}${process.env["NO_WA"]}&text=${encodeURIComponent(teks)}&type=phone_number&app_absent=0`,
                  }
                );
              }
            );
          }
        );
      })
      .catch((err) => {
        console.log(err);
        return Helper.response(
          res,
          HttpStatus.OK,
          false,
          err,
          errors["400"]["UNKNOWN_ERROR"].code
        );
      });
  }

  getAlumni(@Res() res: Response, @Req() req: Request) {
    RedisCache.main()
      .get(String(process.env["REDIS_ALUMNI_IDENTIFIER"]))
      .then((alumniData) => {
        if (alumniData) {
          const rst = JSON.parse(alumniData);
          return Helper.response(
            res,
            HttpStatus.OK,
            true,
            "Success!",
            null,
            rst
          );
        }

        this.alumnis.init((er, result) => {
          if (er)
            return Helper.response(
              res,
              HttpStatus.OK,
              false,
              er,
              errors["400"]["UNKNOWN_ERROR"].code
            );

          return Helper.response(
            res,
            HttpStatus.OK,
            true,
            "Success!",
            null,
            result
          );
        });
      });
  }
}
