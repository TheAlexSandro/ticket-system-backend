import { GoogleSheet } from "./GoogleSheet";
import { LRUCache } from "lru-cache";

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
  private cache: LRUCache<string, Ticket[]>;

  constructor() {
    this.sheet = new GoogleSheet();
    this.cache = new LRUCache<string, Ticket[]>({
      max: Number(process.env["MAX_CACHE"]),
      ttl: 1000 * 20,
    });
  }

  private init(callback: Callback<string | null | Ticket[]>) {
    return this.sheet.spreadsheet((error, result: Ticket[] | null) => {
      if (error) return callback(error, null);
      this.cache.set("tickets", result as Ticket[]);
      return callback(null, result as Ticket[]);
    });
  }

  public get(
    using: IdentifierMethod,
    identifier: string | null,
    callback: Callback<boolean | null | Ticket[]>
  ) {
    if (!identifier) return;
    const getTickets = this.cache.get("tickets");
    if (getTickets) {
      if (using == "name") {
        var found = (getTickets as Ticket[]).filter((ticket) =>
          ticket.nama
            .toLocaleLowerCase()
            .includes(String(identifier).toLocaleLowerCase())
        );
      } else {
        var found = (getTickets as Ticket[]).filter(
          (ticket) => ticket.id == identifier
        );
      }

      if (found.length == 0) return callback(null, false);
      return callback(null, found as Ticket[]);
    } else {
      this.init((error, result) => {
        if (error) return callback(error, null);
        if (using == "name") {
          var found = (result as Ticket[]).filter((ticket) =>
            ticket.nama
              .toLocaleLowerCase()
              .includes(String(identifier).toLocaleLowerCase())
          );
        } else {
          var found = (result as Ticket[]).filter(
            (ticket) => ticket.id == identifier
          );
        }
        if (found.length == 0) return callback(null, false);
        return callback(null, found as Ticket[]);
      });
    }
  }
}
