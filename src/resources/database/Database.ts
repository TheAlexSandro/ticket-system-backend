import mongoose, { Schema, Model, InferSchemaType } from "mongoose";

const uri = process.env["MONGODB_URI"] as string;
mongoose.connect(uri, {
  dbName: "pbl",
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const userSchema = new Schema({
  username: { type: String, default: "-", index: true },
  salt: { type: String, default: "-" },
  password: { type: String, default: "-" },
});

const adminDashboard = new Schema({
  id: { type: String, default: "admin", index: true },
  camera_permissions: { type: String, default: "admin", index: true },
  camera_status: { type: String, default: "on", index: true },
  scanning_method: { type: String, default: "id", index: true },
});

const adminSession = new Schema({
  token: { type: String, index: true },
});

const refreshToken = new Schema({
  token: { type: String, index: true },
  hash: { type: String, index: true },
  salt: { type: String, index: true },
  createdAt: { type: Date, default: Date.now, expires: Math.floor(Number(process.env["MAX_CACHE"]) / 1000) },
});

type UserSchema = InferSchemaType<typeof userSchema>;
type AdminDashSchema = InferSchemaType<typeof adminDashboard>;
type AdminSesion = InferSchemaType<typeof adminSession>;
type RefreshToken = InferSchemaType<typeof refreshToken>;

type Collection =
  | "user"
  | "admin_dashboard"
  | "admin_session"
  | "refresh_token"
  | "hash_token";
type Callback<T> = (error: Error | null | string, result: T | null) => void;

const userDB: Model<UserSchema> = mongoose.model<UserSchema>(
  "user",
  userSchema
);
const adminDB: Model<AdminDashSchema> = mongoose.model<AdminDashSchema>(
  "admin_dashboard",
  adminDashboard
);
const sessionDB: Model<AdminSesion> = mongoose.model<AdminSesion>(
  "admin_session",
  adminSession
);
const refreshTDB: Model<RefreshToken> = mongoose.model<RefreshToken>(
  "refresh_token",
  refreshToken
);

const getModel = (collection: Collection): Model<any> => {
  switch (collection) {
    case "user":
      return userDB;
    case "admin_dashboard":
      return adminDB;
    case "admin_session":
      return sessionDB;
    case "refresh_token":
      return refreshTDB;
    default:
      return userDB;
  }
};

type addDB = {
  password?: string | null;
  salt?: string | null;
  hash_salt?: string | null;
  hash?: string | null;
};

export class Database {
  static add(
    collection: Collection,
    identifier: string,
    field_identifier: string,
    options?: addDB,
    callback?: Callback<boolean | string>
  ): void {
    const {
      password = null,
      salt = null,
      hash_salt = null,
      hash = null,
    } = options ?? {};

    let filter: any;
    if (collection == "user") {
      if (password) {
        filter = { id: String(identifier), password, salt };
      } else {
        filter = { id: String(identifier) };
      }
    } else if (collection == "admin_session") {
      filter = { token: String(identifier) };
    } else if (collection == "refresh_token") {
      filter = { token: String(identifier), salt: hash_salt, hash };
    }

    this.get(collection, field_identifier, identifier, (error, result) => {
      if (error) return callback?.(error, null);
      if (result) return;

      const data =
        collection == "user"
          ? new userDB(filter)
          : collection == "admin_dashboard"
            ? new adminDB(filter)
            : collection == "admin_session"
              ? new sessionDB(filter)
              : collection == "refresh_token"
                ? new refreshTDB(filter)
                : null;
      if (!data) return;

      data
        .save()
        .then((result) => {
          return callback?.(null, true);
        })
        .catch((err) => {
          return callback?.(err.message, null);
        });
    });
  }

  static get(
    collection: Collection,
    field_identifier: string,
    identifier: string,
    callback: Callback<boolean | string | object>
  ): void {
    const model = getModel(collection);

    model
      .findOne({ [field_identifier]: String(identifier) }, { _id: 0 })
      .then((result) => {
        if (!result) return callback(null, false);
        return callback(null, result);
      })
      .catch((err) => {
        return callback(err, null);
      });
  }

  static edit(
    collection: Collection,
    field_identifier: string,
    identifier: string | number,
    field: string,
    new_value: any,
    callback?: Callback<boolean | string | object>
  ): void {
    const model = getModel(collection);

    model
      .findOne({ [field_identifier]: String(identifier) })
      .then((result: any) => {
        if (!result) return callback?.(null, false);
        if (typeof result[field] === "undefined")
          return callback?.(null, false);

        result[field] = new_value;

        result.save().then(() => {
          const r = result.toObject();
          delete r._id;
          callback?.(null, true);
        });
      })
      .catch((err: Error) => callback?.(err.message, null));
  }

  static remove(
    collection: Collection,
    field_identifier: string,
    identifier: string,
    callback?: Callback<boolean | string>
  ): void {
    const model = getModel(collection);

    model
      .deleteOne({ [field_identifier]: identifier })
      .then(() => callback?.(null, true))
      .catch((err: Error) => callback?.(err.message, null));
  }

  static drop(collection: Collection, callback?: Callback<boolean | string>) {
    const model = getModel(collection);
    model
      .deleteMany({})
      .then(() => callback?.(null, true))
      .catch((err: Error) => callback?.(err.message, null));
  }
}
