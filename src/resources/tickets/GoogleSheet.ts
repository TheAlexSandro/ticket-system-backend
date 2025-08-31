import { google } from "googleapis";
import { sheets_v4 } from "googleapis";

type Callback<T> = (error: string | null, result: T) => void;

export class GoogleSheet {
  private sheet: sheets_v4.Sheets;

  constructor() {
    const auth = new google.auth.JWT({
      email: process.env["CLIENT_EMAIL"],
      key: process.env["PRIVATE_KEY"],
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets.readonly",
        "https://www.googleapis.com/auth/drive.readonly",
      ],
    });
    this.sheet = google.sheets({ version: "v4", auth });
  }

  public async spreadsheet(callback: Callback<object | null>) {
    return this.sheet.spreadsheets.values
      .get({
        spreadsheetId: process.env["SPREADSHEET"],
        range: process.env["RANGE"],
      })
      .then((result) => {
        const rows = result.data.values || [];
        const mapping = rows.map((row) => ({
          id: row[0],
          type: row[1] as "internal" | "eksternal",
          name: row[2],
          class: row[3] && row[3] !== "-" ? row[3] : null,
          absent: row[4] && row[4] !== "-" ? row[4] : null,
          nomor_hp: row[5] && row[5] !== "-" ? row[5] : null,
        }));

        return callback(null, mapping);
      })
      .catch(error => {
        return callback(error.message, null);
      })
  }
}
