/**
 * Enterprise-grade DTOs with class-validator decorators
 * Demonstrates strict TypeScript validation patterns for API endpoints
 */

import {
  IsString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsArray,
  Min,
  Max,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ZohoModule,
  ZohoEventType,
  CrmLeadStatus,
  ProjectStatus,
  InvoiceStatus,
} from '../types/zoho.types';

export class ZohoWebhookPayloadDto {
  @ApiProperty({ enum: ZohoModule, example: ZohoModule.CRM })
  @IsEnum(ZohoModule)
  readonly module!: ZohoModule;

  @ApiProperty({ enum: ZohoEventType, example: ZohoEventType.LEAD_CREATED })
  @IsEnum(ZohoEventType)
  readonly event_type!: ZohoEventType;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  @IsDateString()
  readonly timestamp!: string;

  @ApiProperty({ example: '60009690813' })
  @IsString()
  @Length(1, 50)
  readonly organization_id!: string;

  @ApiProperty({ example: 'wh_123456789' })
  @IsString()
  @Length(1, 100)
  readonly webhook_id!: string;

  @ApiProperty({ type: 'object' })
  readonly data!: any;
}

export class CreateCrmLeadDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @Length(1, 50)
  readonly first_name!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @Length(1, 50)
  readonly last_name!: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  readonly email!: string;

  @ApiPropertyOptional({ example: '+1-555-123-4567' })
  @IsOptional()
  @IsString()
  readonly phone?: string;

  @ApiProperty({ example: 'Acme Corporation' })
  @IsString()
  @Length(1, 100)
  readonly company!: string;

  @ApiProperty({ example: 'Website Contact Form' })
  @IsString()
  @Length(1, 50)
  readonly lead_source!: string;

  @ApiProperty({ enum: CrmLeadStatus, example: CrmLeadStatus.NEW })
  @IsEnum(CrmLeadStatus)
  readonly lead_status!: CrmLeadStatus;

  @ApiPropertyOptional({ example: 1000000, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly annual_revenue?: number;

  @ApiPropertyOptional({ example: 'Technology' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  readonly industry?: string;

  @ApiPropertyOptional({ example: 'Interested in MSP services' })
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  readonly description?: string;
}

export class CreateProjectDto {
  @ApiProperty({ example: 'MSP Infrastructure Upgrade' })
  @IsString()
  @Length(1, 100)
  readonly name!: string;

  @ApiPropertyOptional({ example: 'Complete infrastructure modernization' })
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  readonly description?: string;

  @ApiProperty({ enum: ProjectStatus, example: ProjectStatus.IN_PROGRESS })
  @IsEnum(ProjectStatus)
  readonly status!: ProjectStatus;

  @ApiProperty({ example: '12345678-1234-5678-9abc-123456789012' })
  @IsString()
  readonly owner_id!: string;

  @ApiPropertyOptional({ example: '87654321-4321-8765-dcba-210987654321' })
  @IsOptional()
  @IsString()
  readonly client_id?: string;

  @ApiProperty({ example: '2024-01-15T09:00:00Z' })
  @IsDateString()
  readonly start_date!: string;

  @ApiPropertyOptional({ example: '2024-03-15T17:00:00Z' })
  @IsOptional()
  @IsDateString()
  readonly end_date?: string;

  @ApiPropertyOptional({ example: 50000, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly budget?: number;

  @ApiProperty({ example: 35, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  readonly completion_percentage!: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: 'INV-2024-001' })
  @IsString()
  @Length(1, 50)
  readonly invoice_number!: string;

  @ApiProperty({ example: '12345678-1234-5678-9abc-123456789012' })
  @IsString()
  readonly customer_id!: string;

  @ApiPropertyOptional({ example: '87654321-4321-8765-dcba-210987654321' })
  @IsOptional()
  @IsString()
  readonly project_id?: string;

  @ApiProperty({ enum: InvoiceStatus, example: InvoiceStatus.SENT })
  @IsEnum(InvoiceStatus)
  readonly status!: InvoiceStatus;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  readonly date!: string;

  @ApiProperty({ example: '2024-02-15' })
  @IsDateString()
  readonly due_date!: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @Length(3, 3)
  readonly currency_code!: string;

  @ApiProperty({ type: [Object] })
  @IsArray()
  readonly line_items!: any[];
}

export class ApiResponseDto<T = any> {
  @ApiProperty({ example: true })
  @IsBoolean()
  readonly success!: boolean;

  @ApiPropertyOptional()
  readonly data?: T;

  @ApiPropertyOptional()
  readonly error?: {
    readonly code: string;
    readonly message: string;
    readonly details?: Record<string, any>;
  };

  @ApiPropertyOptional()
  readonly metadata?: {
    readonly timestamp: string;
    readonly request_id: string;
    readonly version: string;
    readonly execution_time_ms: number;
  };
} 