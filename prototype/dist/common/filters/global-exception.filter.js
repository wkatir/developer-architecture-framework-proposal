"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status;
        let message;
        let error;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const errorResponse = exception.getResponse();
            if (typeof errorResponse === 'object' && errorResponse !== null) {
                message = errorResponse.message || exception.message;
                error = errorResponse.error || 'HttpException';
            }
            else {
                message = errorResponse;
                error = 'HttpException';
            }
        }
        else {
            status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
            error = 'InternalServerError';
            this.logger.error(`Unexpected error: ${exception}`, exception instanceof Error ? exception.stack : 'No stack trace');
        }
        const errorResponse = {
            error: {
                code: error,
                message,
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method,
                correlation_id: request.headers['x-correlation-id'] || null,
            }
        };
        this.logger.error(`HTTP ${status} Error: ${message}`, JSON.stringify({
            url: request.url,
            method: request.method,
            body: request.body,
            query: request.query,
            params: request.params,
            headers: {
                'user-agent': request.headers['user-agent'],
                'x-forwarded-for': request.headers['x-forwarded-for'],
                'x-correlation-id': request.headers['x-correlation-id'],
            },
        }));
        response.status(status).json(errorResponse);
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
