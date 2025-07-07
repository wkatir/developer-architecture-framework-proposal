/**
 * Comprehensive TypeScript types for Zoho One integration
 * Demonstrates advanced TypeScript patterns and enterprise-grade type safety
 */

// ============================================================================
// Core Zoho Types with Strict Validation
// ============================================================================

export enum ZohoModule {
  CRM = 'crm',
  DESK = 'desk', 
  PROJECTS = 'projects',
  BOOKS = 'books',
  PEOPLE = 'people',
  EXPENSE = 'expense',
  MARKETING = 'marketing',
  CLIQ = 'cliq',
  ANALYTICS = 'analytics',
}

export enum ZohoEventType {
  // CRM Events
  LEAD_CREATED = 'lead_created',
  LEAD_CONVERTED = 'lead_converted',
  DEAL_CREATED = 'deal_created',
  DEAL_WON = 'deal_won',
  CONTACT_CREATED = 'contact_created',
  
  // Desk Events  
  TICKET_CREATED = 'ticket_created',
  TICKET_UPDATED = 'ticket_updated',
  TICKET_RESOLVED = 'ticket_resolved',
  TICKET_CLOSED = 'ticket_closed',
  
  // Projects Events
  PROJECT_CREATED = 'project_created',
  MILESTONE_COMPLETED = 'milestone_completed',
  TASK_COMPLETED = 'task_completed',
  
  // Books Events
  INVOICE_CREATED = 'invoice_created',
  INVOICE_PAID = 'invoice_paid',
  PAYMENT_RECEIVED = 'payment_received',
}

// ============================================================================
// Advanced Generic Types for Type Safety
// ============================================================================

/**
 * Generic Zoho entity with typed ID and metadata
 */
export interface ZohoEntity<T extends string = string> {
  readonly id: T;
  readonly zoho_id: string;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly created_by: string;
  readonly modified_by?: string;
}

/**
 * Generic webhook payload with module-specific data
 */
export interface ZohoWebhookPayload<
  M extends ZohoModule = ZohoModule,
  E extends ZohoEventType = ZohoEventType,
  D extends Record<string, unknown> = Record<string, unknown>
> {
  readonly module: M;
  readonly event_type: E;
  readonly timestamp: string;
  readonly organization_id: string;
  readonly webhook_id: string;
  readonly data: D;
  readonly signature: string;
}

/**
 * Type-safe event data mapping for each module
 */
export type ZohoEventData<M extends ZohoModule> = 
  M extends ZohoModule.CRM ? CrmEventData :
  M extends ZohoModule.DESK ? DeskEventData :
  M extends ZohoModule.PROJECTS ? ProjectsEventData :
  M extends ZohoModule.BOOKS ? BooksEventData :
  Record<string, unknown>;

// ============================================================================
// CRM Module Types with Business Logic
// ============================================================================

export interface CrmLead extends ZohoEntity<`lead_${string}`> {
  readonly first_name: string;
  readonly last_name: string;
  readonly email: string;
  readonly phone?: string;
  readonly company: string;
  readonly lead_source: string;
  readonly lead_status: CrmLeadStatus;
  readonly rating: CrmLeadRating;
  readonly annual_revenue?: number;
  readonly industry?: string;
  readonly description?: string;
}

export enum CrmLeadStatus {
  NEW = 'New',
  CONTACTED = 'Contacted',
  QUALIFIED = 'Qualified',
  UNQUALIFIED = 'Unqualified',
  CONVERTED = 'Converted',
}

export enum CrmLeadRating {
  HOT = 'Hot',
  WARM = 'Warm', 
  COLD = 'Cold',
}

export interface CrmEventData extends Record<string, unknown> {
  lead?: CrmLead;
  deal?: CrmDeal;
  contact?: CrmContact;
}

export interface CrmDeal extends ZohoEntity<`deal_${string}`> {
  readonly deal_name: string;
  readonly account_name: string;
  readonly stage: string;
  readonly amount: number;
  readonly probability: number;
  readonly expected_revenue: number;
  readonly closing_date: string;
  readonly lead_source: string;
  readonly contact_id?: string;
}

export interface CrmContact extends ZohoEntity<`contact_${string}`> {
  readonly first_name: string;
  readonly last_name: string;
  readonly email: string;
  readonly phone?: string;
  readonly account_id: string;
  readonly title?: string;
  readonly department?: string;
}

// ============================================================================
// Desk Module Types with Support Workflow
// ============================================================================

export interface DeskTicket extends ZohoEntity<`ticket_${string}`> {
  readonly subject: string;
  readonly description: string;
  readonly status: DeskTicketStatus;
  readonly priority: DeskTicketPriority;
  readonly category: string;
  readonly contact_id: string;
  readonly assignee_id?: string;
  readonly due_date?: string;
  readonly resolution?: string;
  readonly satisfaction_rating?: number;
}

