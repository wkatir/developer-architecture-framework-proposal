import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { CorrelationInterceptor } from './common/interceptors/correlation.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true,
      },
    });

    const configService = app.get<ConfigService>(ConfigService);
    const port = configService.get<number>('PORT', 3000);
    const environment = configService.get<string>('NODE_ENV', 'development');

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: environment === 'production',
    }));

    // Global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Global interceptors
    app.useGlobalInterceptors(
      new CorrelationInterceptor(),
      new LoggingInterceptor(),
    );

    // API Documentation
    if (environment !== 'production') {
      const swaggerConfig = new DocumentBuilder()
        .setTitle('DFAP Integration API')
        .setDescription('NestJS integration layer for Zoho One modules')
        .setVersion('1.0.0')
        .addTag('Zoho Integration', 'Zoho One module integration endpoints')
        .addTag('Health', 'Application health check')
        .addServer(`http://localhost:${port}`, 'Development')
        .build();

      const document = SwaggerModule.createDocument(app, swaggerConfig);
      SwaggerModule.setup('api/docs', app, document);

      logger.log(`API Documentation available at http://localhost:${port}/api/docs`);
    }

    // Enable graceful shutdown
    app.enableShutdownHooks();

    // Start the server
    await app.listen(port);
    
    logger.log(`Server started on http://localhost:${port}`);
    logger.log(`Environment: ${environment}`);
    
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  const logger = new Logger('UncaughtException');
  logger.error('Uncaught Exception occurred', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  const logger = new Logger('UnhandledRejection');
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

bootstrap(); 