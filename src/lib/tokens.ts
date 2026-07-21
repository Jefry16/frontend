let accessToken: string | null = null;

export const getAccessToken = (): string | null => accessToken;

export const setAccessToken = (token: string) => {
	accessToken = token;
};

export const clearAccessToken = () => {
	accessToken = null;
};
