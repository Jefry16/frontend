import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { authApi, setOnAuthExpired } from "#/lib/api";
import { queryKeys } from "#/lib/query-keys";
import { clearAccessToken, getAccessToken, setAccessToken } from "#/lib/tokens";
import {
	getLocale,
	type Locale,
	locales,
	setLocale,
} from "#/paraglide/runtime";
import type { AuthUser } from "./types";

const fetchProfile = async (): Promise<AuthUser> => {
	const { data } = await authApi.get<AuthUser>("/auth/profile");
	return data;
};

interface AuthContextType {
	user: AuthUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<AuthUser>;
	/** Login minus the credentials post — the server has already set the refresh cookie. */
	establishSession: (accessToken: string) => Promise<AuthUser>;
	logout: () => Promise<void>;
	refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [bootstrapped, setBootstrapped] = useState(false);

	// Trade the httpOnly refresh cookie for an access token; failing that, the
	// visitor is simply unauthenticated.
	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const { data } = await authApi.post<{ accessToken: string }>(
					"/auth/refresh",
				);
				if (!cancelled) setAccessToken(data.accessToken);
			} catch {
				// no session — user remains unauthenticated
			} finally {
				if (!cancelled) setBootstrapped(true);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	const profileQuery = useQuery({
		queryKey: queryKeys.authProfile,
		queryFn: fetchProfile,
		enabled: bootstrapped && !!getAccessToken(),
		staleTime: Number.POSITIVE_INFINITY,
		retry: false,
	});

	// The profile is the source of truth for the UI language (set once, follows
	// the user across devices); the Paraglide cookie is only a cache. When they
	// disagree, apply the profile's — setLocale writes the cookie and reloads
	// once, after which they agree and this no-ops.
	const profileLanguage = profileQuery.data?.language;
	useEffect(() => {
		if (
			profileLanguage &&
			profileLanguage !== getLocale() &&
			(locales as readonly string[]).includes(profileLanguage)
		) {
			setLocale(profileLanguage as Locale);
		}
	}, [profileLanguage]);

	// When a background refresh finally fails (session gone), drop the cached
	// profile and bounce to login.
	useEffect(() => {
		setOnAuthExpired(() => {
			queryClient.clear();
			navigate({ to: "/auth/login" });
		});
		return () => {
			setOnAuthExpired(null);
		};
	}, [navigate, queryClient]);

	// The whole cache, not just `authProfile`: nothing reloads the page in an SPA,
	// so anything left behind is served to the next session.
	const clearSessionCache = useCallback(() => {
		queryClient.clear();
	}, [queryClient]);

	const login = useCallback(
		async (email: string, password: string) => {
			const { data: tokens } = await authApi.post<{ accessToken: string }>(
				"/auth/login",
				{ email, password },
			);
			clearSessionCache();
			setAccessToken(tokens.accessToken);
			const profile = await queryClient.fetchQuery({
				queryKey: queryKeys.authProfile,
				queryFn: fetchProfile,
				staleTime: Number.POSITIVE_INFINITY,
			});
			return profile;
		},
		[clearSessionCache, queryClient],
	);

	const establishSession = useCallback(
		async (accessToken: string) => {
			clearSessionCache();
			setAccessToken(accessToken);
			return queryClient.fetchQuery({
				queryKey: queryKeys.authProfile,
				queryFn: fetchProfile,
				staleTime: Number.POSITIVE_INFINITY,
			});
		},
		[clearSessionCache, queryClient],
	);

	const logout = useCallback(async () => {
		try {
			await authApi.post("/auth/logout");
		} catch {
			// best-effort; clear local state regardless
		}
		clearAccessToken();
		clearSessionCache();
	}, [clearSessionCache]);

	const refreshUser = useCallback(async () => {
		await queryClient.refetchQueries({ queryKey: queryKeys.authProfile });
		return queryClient.getQueryData<AuthUser>(queryKeys.authProfile) ?? null;
	}, [queryClient]);

	const user = profileQuery.data ?? null;
	const isAuthenticated = user !== null;
	const hasToken = !!getAccessToken();
	const isLoading =
		!bootstrapped || (hasToken && !profileQuery.data && !profileQuery.isError);

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated,
				isLoading,
				login,
				establishSession,
				logout,
				refreshUser,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
