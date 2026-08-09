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

// localStorage is OFF LIMITS for auth tokens and app state per CLAUDE.md —
// the access token lives in memory and refresh rides an httpOnly cookie.
// Theme is the documented exception: it's per-device by nature, not
// security-sensitive, and the alternative (resetting on every reload) is
// hostile UX. The inline FOUC script in __root.tsx reads the same key.
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

	// On first client mount, prefer the persisted choice; otherwise adopt
	// whatever the inline FOUC script wrote to <html> (which mirrors the OS
	// preference). Lazy `useState` initializers run on the server too, so we
	// can't read `localStorage` or `document` there.
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

	const toggle = useCallback(() => {
		setThemeState((t) => {
			const next = t === "dark" ? "light" : "dark";
			writeStored(next);
			return next;
		});
	}, []);

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
