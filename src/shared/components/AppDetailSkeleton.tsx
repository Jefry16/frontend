import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";

export const AppDetailSkeleton = ({
	fields,
	variant = "plain",
}: {
	fields: number;
	variant?: "plain" | "labelled";
}) => (
	<Card>
		<CardContent
			className={
				variant === "plain"
					? "grid grid-cols-2 gap-4"
					: "grid grid-cols-1 gap-6 sm:grid-cols-2"
			}
		>
			{Array.from({ length: fields }, (_, i) =>
				variant === "plain" ? (
					// biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder row, nothing to reorder
					<Skeleton key={i} className="h-12 w-full" />
				) : (
					// biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder row, nothing to reorder
					<div key={i} className="flex flex-col gap-2">
						<Skeleton className="h-3 w-16" />
						<Skeleton className="h-5 w-32" />
					</div>
				),
			)}
		</CardContent>
	</Card>
);
