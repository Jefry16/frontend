import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";

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
