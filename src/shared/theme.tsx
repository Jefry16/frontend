import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
	theme: Theme;
	setTheme: (t: Theme) => void;
	toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// The one documented exception to the no-localStorage rule: per-device by
// nature and not sensitive. The FOUC script in __root.tsx reads the same key.
const STORAGE_KEY = "theme";

const readStored = (): Theme | null => {
	try {
		const v = localStorage.getItem(STORAGE_KEY);
		return v === "light" || v === "dark" ? v : null;
	} catch {
		return null;
	}
};

const writeStored = (t: Theme) => {
	try {
		localStorage.setItem(STORAGE_KEY, t);
	} catch {
		// localStorage can throw in private mode or when storage is full.
	}
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
	const [theme, setThemeState] = useState<Theme>("light");

	// Not a lazy useState initializer: those run on the server too, where there
	// is no localStorage and no <html> for the FOUC script to have written to.
	useEffect(() => {
		if (typeof document === "undefined") return;
		const stored = readStored();
		if (stored) {
			setThemeState(stored);
			return;
		}
		const isDark = document.documentElement.classList.contains("dark");
		setThemeState(isDark ? "dark" : "light");
	}, []);

	useEffect(() => {
		if (typeof document === "undefined") return;
		const root = document.documentElement;
		root.classList.remove("light", "dark");
		root.classList.add(theme);
		root.style.colorScheme = theme;
	}, [theme]);

	const setTheme = useCallback((t: Theme) => {
		setThemeState(t);
		writeStored(t);
	}, []);

	// The write stays OUT of the updater: updaters run during render and may be
	// invoked twice, or for a render that is thrown away.
	const toggle = useCallback(() => {
		setTheme(theme === "dark" ? "light" : "dark");
	}, [theme, setTheme]);

	return (
		<ThemeContext.Provider value={{ theme, setTheme, toggle }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
	return ctx;
};
