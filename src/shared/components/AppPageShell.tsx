import type { ReactNode } from "react";

// The page-level wrapper — the ONLY home of the page rhythm, so a new route
// can't drift from it (a hand-copied class string once shipped gap-6 where a
// detail page wanted gap-8):
//   list   → full width (tables own their horizontal space)
//   detail → centered 3xl, gap-8 (single-resource card stacks breathe wider)
//   form   → centered 3xl, gap-6 (create/edit/translations/settings forms)
const VARIANTS = {
	list: "flex flex-col gap-6 p-6",
	detail: "mx-auto flex w-full max-w-3xl flex-col gap-8 p-6",
	form: "mx-auto flex w-full max-w-3xl flex-col gap-6 p-6",
} as const;

export const AppPageShell = ({
	variant,
	children,
}: {
	variant: keyof typeof VARIANTS;
	children: ReactNode;
}) => <div className={VARIANTS[variant]}>{children}</div>;
