// The append-only audit trail. The actor's display name is FROZEN at write
// time, so a later rename does not rewrite history.

type AuditActorType = "USER" | "SYSTEM";

interface AuditFieldChange {
	field: string;
	from: unknown;
	to: unknown;
}

// `changes` is null for pure events — nothing field-shaped changed.
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
