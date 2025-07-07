import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      
      if (typeof errorResponse === 'object' && errorResponse !== null) {
        message = (errorResponse as any).message || exception.message;
        error = (errorResponse as any).error || 'HttpException';
      } else {
        message = errorResponse as string;
        error = 'HttpException';
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'InternalServerError';

      // Log unexpected errors
      this.logger.error(
        `Unexpected error: ${exception}`,
        exception instanceof Error ? exception.stack : 'No stack trace'
      );
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

    // Log all exceptions for monitoring
    this.logger.error(
      `HTTP ${status} Error: ${message}`,
      JSON.stringify({
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
      })
    );

    response.status(status).json(errorResponse);
  }
} 