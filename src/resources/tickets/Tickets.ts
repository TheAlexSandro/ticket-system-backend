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
      RedisCache.main().set("tickets", JSON.stringify(result), "EX", 60);
      return callback(null, result as Ticket[]);
    });
  }

  public get(
    using: IdentifierMethod,
    identifier: string | null,
    callback: Callback<boolean | null | Ticket[]>,
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
                .toLocaleLowerCase()
                .includes(String(identifier).toLocaleLowerCase()),
            );
          } else {
            found = tickets.filter((ticket: Ticket) => ticket.id == identifier);
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
                  .toLocaleLowerCase()
                  .includes(String(identifier).toLocaleLowerCase()),
              );
            } else {
              found = (result as Ticket[]).filter(
                (ticket: Ticket) => ticket.id == identifier,
              );
            }
            if (found.length == 0) return callback(null, false);
            return callback(null, found);
          });
        }
      });
  }
}
