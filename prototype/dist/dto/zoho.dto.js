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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponseDto = exports.CreateInvoiceDto = exports.CreateProjectDto = exports.CreateCrmLeadDto = exports.ZohoWebhookPayloadDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const zoho_types_1 = require("../types/zoho.types");
class ZohoWebhookPayloadDto {
    module;
    event_type;
    timestamp;
    organization_id;
    webhook_id;
    data;
}
exports.ZohoWebhookPayloadDto = ZohoWebhookPayloadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: zoho_types_1.ZohoModule, example: zoho_types_1.ZohoModule.CRM }),
    (0, class_validator_1.IsEnum)(zoho_types_1.ZohoModule),
    __metadata("design:type", String)
], ZohoWebhookPayloadDto.prototype, "module", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: zoho_types_1.ZohoEventType, example: zoho_types_1.ZohoEventType.LEAD_CREATED }),
    (0, class_validator_1.IsEnum)(zoho_types_1.ZohoEventType),
    __metadata("design:type", String)
], ZohoWebhookPayloadDto.prototype, "event_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T10:30:00Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ZohoWebhookPayloadDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '60009690813' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    __metadata("design:type", String)
], ZohoWebhookPayloadDto.prototype, "organization_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'wh_123456789' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], ZohoWebhookPayloadDto.prototype, "webhook_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'object' }),
    __metadata("design:type", Object)
], ZohoWebhookPayloadDto.prototype, "data", void 0);
class CreateCrmLeadDto {
    first_name;
    last_name;
    email;
    phone;
    company;
    lead_source;
    lead_status;
    annual_revenue;
    industry;
    description;
}
exports.CreateCrmLeadDto = CreateCrmLeadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "first_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Doe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "last_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'john.doe@example.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+1-555-123-4567' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Acme Corporation' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "company", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Website Contact Form' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "lead_source", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: zoho_types_1.CrmLeadStatus, example: zoho_types_1.CrmLeadStatus.NEW }),
    (0, class_validator_1.IsEnum)(zoho_types_1.CrmLeadStatus),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "lead_status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1000000, minimum: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCrmLeadDto.prototype, "annual_revenue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Technology' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "industry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Interested in MSP services' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 1000),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "description", void 0);
class CreateProjectDto {
    name;
    description;
    status;
    owner_id;
    client_id;
    start_date;
    end_date;
    budget;
    completion_percentage;
}
exports.CreateProjectDto = CreateProjectDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MSP Infrastructure Upgrade' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Complete infrastructure modernization' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 1000),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: zoho_types_1.ProjectStatus, example: zoho_types_1.ProjectStatus.IN_PROGRESS }),
    (0, class_validator_1.IsEnum)(zoho_types_1.ProjectStatus),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '12345678-1234-5678-9abc-123456789012' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "owner_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '87654321-4321-8765-dcba-210987654321' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "client_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T09:00:00Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "start_date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2024-03-15T17:00:00Z' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "end_date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 50000, minimum: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateProjectDto.prototype, "budget", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 35, minimum: 0, maximum: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateProjectDto.prototype, "completion_percentage", void 0);
class CreateInvoiceDto {
    invoice_number;
    customer_id;
    project_id;
    status;
    date;
    due_date;
    currency_code;
    line_items;
}
exports.CreateInvoiceDto = CreateInvoiceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'INV-2024-001' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "invoice_number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '12345678-1234-5678-9abc-123456789012' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "customer_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '87654321-4321-8765-dcba-210987654321' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "project_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: zoho_types_1.InvoiceStatus, example: zoho_types_1.InvoiceStatus.SENT }),
    (0, class_validator_1.IsEnum)(zoho_types_1.InvoiceStatus),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-02-15' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "due_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 3),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "currency_code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Object] }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateInvoiceDto.prototype, "line_items", void 0);
class ApiResponseDto {
    success;
    data;
    error;
    metadata;
}
exports.ApiResponseDto = ApiResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ApiResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], ApiResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], ApiResponseDto.prototype, "error", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], ApiResponseDto.prototype, "metadata", void 0);
