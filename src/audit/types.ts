// GET /tour-operators/{id}/audit-log — the append-only audit trail, cursor-
// paginated via the list framework ({data, nextCursor}). Each row records who
// (actorType + nullable actorId, with the display name FROZEN at write time)
// did what (dot-namespaced action) to which entity, when — plus two optional
// JSON payloads: `details` (non-field context, per-action shape) and `changes`
// (the field-level before→after diff).

export type AuditActorType = "USER" | "SYSTEM";

/** One field-level change: `from → to` for a single domain field. */
export interface AuditFieldChange {
	field: string;
	from: unknown;
	to: unknown;
}

// `changes` is null for pure events (nothing field-shaped changed). `actorId`
// and `actorName` are present for USER actors (the name frozen as it was when
// the action happened; null when the account couldn't be resolved).
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
