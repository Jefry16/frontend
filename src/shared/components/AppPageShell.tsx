import type { ReactNode } from "react";

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
