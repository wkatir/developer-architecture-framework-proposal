import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
  pool: {
    min: number;
    max: number;
    idle_timeout_ms: number;
  };
}

export default registerAs('database', (): DatabaseConfig => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'dfap_db',
  ssl: process.env.DB_SSL === 'true',
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '5', 10),
    max: parseInt(process.env.DB_POOL_MAX || '20', 10),
    idle_timeout_ms: parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MS || '30000', 10),
  },
})); 