type EnvMap = Record<string, string | undefined>;

// const staticImportMetaEnv: EnvMap = {
// 	SITE_URL: (import.meta.env as EnvMap).PUBLIC_SITE_URL,
// 	OAUTH_CLIENT_ID: (import.meta.env as EnvMap).PUBLIC_OAUTH_CLIENT_ID,
// 	OAUTH_CLIENT_SECRET: (import.meta.env as EnvMap).PUBLIC_OAUTH_CLIENT_SECRET,
// 	JWT_SECRET: (import.meta.env as EnvMap).PUBLIC_JWT_SECRET,
// 	POST_LOGIN_REDIRECT: (import.meta.env as EnvMap).POST_LOGIN_REDIRECT,
// };

function normalizeEnvValue(value: string | undefined): string | undefined {
	if (!value) {
		return undefined;
	}

	const trimmed = value.trim();
	if (!trimmed) {
		return undefined;
	}

	if (
		(trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
		(trimmed.startsWith("'") && trimmed.endsWith("'"))
	) {
		const unquoted = trimmed.slice(1, -1).trim();
		return unquoted || undefined;
	}

	return trimmed;
}

function getProcessEnvValue(key: string): string | undefined {
	if (typeof process === "undefined" || !process?.env) {
		return undefined;
	}

	return normalizeEnvValue(process.env[key]);
}

export function getServerEnv(locals: App.Locals, key: string): string | undefined {
	const runtimeEnv = (locals.runtime?.env ?? {}) as EnvMap;

	return (
		normalizeEnvValue(runtimeEnv[key]) ??
		getProcessEnvValue(key)
	);
}