export enum DeskTicketStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress', 
  WAITING_FOR_RESPONSE = 'Waiting for Response',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed',
}

export enum DeskTicketPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export interface DeskEventData extends Record<string, unknown> {
  ticket?: DeskTicket;
  comment?: DeskComment;
  attachment?: DeskAttachment;
}

export interface DeskComment extends ZohoEntity<`comment_${string}`> {
  readonly ticket_id: string;
  readonly content: string;
  readonly is_public: boolean;
  readonly author_id: string;
}

export interface DeskAttachment extends ZohoEntity<`attachment_${string}`> {
  readonly ticket_id: string;
  readonly file_name: string;
  readonly file_size: number;
  readonly file_type: string;
  readonly download_url: string;
}

// ============================================================================
// Projects Module Types with Blueprint Integration
// ============================================================================

export interface ProjectsProject extends ZohoEntity<`project_${string}`> {
  readonly name: string;
  readonly description?: string;
  readonly status: ProjectStatus;
  readonly priority: ProjectPriority;
  readonly owner_id: string;
  readonly client_id?: string;
  readonly start_date: string;
  readonly end_date?: string;
  readonly budget?: number;
  readonly hours_allocated?: number;
  readonly hours_logged?: number;
  readonly completion_percentage: number;
}

export enum ProjectStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  ON_HOLD = 'On Hold', 
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export enum ProjectPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export interface ProjectsEventData extends Record<string, unknown> {
  project?: ProjectsProject;
  task?: ProjectsTask;
  milestone?: ProjectsMilestone;
}

export interface ProjectsTask extends ZohoEntity<`task_${string}`> {
  readonly name: string;
  readonly description?: string;
  readonly project_id: string;
  readonly assignee_id?: string;
  readonly status: TaskStatus;
  readonly priority: ProjectPriority;
  readonly start_date?: string;
  readonly end_date?: string;
  readonly estimated_hours?: number;
  readonly actual_hours?: number;
}

export enum TaskStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export interface ProjectsMilestone extends ZohoEntity<`milestone_${string}`> {
  readonly name: string;
  readonly description?: string;
  readonly project_id: string;
  readonly due_date: string;
  readonly status: MilestoneStatus;
  readonly completion_percentage: number;
}

export enum MilestoneStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress', 
  COMPLETED = 'Completed',
  OVERDUE = 'Overdue',
}

// ============================================================================
// Books Module Types with Financial Data
// ============================================================================

export interface BooksInvoice extends ZohoEntity<`invoice_${string}`> {
  readonly invoice_number: string;
  readonly customer_id: string;
  readonly project_id?: string;
  readonly status: InvoiceStatus;
  readonly date: string;
  readonly due_date: string;
  readonly subtotal: number;
  readonly tax_amount: number;
  readonly total: number;
  readonly balance: number;
  readonly currency_code: string;
  readonly line_items: InvoiceLineItem[];
}

export enum InvoiceStatus {
  DRAFT = 'Draft',
  SENT = 'Sent',
  VIEWED = 'Viewed',
  OVERDUE = 'Overdue',
  PAID = 'Paid',
  PARTIALLY_PAID = 'Partially Paid',
  VOID = 'Void',
}

export interface InvoiceLineItem {
  readonly item_id?: string;
  readonly name: string;
  readonly description?: string;
  readonly quantity: number;
  readonly rate: number;
  readonly amount: number;
  readonly tax_percentage?: number;
}

export interface BooksEventData extends Record<string, unknown> {
  invoice?: BooksInvoice;
  payment?: BooksPayment;
  expense?: BooksExpense;
}

export interface BooksPayment extends ZohoEntity<`payment_${string}`> {
  readonly payment_number: string;
  readonly customer_id: string;
  readonly invoice_ids: string[];
  readonly date: string;
  readonly amount: number;
  readonly payment_mode: string;
  readonly reference_number?: string;
  readonly description?: string;
}

export interface BooksExpense extends ZohoEntity<`expense_${string}`> {
  readonly expense_account: string;
  readonly date: string;
  readonly amount: number;
  readonly project_id?: string;
  readonly customer_id?: string;
  readonly description?: string;
  readonly is_billable: boolean;
  readonly tax_amount?: number;
}

// ============================================================================
// Advanced Utility Types for API Responses
// ============================================================================

/**
 * Standard API response wrapper with type safety
 */
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: ApiError;
  readonly metadata?: ResponseMetadata;
}

export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly correlation_id?: string;
}

export interface ResponseMetadata {
  readonly timestamp: string;
  readonly request_id: string;
  readonly version: string;
  readonly execution_time_ms: number;
}

