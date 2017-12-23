let cache = {};

module.exports = class ArrayCache {
  static async get(cacheKey) {
    return cache[cacheKey];
  }

  static async has(cacheKey) {
    return cache[cacheKey] !== undefined && cache[cacheKey] !== '';
  }

  static async set(cacheKey, cacheValue) {
    cache[cacheKey] = cacheValue;
  }

  static async clear() {
    cache = {};
  }

  static async forget(cacheKey) {
    delete cache[cacheKey];
  }
};
