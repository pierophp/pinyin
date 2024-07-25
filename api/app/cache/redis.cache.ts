import * as bluebird from 'bluebird';
import * as redis from 'redis';

bluebird.promisifyAll(redis.RedisClient.prototype);
const redisClient = redis.createClient({
  host: process.env['REDIS_HOST'],
  port: process.env['REDIS_PORT'] ?? 6379,
  password: process.env['REDIS_PASS'],
});

export class RedisCache {
  static async get(cacheKey) {
    return await redisClient.getAsync(cacheKey);
  }

  static async has(cacheKey) {
    return await redisClient.existsAsync(cacheKey);
  }

  static async set(cacheKey, cacheValue, expires?) {
    await redisClient.setAsync(cacheKey, cacheValue);
    if (expires) {
      await redisClient.expireAsync(cacheKey, expires);
    }
  }

  static async forget(cacheKey) {
    await redisClient.delAsync(cacheKey);
  }
}
