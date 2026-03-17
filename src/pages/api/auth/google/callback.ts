import type { APIRoute } from "astro";
import { createSessionToken } from "../../../../lib/auth-utils";
import { getServerEnv } from "../../../../lib/server-env";
import { findOrCreateUserFromGoogleProfile } from "../../../../db/accounts";
import { createDb } from "../../../../db/db";

const STATE_COOKIE_NAME = "google_oauth_state";
const SESSION_COOKIE_NAME = "token";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

interface GoogleTokenResponse {
	access_token?: string;
	error?: string;
	error_description?: string;
}

interface GoogleUserInfo {
	sub?: string;
	email?: string;
	email_verified?: boolean;
	name?: string;
	picture?: string;
}

function getSiteUrl(locals: App.Locals, request: Request): string {
	return getServerEnv(locals, "SITE_URL") ?? getServerEnv(locals, "PUBLIC_SITE_URL") ?? new URL(request.url).origin;
}

function getAuthConfig(locals: App.Locals, request: Request) {
	const siteUrl = getSiteUrl(locals, request);
	return {
		siteUrl,
		redirectUri: new URL("/api/auth/google/callback", siteUrl).toString(),
		clientId:
			getServerEnv(locals, "GOOGLE_CLIENT_ID") ??
			getServerEnv(locals, "OAUTH_CLIENT_ID") ??
			getServerEnv(locals, "PUBLIC_OAUTH_CLIENT_ID"),
		clientSecret:
			getServerEnv(locals, "GOOGLE_CLIENT_SECRET") ??
			getServerEnv(locals, "OAUTH_CLIENT_SECRET") ??
			getServerEnv(locals, "PUBLIC_OAUTH_CLIENT_SECRET"),
		jwtSecret: getServerEnv(locals, "JWT_SECRET") ?? getServerEnv(locals, "PUBLIC_JWT_SECRET"),
	};
}

export const GET: APIRoute = async ({ url, cookies, locals, request }) => {
	const code = url.searchParams.get("code");
	const returnedState = url.searchParams.get("state");
	const storedState = cookies.get(STATE_COOKIE_NAME)?.value;

	if (!code || !returnedState || !storedState || returnedState !== storedState) {
		return new Response("Invalid OAuth state", { status: 400 });
	}

	cookies.delete(STATE_COOKIE_NAME, { path: "/" });

	const { clientId, clientSecret, jwtSecret, redirectUri, siteUrl } = getAuthConfig(locals, request);
	if (!clientId || !clientSecret || !jwtSecret) {
		return new Response("Missing OAuth or JWT configuration", { status: 500 });
	}

	const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: {
			"content-type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			code,
			client_id: clientId,
			client_secret: clientSecret,
			redirect_uri: redirectUri,
			grant_type: "authorization_code",
		}),
	});

	if (!tokenResponse.ok) {
		return new Response("Failed to exchange OAuth code", { status: 401 });
	}

	const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;
	if (!tokenData.access_token) {
		return new Response(tokenData.error_description ?? "Missing access token", { status: 401 });
	}

	const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
		headers: {
			Authorization: `Bearer ${tokenData.access_token}`,
		},
	});

	if (!profileResponse.ok) {
		return new Response("Failed to fetch Google user profile", { status: 401 });
	}

	const profile = (await profileResponse.json()) as GoogleUserInfo;
	if (!profile.sub || !profile.email || profile.email_verified !== true) {
		return new Response("Google account email is not verified", { status: 403 });
	}

	const d1 = locals.runtime?.env?.DB;
	if (!d1) {
		return new Response("Missing DB binding", { status: 500 });
	}
	const db = createDb(d1);

	const user = await findOrCreateUserFromGoogleProfile(db.$client, {
		sub: profile.sub,
		email: profile.email,
		name: profile.name,
		picture: profile.picture,
	});

	const sessionToken = createSessionToken(
		{
			sub: user.id,
			email: user.email,
			name: user.name,
			picture: user.avatarUrl ?? undefined,
		},
		jwtSecret,
	);

	const allowHttpLogins = (getServerEnv(locals, "ALLOW_HTTP_LOGINS") ?? "false").toLowerCase() === "true";
	const secureCookies = new URL(siteUrl).protocol === "https:" && !allowHttpLogins;
	cookies.set(SESSION_COOKIE_NAME, sessionToken, {
		httpOnly: true,
		path: "/",
		sameSite: "lax",
		secure: secureCookies,
		maxAge: SESSION_MAX_AGE,
	});

	const postLoginPath = getServerEnv(locals, "POST_LOGIN_REDIRECT") ?? "/dashboard";

	return new Response(null, {
		status: 302,
		headers: {
			Location: postLoginPath,
		},
	});
};
