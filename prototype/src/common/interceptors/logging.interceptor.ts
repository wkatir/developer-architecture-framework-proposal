import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params } = request;
    const correlationId = request.correlationId || 'unknown';
    const startTime = Date.now();

    // Log incoming request
    this.logger.log(
      `🔍 [${correlationId}] ${method} ${url}`,
      JSON.stringify({
        method,
        url,
        body: this.sanitizeBody(body),
        query,
        params,
        userAgent: request.headers['user-agent'],
        ip: request.ip || request.headers['x-forwarded-for'],
      })
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const executionTime = Date.now() - startTime;
          this.logger.log(
            `✅ [${correlationId}] ${method} ${url} - ${executionTime}ms`,
            {
              executionTime,
              responseSize: JSON.stringify(data).length,
            }
          );
        },
        error: (error) => {
          const executionTime = Date.now() - startTime;
          this.logger.error(
            `❌ [${correlationId}] ${method} ${url} - ${executionTime}ms`,
            {
              error: error.message,
              stack: error.stack,
              executionTime,
            }
          );
        },
      })
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    const sanitized = { ...body };

    Object.keys(sanitized).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }
} 