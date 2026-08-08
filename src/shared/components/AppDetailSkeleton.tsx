import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";

// The facts-card placeholder every by-id detail shows while its query runs —
// drop into AppResourceView's `loading`. `fields` is how many facts the card
// will hold, so the skeleton reserves the real height and nothing jumps when
// the record lands.
export const AppDetailSkeleton = ({ fields }: { fields: number }) => (
	<Card>
		<CardContent className="grid grid-cols-2 gap-4">
			{Array.from({ length: fields }, (_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder row, nothing to reorder
				<Skeleton key={i} className="h-12 w-full" />
			))}
		</CardContent>
	</Card>
);
