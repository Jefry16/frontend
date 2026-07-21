import axios, { type InternalAxiosRequestConfig } from "axios";
import { clearAccessToken, getAccessToken, setAccessToken } from "./tokens";

export const authApi = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: true,
});

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

const SKIP_AUTH_URLS = new Set([
	"/auth/login",
	"/auth/register",
	"/auth/refresh",
	"/auth/verify",
	"/auth/resend-verification",
	"/auth/request-password-reset",
	"/auth/reset-password",
]);

let onAuthExpired: (() => void) | null = null;

export const setOnAuthExpired = (cb: (() => void) | null) => {
	onAuthExpired = cb;
};

let refreshInflight: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
	if (refreshInflight) return refreshInflight;
	refreshInflight = (async () => {
		const { data } = await authApi.post<{ accessToken: string }>(
			"/auth/refresh",
		);
		setAccessToken(data.accessToken);
		return data.accessToken;
	})().finally(() => {
		refreshInflight = null;
	});
	return refreshInflight;
};

authApi.interceptors.request.use((config) => {
	const url = config.url ?? "";
	if (!SKIP_AUTH_URLS.has(url)) {
		const token = getAccessToken();
		if (token) {
			config.headers.set("Authorization", `Bearer ${token}`);
		}
	}
	return config;
});

authApi.interceptors.response.use(
	(response) => response,
	async (error) => {
		const original = error.config as RetriableRequest | undefined;
		const status = error.response?.status;
		const url = original?.url ?? "";

		if (
			status !== 401 ||
			!original ||
			original._retry ||
			SKIP_AUTH_URLS.has(url)
		) {
			return Promise.reject(error);
		}

		original._retry = true;
		try {
			const accessToken = await refreshAccessToken();
			original.headers.set("Authorization", `Bearer ${accessToken}`);
			return authApi(original);
		} catch (refreshError) {
			clearAccessToken();
			onAuthExpired?.();
			return Promise.reject(refreshError);
		}
	},
);
