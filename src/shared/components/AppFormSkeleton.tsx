import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";

// A row is `h-9`, not the Input's `h-8`: it stands in for a whole field —
// label, control and the gap under it — so the record lands without a jump.
export const AppFormSkeleton = ({
	rows,
	card = true,
}: {
	rows: number;
	card?: boolean;
}) => {
	const bars = Array.from({ length: rows }, (_, i) => (
		// biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder row, nothing to reorder
		<Skeleton key={i} className="h-9 w-full" />
	));

	return card ? (
		<Card>
			<CardContent className="flex flex-col gap-4">{bars}</CardContent>
		</Card>
	) : (
		<div className="flex flex-col gap-4">{bars}</div>
	);
};
