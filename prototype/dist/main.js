"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
const correlation_interceptor_1 = require("./common/interceptors/correlation.interceptor");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule, {
            cors: {
                origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
                credentials: true,
            },
        });
        const configService = app.get(config_1.ConfigService);
        const port = configService.get('PORT', 3000);
        const environment = configService.get('NODE_ENV', 'development');
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            disableErrorMessages: environment === 'production',
        }));
        app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
        app.useGlobalInterceptors(new correlation_interceptor_1.CorrelationInterceptor(), new logging_interceptor_1.LoggingInterceptor());
        if (environment !== 'production') {
            const swaggerConfig = new swagger_1.DocumentBuilder()
                .setTitle('DFAP Integration API')
                .setDescription('NestJS integration layer for Zoho One modules')
                .setVersion('1.0.0')
                .addTag('Zoho Integration', 'Zoho One module integration endpoints')
                .addTag('Health', 'Application health check')
                .addServer(`http://localhost:${port}`, 'Development')
                .build();
            const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
            swagger_1.SwaggerModule.setup('api/docs', app, document);
            logger.log(`API Documentation available at http://localhost:${port}/api/docs`);
        }
        app.enableShutdownHooks();
        await app.listen(port);
        logger.log(`Server started on http://localhost:${port}`);
        logger.log(`Environment: ${environment}`);
    }
    catch (error) {
        logger.error('Failed to start application', error);
        process.exit(1);
    }
}
process.on('uncaughtException', (error) => {
    const logger = new common_1.Logger('UncaughtException');
    logger.error('Uncaught Exception occurred', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    const logger = new common_1.Logger('UnhandledRejection');
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
bootstrap();
