// Interface for Audit Log entries (adjust based on backend model)
export interface AuditLog {
  id: number;
  timestamp: Date;
  userId: number | null; // User who performed the action (null for system?)
  userName?: string; // Optional: Include user name for display
  action: string; // e.g., 'DOCUMENT_CREATED', 'SIGNATORY_ADDED', 'DOCUMENT_SIGNED', 'DOCUMENT_VIEWED'
  entityType: string; // e.g., 'Document', 'DocumentSignatory'
  entityId: number;
  details?: any; // Optional: Additional details about the action
}

