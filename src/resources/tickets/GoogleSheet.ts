import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

type RowData = {
  id: string;
  tipe: "internal" | "eksternal";
  nama: string;
  kelas?: string | null;
  absen?: string | null;
  nomor_hp?: string | null;
};

type Callback<T> = (error: string | null, result: T | null) => void;

export class GoogleSheet {
  private doc: GoogleSpreadsheet;

  constructor() {
    const auth = new JWT({
      email: process.env["CLIENT_EMAIL"],
      key: process.env["PRIVATE_KEY"],
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    this.doc = new GoogleSpreadsheet(process.env["TICKET_SPREADSHEET"]!, auth);
  }

  public spreadsheet(callback: Callback<RowData[]>) {
    return this.doc
      .loadInfo()
      .then(() => {
        const sheet = this.doc.sheetsByIndex[0];
        return sheet.getRows();
      })
      .then((rows: any[]) => {
        const mapping: RowData[] = rows.map((row) => ({
          id: row._rawData[0],
          tipe: row._rawData[1] as "internal" | "eksternal",
          nama: row._rawData[2],
          kelas:
            row._rawData[3] && row._rawData[3] !== "-" ? row._rawData[3] : null,
          absen:
            row._rawData[4] && row._rawData[4] !== "-" ? row._rawData[4] : null,
          nomor_hp:
            row._rawData[5] && row._rawData[5] !== "-" ? row._rawData[5] : null,
        }));

        return callback(null, mapping);
      })
      .catch((err: any) => {
        return callback(err.message, null);
      });
  }
}
