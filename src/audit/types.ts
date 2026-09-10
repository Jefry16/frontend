type AuditActorType = "USER" | "SYSTEM";

interface AuditFieldChange {
	field: string;
	from: unknown;
	to: unknown;
}

export interface AuditLogEntry {
	id: string;
	context: "audit-log-entries";
	actorType: AuditActorType;
	actorId: string | null;
	actorName: string | null;
	entityType: string;
	entityId: string;
	action: string;
	details: Record<string, unknown> | null;
	changes: AuditFieldChange[] | null;
	requestId: string | null;
	createdAt: string;
}
