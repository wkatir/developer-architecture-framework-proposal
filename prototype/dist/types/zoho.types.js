"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskLevel = exports.InvoiceStatus = exports.MilestoneStatus = exports.TaskStatus = exports.ProjectPriority = exports.ProjectStatus = exports.DeskTicketPriority = exports.DeskTicketStatus = exports.CrmLeadRating = exports.CrmLeadStatus = exports.ZohoEventType = exports.ZohoModule = void 0;
exports.isZohoModule = isZohoModule;
exports.isZohoEventType = isZohoEventType;
exports.isZohoWebhookPayload = isZohoWebhookPayload;
var ZohoModule;
(function (ZohoModule) {
    ZohoModule["CRM"] = "crm";
    ZohoModule["DESK"] = "desk";
    ZohoModule["PROJECTS"] = "projects";
    ZohoModule["BOOKS"] = "books";
    ZohoModule["PEOPLE"] = "people";
    ZohoModule["EXPENSE"] = "expense";
    ZohoModule["MARKETING"] = "marketing";
    ZohoModule["CLIQ"] = "cliq";
    ZohoModule["ANALYTICS"] = "analytics";
})(ZohoModule || (exports.ZohoModule = ZohoModule = {}));
var ZohoEventType;
(function (ZohoEventType) {
    ZohoEventType["LEAD_CREATED"] = "lead_created";
    ZohoEventType["LEAD_CONVERTED"] = "lead_converted";
    ZohoEventType["DEAL_CREATED"] = "deal_created";
    ZohoEventType["DEAL_WON"] = "deal_won";
    ZohoEventType["CONTACT_CREATED"] = "contact_created";
    ZohoEventType["TICKET_CREATED"] = "ticket_created";
    ZohoEventType["TICKET_UPDATED"] = "ticket_updated";
    ZohoEventType["TICKET_RESOLVED"] = "ticket_resolved";
    ZohoEventType["TICKET_CLOSED"] = "ticket_closed";
    ZohoEventType["PROJECT_CREATED"] = "project_created";
    ZohoEventType["MILESTONE_COMPLETED"] = "milestone_completed";
    ZohoEventType["TASK_COMPLETED"] = "task_completed";
    ZohoEventType["INVOICE_CREATED"] = "invoice_created";
    ZohoEventType["INVOICE_PAID"] = "invoice_paid";
    ZohoEventType["PAYMENT_RECEIVED"] = "payment_received";
})(ZohoEventType || (exports.ZohoEventType = ZohoEventType = {}));
var CrmLeadStatus;
(function (CrmLeadStatus) {
    CrmLeadStatus["NEW"] = "New";
    CrmLeadStatus["CONTACTED"] = "Contacted";
    CrmLeadStatus["QUALIFIED"] = "Qualified";
    CrmLeadStatus["UNQUALIFIED"] = "Unqualified";
    CrmLeadStatus["CONVERTED"] = "Converted";
})(CrmLeadStatus || (exports.CrmLeadStatus = CrmLeadStatus = {}));
var CrmLeadRating;
(function (CrmLeadRating) {
    CrmLeadRating["HOT"] = "Hot";
    CrmLeadRating["WARM"] = "Warm";
    CrmLeadRating["COLD"] = "Cold";
})(CrmLeadRating || (exports.CrmLeadRating = CrmLeadRating = {}));
var DeskTicketStatus;
(function (DeskTicketStatus) {
    DeskTicketStatus["OPEN"] = "Open";
    DeskTicketStatus["IN_PROGRESS"] = "In Progress";
    DeskTicketStatus["WAITING_FOR_RESPONSE"] = "Waiting for Response";
    DeskTicketStatus["RESOLVED"] = "Resolved";
    DeskTicketStatus["CLOSED"] = "Closed";
})(DeskTicketStatus || (exports.DeskTicketStatus = DeskTicketStatus = {}));
var DeskTicketPriority;
(function (DeskTicketPriority) {
    DeskTicketPriority["LOW"] = "Low";
    DeskTicketPriority["MEDIUM"] = "Medium";
    DeskTicketPriority["HIGH"] = "High";
    DeskTicketPriority["CRITICAL"] = "Critical";
})(DeskTicketPriority || (exports.DeskTicketPriority = DeskTicketPriority = {}));
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["NOT_STARTED"] = "Not Started";
    ProjectStatus["IN_PROGRESS"] = "In Progress";
    ProjectStatus["ON_HOLD"] = "On Hold";
    ProjectStatus["COMPLETED"] = "Completed";
    ProjectStatus["CANCELLED"] = "Cancelled";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
var ProjectPriority;
(function (ProjectPriority) {
    ProjectPriority["LOW"] = "Low";
    ProjectPriority["MEDIUM"] = "Medium";
    ProjectPriority["HIGH"] = "High";
    ProjectPriority["CRITICAL"] = "Critical";
})(ProjectPriority || (exports.ProjectPriority = ProjectPriority = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["OPEN"] = "Open";
    TaskStatus["IN_PROGRESS"] = "In Progress";
    TaskStatus["COMPLETED"] = "Completed";
    TaskStatus["CANCELLED"] = "Cancelled";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var MilestoneStatus;
(function (MilestoneStatus) {
    MilestoneStatus["NOT_STARTED"] = "Not Started";
    MilestoneStatus["IN_PROGRESS"] = "In Progress";
    MilestoneStatus["COMPLETED"] = "Completed";
    MilestoneStatus["OVERDUE"] = "Overdue";
})(MilestoneStatus || (exports.MilestoneStatus = MilestoneStatus = {}));
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "Draft";
    InvoiceStatus["SENT"] = "Sent";
    InvoiceStatus["VIEWED"] = "Viewed";
    InvoiceStatus["OVERDUE"] = "Overdue";
    InvoiceStatus["PAID"] = "Paid";
    InvoiceStatus["PARTIALLY_PAID"] = "Partially Paid";
    InvoiceStatus["VOID"] = "Void";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["LOW"] = "low";
    RiskLevel["MEDIUM"] = "medium";
    RiskLevel["HIGH"] = "high";
    RiskLevel["CRITICAL"] = "critical";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
function isZohoModule(value) {
    return Object.values(ZohoModule).includes(value);
}
function isZohoEventType(value) {
    return Object.values(ZohoEventType).includes(value);
}
function isZohoWebhookPayload(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'module' in value &&
        'event_type' in value &&
        'data' in value &&
        isZohoModule(value.module) &&
        isZohoEventType(value.event_type));
}
