import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

type AlumniData = {
  nama: string;
  umur: string;
  phone: string;
  alamat: string;
  lulus_tahun: string;
  bukti: string;
};

type Callback<T> = (error: string | null, result: T | null) => void;

export class AlumniSheet {
  private doc: GoogleSpreadsheet;

  constructor() {
    const auth = new JWT({
      email: process.env["CLIENT_EMAIL"],
      key: process.env["PRIVATE_KEY"],
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    this.doc = new GoogleSpreadsheet(process.env["ALUMNI_SPREADSHEET"]!, auth);
  }

  public spreadsheet(callback: Callback<AlumniData[]>) {
    return this.doc
      .loadInfo()
      .then(() => {
        const sheet = this.doc.sheetsByIndex[0];
        return sheet.getRows();
      })
      .then((rows: any[]) => {
        const mapping: AlumniData[] = rows.map((row) => ({
          nama: row._rawData[0],
          umur: row._rawData[1],
          phone: row._rawData[2],
          alamat: row._rawData[3],
          lulus_tahun: row._rawData[4],
          bukti: row._rawData[5]
        }));

        return callback(null, mapping);
      })
      .catch((err: any) => {
        return callback(err.message, null);
      });
  }

  public addRow(data: AlumniData, callback?: Callback<AlumniData>) {
    return this.doc
      .loadInfo()
      .then(() => {
        const sheet = this.doc.sheetsByIndex[0];
        return sheet.addRow({
          NAMA: data.nama,
          UMUR: data.umur,
          PHONE: data.phone,
          LULUS_TAHUN: data.lulus_tahun,
          ALAMAT: data.alamat,
          BUKTI: data.bukti
        });
      })
      .then((newRow: any) => {
        const added: AlumniData = {
          nama: newRow._rawData[0],
          umur: newRow._rawData[1],
          phone: newRow._rawData[2],
          alamat: newRow._rawData[3],
          lulus_tahun: newRow._rawData[4],
          bukti: newRow._rawData[5]
        };
        return callback?.(null, added);
      })
      .catch((err: any) => {
        return callback?.(err.message, null);
      });
  }
}
