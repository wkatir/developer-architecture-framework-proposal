"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ZohoIntegrationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZohoIntegrationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let ZohoIntegrationController = ZohoIntegrationController_1 = class ZohoIntegrationController {
    logger = new common_1.Logger(ZohoIntegrationController_1.name);
    async processWebhook(module, payload) {
        this.logger.log(`Processing webhook for module: ${module}`);
        this.logger.log(`Event type: ${payload.event_type}`);
        return {
            success: true,
            message: 'Webhook processed successfully',
            module,
            event_type: payload.event_type,
            processed_at: new Date().toISOString(),
        };
    }
    async getProjects(limit = '10') {
        this.logger.log(`Getting projects with limit: ${limit}`);
        return {
            success: true,
            data: [],
            pagination: {
                page: 1,
                limit: parseInt(limit),
                total: 0,
            },
        };
    }
    async getProject(id) {
        this.logger.log(`Getting project: ${id}`);
        return {
            success: true,
            data: {
                id,
                name: 'Sample Project',
                status: 'active',
                created_at: new Date().toISOString(),
            },
        };
    }
    async createProject(createProjectDto) {
        this.logger.log(`Creating project: ${createProjectDto.name}`);
        const newProject = {
            id: Math.random().toString(36).substr(2, 9),
            ...createProjectDto,
            status: 'active',
            created_at: new Date().toISOString(),
        };
        return {
            success: true,
            data: newProject,
            message: 'Project created successfully',
        };
    }
    async getHealth() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }
};
exports.ZohoIntegrationController = ZohoIntegrationController;
__decorate([
    (0, common_1.Post)('webhook/:module'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Process Zoho webhook events',
        description: 'Receives and processes webhook events from Zoho modules',
    }),
    (0, swagger_1.ApiParam)({
        name: 'module',
        description: 'Zoho module that triggered the webhook',
        example: 'crm',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook processed successfully',
    }),
    __param(0, (0, common_1.Param)('module')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ZohoIntegrationController.prototype, "processWebhook", null);
__decorate([
    (0, common_1.Get)('projects'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get projects list',
        description: 'Retrieve a list of projects',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Projects retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ZohoIntegrationController.prototype, "getProjects", null);
__decorate([
    (0, common_1.Get)('projects/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get project by ID',
        description: 'Retrieve a specific project by its ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Project ID',
        example: '123',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZohoIntegrationController.prototype, "getProject", null);
__decorate([
    (0, common_1.Post)('projects'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create new project',
        description: 'Create a new project in the system',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ZohoIntegrationController.prototype, "createProject", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({
        summary: 'Health check',
        description: 'Check the health status of the API',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ZohoIntegrationController.prototype, "getHealth", null);
exports.ZohoIntegrationController = ZohoIntegrationController = ZohoIntegrationController_1 = __decorate([
    (0, swagger_1.ApiTags)('Zoho Integration'),
    (0, common_1.Controller)('api/v1/zoho')
], ZohoIntegrationController);
