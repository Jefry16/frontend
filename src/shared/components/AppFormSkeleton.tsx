import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";

// The placeholder a form shows while the record it edits loads — drop into
// AppResourceView's or AppCardBody's `loading`. `rows` is how many fields the
// form will render, so the skeleton reserves the real height and nothing jumps
// when the record lands. The sibling of AppDetailSkeleton, which does the same
// for a read-only facts card.
//
// A row is `h-9` and not the Input's `h-8` because it stands in for a whole
// field — label, control, and the gap under it — not the bare control. Written
// by hand it was `h-9` thirteen times and `h-10` four, which is the drift this
// component exists to stop; a loading state is exactly where nobody notices.
//
// `card={false}` for a form that already sits inside one, which is every
// settings card: AppCardBody renders into an open CardContent so the header
// stays visible while the body loads.
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
