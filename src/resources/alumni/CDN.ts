import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Helper } from "../helper/Helper";

const s3 = new S3Client({
  region: "auto",
  endpoint: String(process.env["R2_ENDPOINT"]),
  credentials: {
    accessKeyId: String(process.env["R2_ACCESS_KEY_ID"]),
    secretAccessKey: String(process.env["R2_SECRET_KEY"]),
  },
});

type Callback<T> = (error: string | null, result: T) => void;

export class CDN {
  static upload(base64: string, callback: Callback<string | null>) {
    const base64Data = base64.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");
    const imageID = Helper.generateID(50);

    const command = new PutObjectCommand({
      Bucket: "cdn",
      Key: `image/${imageID}`,
      Body: buffer,
      ContentType: "image/png",
    });

    s3.send(command)
      .then(() => {
        return callback(
          null,
          `${process.env["R2_PUBLIC_ENDPOINT"]}/image/${imageID}`
        );
      })
      .catch((err) => {
        return callback(err.message, null);
      });
  }
}
