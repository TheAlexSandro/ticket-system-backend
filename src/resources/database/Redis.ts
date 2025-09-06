import Redis from "ioredis";

export class RedisCache {
  static main() {
    const redis = new Redis({
      host: process.env["REDIS_ENDPOINT"],
      port: Number(process.env["REDIS_PORT"]),
      username: process.env["REDIS_USN"],
      password: process.env["REDIS_PWD"]
    });

    redis.on("connection", () => console.log("Redis Connected!"));
    redis.on("error", (err) => console.error(err));

    return redis;
  }
}
