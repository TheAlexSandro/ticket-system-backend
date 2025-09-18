import { drive_v3, drive } from "@googleapis/drive";
import { OAuth2Client } from "google-auth-library";
import { Readable } from "stream";

type Callback<T> = (error: string | null, result: T | null) => void;

export class GoogleDrive {
  private drive: drive_v3.Drive;

  constructor() {
    const auth = new OAuth2Client(
      process.env["G_CLIENT_ID"],
      process.env["G_CLIENT_SECRET"]
    );
    auth.setCredentials({
      access_token: String(process.env["G_ACCESS_TOKEN"]),
      refresh_token: String(process.env["G_REFRESH_TOKEN"]),
      token_type: String(process.env["G_TOKEN_TYPE"]),
      expiry_date: Number(process.env["G_EXPIRY_DATE"])
    })

    this.drive = drive({ version: "v3", auth });
  }

  upload(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    callback: Callback<boolean | string>
  ) {
    this.drive.files
      .create({
        requestBody: {
          name: fileName,
          parents: [String(process.env["ALUMNI_FOLDER_DRIVE"])],
        },
        media: {
          mimeType,
          body: Readable.from(buffer),
        },
        fields: "id",
      })
      .then((result) => {
        const file_id = result.data.id;
        if (!file_id) {
          callback(null, false);
          return null;
        }

        this.drive.permissions
          .create({
            fileId: file_id,
            requestBody: {
              role: "reader",
              type: "anyone",
            },
          })
          .then(() => {
            return callback(null, `${process.env["PUBLIC_URL"]}${file_id}`);
          })
          .catch((err) => {
            console.log(err);
            return callback(err.message, null);
          });
      })
      .catch((err) => {
        console.log(err);
        return callback(err.message, null);
      });
  }
}
