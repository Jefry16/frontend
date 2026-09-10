import { useCurrentTourOperator } from "./use-current-tour-operator";

export const useOperatorCurrency = (): string | null =>
	useCurrentTourOperator()?.currency ?? null;
