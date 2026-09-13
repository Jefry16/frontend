import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
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
	establishSession: (accessToken: string) => Promise<AuthUser>;
	logout: () => Promise<void>;
	refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [bootstrapped, setBootstrapped] = useState(false);
	const [hasToken, setHasToken] = useState(() => !!getAccessToken());

	const holdToken = useCallback((accessToken: string) => {
		setAccessToken(accessToken);
		setHasToken(true);
	}, []);

	const dropToken = useCallback(() => {
		clearAccessToken();
		setHasToken(false);
	}, []);

	// One refresh per provider instance: the backend rotates the refresh
	// cookie, so a second call with the same cookie is refused, and an effect
	// can run twice for one mount.
	const startupRefresh = useRef<Promise<string | null> | null>(null);
	useEffect(() => {
		startupRefresh.current ??= authApi
			.post<{ accessToken: string }>("/auth/refresh")
			.then(({ data }) => data.accessToken)
			.catch(() => null);
		let cancelled = false;
		startupRefresh.current.then((accessToken) => {
			if (cancelled) return;
			if (accessToken) holdToken(accessToken);
			setBootstrapped(true);
		});
		return () => {
			cancelled = true;
		};
	}, [holdToken]);

	const profileQuery = useQuery({
		queryKey: queryKeys.authProfile,
		queryFn: fetchProfile,
		enabled: bootstrapped && hasToken,
		staleTime: Number.POSITIVE_INFINITY,
		retry: false,
	});

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

	useEffect(() => {
		setOnAuthExpired(() => {
			dropToken();
			queryClient.clear();
			navigate({ to: "/auth/login" });
		});
		return () => {
			setOnAuthExpired(null);
		};
	}, [dropToken, navigate, queryClient]);

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
			holdToken(tokens.accessToken);
			const profile = await queryClient.fetchQuery({
				queryKey: queryKeys.authProfile,
				queryFn: fetchProfile,
				staleTime: Number.POSITIVE_INFINITY,
			});
			return profile;
		},
		[clearSessionCache, holdToken, queryClient],
	);

	const establishSession = useCallback(
		async (accessToken: string) => {
			clearSessionCache();
			holdToken(accessToken);
			return queryClient.fetchQuery({
				queryKey: queryKeys.authProfile,
				queryFn: fetchProfile,
				staleTime: Number.POSITIVE_INFINITY,
			});
		},
		[clearSessionCache, holdToken, queryClient],
	);

	const logout = useCallback(async () => {
		try {
			await authApi.post("/auth/logout");
		} catch {}
		dropToken();
		clearSessionCache();
	}, [clearSessionCache, dropToken]);

	const refreshUser = useCallback(async () => {
		await queryClient.refetchQueries({ queryKey: queryKeys.authProfile });
		return queryClient.getQueryData<AuthUser>(queryKeys.authProfile) ?? null;
	}, [queryClient]);

	const user = profileQuery.data ?? null;
	const isAuthenticated = user !== null;
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
