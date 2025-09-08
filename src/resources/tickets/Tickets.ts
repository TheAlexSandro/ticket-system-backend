import { GoogleSheet } from "./GoogleSheet";
import { LRUCache } from "lru-cache";
import { RedisCache } from "../database/Redis";

type Ticket = {
  id: string;
  tipe: "internal" | "eksternal";
  nama: string;
  kelas?: string | null;
  absen?: string | null;
  nomor_hp?: string | null;
};
type IdentifierMethod = "id" | "name";

type Callback<T> = (error: string | null, result: T) => void;

export class Tickets {
  private sheet: GoogleSheet;

  constructor() {
    this.sheet = new GoogleSheet();
  }

  private init(callback: Callback<string | null | Ticket[]>) {
    return this.sheet.spreadsheet((error, result: Ticket[] | null) => {
      if (error) return callback(error, null);
      RedisCache.main().set(
        "tickets",
        JSON.stringify(result),
        "EX",
        Number(process.env["REDIS_CACHE_TIMEOUT"])
      );
      RedisCache.main().set(
        "total_ticket_temp",
        result!.length,
        "EX",
        Number(process.env["REDIS_CACHE_TIMEOUT"])
      );
      RedisCache.main()
        .get("total_ticket_temp")
        .then((r) => {
          RedisCache.main().set("total_ticket", String(r));
        });
      return callback(null, result as Ticket[]);
    });
  }

  public get(
    using: IdentifierMethod,
    identifier: string | null,
    callback: Callback<boolean | null | Ticket[]>
  ) {
    if (!identifier) return;
    RedisCache.main()
      .get("tickets")
      .then((getTickets) => {
        if (getTickets) {
          const tickets = JSON.parse(getTickets);
          let found: Ticket[];
          if (using == "name") {
            found = tickets.filter((ticket: Ticket) =>
              ticket.nama
                .toLowerCase()
                .includes(String(identifier).toLowerCase())
            );
          } else {
            found = tickets.filter(
              (ticket: Ticket) => ticket.id.toLowerCase() == identifier
            );
          }

          if (found.length == 0) return callback(null, false);
          return callback(null, found as Ticket[]);
        } else {
          this.init((error, result) => {
            if (error) return callback(error, null);
            let found: Ticket[];
            if (using == "name") {
              found = (result as Ticket[]).filter((ticket: Ticket) =>
                ticket.nama
                  .toLowerCase()
                  .includes(String(identifier).toLowerCase())
              );
            } else {
              found = (result as Ticket[]).filter(
                (ticket: Ticket) => ticket.id.toLowerCase() == identifier
              );
            }
            if (found.length == 0) return callback(null, false);
            return callback(null, found);
          });
        }
      });
  }
}