/**
 * Pagination wrapper with type safety
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  readonly pagination: {
    readonly page: number;
    readonly page_size: number;
    readonly total_items: number;
    readonly total_pages: number;
    readonly has_next: boolean;
    readonly has_previous: boolean;
  };
}

// ============================================================================
// Event Processing Types
// ============================================================================

/**
 * Internal event representation after processing
 */
export interface ProcessedEvent<T = unknown> {
  readonly id: string;
  readonly correlation_id: string;
  readonly source_module: ZohoModule;
  readonly event_type: ZohoEventType;
  readonly timestamp: Date;
  readonly processed_at: Date;
  readonly data: T;
  readonly metadata: EventMetadata;
}

export interface EventMetadata {
  readonly webhook_id: string;
  readonly organization_id: string;
  readonly retry_count: number;
  readonly processing_duration_ms: number;
  readonly blueprint_triggered?: string[];
}

/**
 * Blueprint execution context with type safety
 */
export interface BlueprintContext<T = unknown> {
  readonly blueprint_id: string;
  readonly execution_id: string;
  readonly trigger_event: ProcessedEvent<T>;
  readonly current_state: string;
  readonly variables: Record<string, unknown>;
  readonly started_at: Date;
  readonly updated_at: Date;
}

// ============================================================================
// Analytics and ML Types
// ============================================================================

export interface ProjectHealthMetrics {
  readonly project_id: string;
  readonly health_score: number; // 0-1
  readonly risk_level: RiskLevel;
  readonly budget_utilization: number;
  readonly timeline_adherence: number;
  readonly team_productivity: number;
  readonly client_satisfaction: number;
  readonly key_issues: string[];
  readonly recommendations: string[];
  readonly forecast: ProjectForecast;
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ProjectForecast {
  readonly completion_date: string;
  readonly final_budget: number;
  readonly success_probability: number;
  readonly churn_risk: number;
}

/**
 * ML Pipeline result with confidence scores
 */
export interface MLPrediction<T = unknown> {
  readonly model_name: string;
  readonly model_version: string;
  readonly prediction: T;
  readonly confidence_score: number;
  readonly feature_importance?: Record<string, number>;
  readonly prediction_timestamp: Date;
  readonly input_features: Record<string, unknown>;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface ZohoConfig {
  readonly client_id: string;
  readonly client_secret: string;
  readonly redirect_uri: string;
  readonly scope: string[];
  readonly webhook_secret: string;
  readonly rate_limit: {
    readonly requests_per_minute: number;
    readonly burst_size: number;
  };
}

export interface DatabaseConfig {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly username: string;
  readonly password: string;
  readonly ssl: boolean;
  readonly pool: {
    readonly min: number;
    readonly max: number;
    readonly idle_timeout_ms: number;
  };
}

export interface RedisConfig {
  readonly host: string;
  readonly port: number;
  readonly password?: string;
  readonly db: number;
  readonly retry_attempts: number;
  readonly retry_delay_ms: number;
}

// ============================================================================
// Type Guards for Runtime Type Safety
// ============================================================================

export function isZohoModule(value: string): value is ZohoModule {
  return Object.values(ZohoModule).includes(value as ZohoModule);
}

export function isZohoEventType(value: string): value is ZohoEventType {
  return Object.values(ZohoEventType).includes(value as ZohoEventType);
}

export function isZohoWebhookPayload(value: unknown): value is ZohoWebhookPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'module' in value &&
    'event_type' in value &&
    'data' in value &&
    isZohoModule((value as any).module) &&
    isZohoEventType((value as any).event_type)
  );
}

// ============================================================================
// Conditional Types for Advanced Type Manipulation
// ============================================================================

/**
 * Extract event types for a specific module
 */
export type EventTypesForModule<M extends ZohoModule> =
  M extends ZohoModule.CRM ? Extract<ZohoEventType, 'lead_created' | 'lead_converted' | 'deal_created' | 'deal_won' | 'contact_created'> :
  M extends ZohoModule.DESK ? Extract<ZohoEventType, 'ticket_created' | 'ticket_updated' | 'ticket_resolved' | 'ticket_closed'> :
  M extends ZohoModule.PROJECTS ? Extract<ZohoEventType, 'project_created' | 'milestone_completed' | 'task_completed'> :
  M extends ZohoModule.BOOKS ? Extract<ZohoEventType, 'invoice_created' | 'invoice_paid' | 'payment_received'> :
  never;

/**
 * Type-safe webhook handler function signature
 */
export type WebhookHandler<M extends ZohoModule, E extends EventTypesForModule<M>> = (
  payload: ZohoWebhookPayload<M, E, ZohoEventData<M>>
) => Promise<ApiResponse<ProcessedEvent>>;

/**
 * Mapped type for webhook handlers registry
 */
export type WebhookHandlerRegistry = {
  [M in ZohoModule]: {
    [E in EventTypesForModule<M>]: WebhookHandler<M, E>;
  };
}; 