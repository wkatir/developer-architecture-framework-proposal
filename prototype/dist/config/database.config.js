"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('database', () => ({
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
