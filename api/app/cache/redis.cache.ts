import * as bluebird from 'bluebird';
import * as redis from 'redis';
import * as env from '../../env';

bluebird.promisifyAll(redis.RedisClient.prototype);
const redisClient = redis.createClient({
  host: env.redis_host,
});

export class RedisCache {
  static async get(cacheKey) {
    return await redisClient.getAsync(cacheKey);
  }

  static async has(cacheKey) {
    return await redisClient.existsAsync(cacheKey);
  }

  static async set(cacheKey, cacheValue, expires?) {
    await redisClient.set(cacheKey, cacheValue);
    if (expires) {
      await redisClient.expire(cacheKey, expires);
    }
  }

  static async forget(cacheKey) {
    await redisClient.delAsync(cacheKey);
  }
}
