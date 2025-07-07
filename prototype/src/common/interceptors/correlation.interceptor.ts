import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Generate or extract correlation ID
    let correlationId = request.headers['x-correlation-id'];
    
    if (!correlationId) {
      correlationId = uuidv4();
    }

    // Set correlation ID in request for later use
    request.correlationId = correlationId;

    // Add correlation ID to response headers
    response.setHeader('x-correlation-id', correlationId);

    return next.handle();
  }
} 