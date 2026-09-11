import { HttpResponse, http } from "msw";

export const paginatedHandler = <T>(
	url: string,
	pages: { data: T[]; nextCursor: string | null }[],
) => {
	const cursors: (string | null)[] = [];
	return {
		cursors,
		handler: http.get(url, ({ request }) => {
			const cursor = new URL(request.url).searchParams.get("cursor");
			cursors.push(cursor);
			const index = cursor
				? pages.findIndex(
						(_, i) => i > 0 && pages[i - 1]?.nextCursor === cursor,
					)
				: 0;
			return HttpResponse.json(pages[index] ?? { data: [], nextCursor: null });
		}),
	};
};
