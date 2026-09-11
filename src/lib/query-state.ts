export interface QueryState<TData> {
	data: TData | undefined;
	isPending: boolean;
	error: unknown;
	refetch: () => void;
}

export const mergeQueryState = <A, B, R>(
	a: QueryState<A>,
	b: QueryState<B>,
	select: (a: A, b: B) => R,
): QueryState<R> => {
	const error = a.error ?? b.error;
	const isPending = !error && (a.isPending || b.isPending);
	const settled =
		!error && !isPending && a.data !== undefined && b.data !== undefined;

	return {
		data: settled ? select(a.data as A, b.data as B) : undefined,
		isPending,
		error,
		refetch: () => {
			a.refetch();
			b.refetch();
		},
	};
};
