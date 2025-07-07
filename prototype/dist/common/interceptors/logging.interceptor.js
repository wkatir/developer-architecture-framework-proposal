"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LoggingInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let LoggingInterceptor = LoggingInterceptor_1 = class LoggingInterceptor {
    logger = new common_1.Logger(LoggingInterceptor_1.name);
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, query, params } = request;
        const correlationId = request.correlationId || 'unknown';
        const startTime = Date.now();
        this.logger.log(`🔍 [${correlationId}] ${method} ${url}`, JSON.stringify({
            method,
            url,
            body: this.sanitizeBody(body),
            query,
            params,
            userAgent: request.headers['user-agent'],
            ip: request.ip || request.headers['x-forwarded-for'],
        }));
        return next.handle().pipe((0, operators_1.tap)({
            next: (data) => {
                const executionTime = Date.now() - startTime;
                this.logger.log(`✅ [${correlationId}] ${method} ${url} - ${executionTime}ms`, {
                    executionTime,
                    responseSize: JSON.stringify(data).length,
                });
            },
            error: (error) => {
                const executionTime = Date.now() - startTime;
                this.logger.error(`❌ [${correlationId}] ${method} ${url} - ${executionTime}ms`, {
                    error: error.message,
                    stack: error.stack,
                    executionTime,
                });
            },
        }));
    }
    sanitizeBody(body) {
        if (!body)
            return body;
        const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
        const sanitized = { ...body };
        Object.keys(sanitized).forEach(key => {
            if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
                sanitized[key] = '[REDACTED]';
            }
        });
        return sanitized;
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = LoggingInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
