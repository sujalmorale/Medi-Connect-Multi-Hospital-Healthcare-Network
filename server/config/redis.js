import { createClient } from 'redis';

const memoryCache = new Map();
let isRedisConnected = false;
let redisClient = null;

export const initRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
      socket: { connectTimeout: 2000, reconnectStrategy: false }
    });

    redisClient.on('error', (err) => {
      if (isRedisConnected) {
        console.warn(`[Redis Warning] Redis error: ${err.message}`);
        isRedisConnected = false;
      }
    });

    await redisClient.connect();
    isRedisConnected = true;
    console.log('[Redis] Connected successfully to Redis Server.');
  } catch (err) {
    isRedisConnected = false;
    console.warn(`[Redis Warning] Could not connect to Redis (${err.message}). Using high-performance in-memory cache fallback.`);
  }
};

export const getCache = async (key) => {
  if (isRedisConnected && redisClient) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn(`[Redis Get Error] ${e.message}`);
    }
  }
  const item = memoryCache.get(key);
  if (!item) return null;
  if (item.expiry && item.expiry < Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  return item.value;
};

export const setCache = async (key, value, ttlSeconds = 300) => {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`[Redis Set Error] ${e.message}`);
    }
  }
  memoryCache.set(key, {
    value,
    expiry: Date.now() + ttlSeconds * 1000
  });
  return true;
};

export const delCache = async (key) => {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.del(key);
    } catch (e) {
      console.warn(`[Redis Del Error] ${e.message}`);
    }
  }
  memoryCache.delete(key);
};

export const lockSlot = async (doctorId, slot, patientId, ttlSeconds = 60) => {
  const lockKey = `lock:slot:${doctorId}:${slot}`;
  if (isRedisConnected && redisClient) {
    try {
      const acquired = await redisClient.set(lockKey, patientId, {
        NX: true,
        EX: ttlSeconds
      });
      return acquired === 'OK';
    } catch (e) {
      console.warn(`[Redis Lock Error] ${e.message}`);
    }
  }
  // Memory fallback lock
  const existing = memoryCache.get(lockKey);
  if (existing && existing.expiry > Date.now()) {
    return false; // Already locked
  }
  memoryCache.set(lockKey, {
    value: patientId,
    expiry: Date.now() + ttlSeconds * 1000
  });
  return true;
};

export const unlockSlot = async (doctorId, slot) => {
  const lockKey = `lock:slot:${doctorId}:${slot}`;
  await delCache(lockKey);
};
