import Redis from "ioredis";

export class RedisCache {
  private static client: Redis;

  static main() {
    if (!this.client) {
      this.client = new Redis({
        host: process.env.REDIS_ENDPOINT,
        port: Number(process.env.REDIS_PORT),
        username: process.env.REDIS_USN,
        password: process.env.REDIS_PWD,
      });

      this.client.on("connect", () => console.log("Redis Connected!"));
      this.client.on("error", (err) => console.error("Redis Error:", err));
    }
    return this.client;
  }
}
