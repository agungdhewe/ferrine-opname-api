import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`,
    password: process.env.REDIS_PASSWORD || undefined
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

try {
    await redisClient.connect();
    console.log('Connected to Redis');
} catch (error) {
    console.error('Could not connect to Redis', error);
}

export default redisClient;
