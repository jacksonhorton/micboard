import type { AnyD1Database } from "drizzle-orm/d1";

const GOOGLE_PROVIDER = "google";

export interface GoogleIdentityProfile {
	sub: string;
	email: string;
	name?: string;
	picture?: string;
}

export interface LocalUser {
	id: string;
	email: string;
	name: string;
	avatarUrl?: string | null;
}

interface UserRow {
	id: string;
	email: string;
	name: string;
	avatarUrl?: string | null;
}

function nowUnixSeconds(): number {
	return Math.floor(Date.now() / 1000);
}

async function findUserByGoogleIdentity(db: AnyD1Database, providerUserId: string): Promise<UserRow | null> {
	return (
		(await db
			.prepare(
				`SELECT u.id, u.email, u.name, u.avatar_url AS avatarUrl
				 FROM user_identities ui
				 JOIN users u ON u.id = ui.user_id
				 WHERE ui.provider = ?1 AND ui.provider_user_id = ?2
				 LIMIT 1`,
			)
			.bind(GOOGLE_PROVIDER, providerUserId)
			.first<UserRow>()) ?? null
	);
}

async function findUserByEmail(db: AnyD1Database, email: string): Promise<UserRow | null> {
	return (
		(await db
			.prepare(
				`SELECT id, email, name, avatar_url AS avatarUrl
				 FROM users
				 WHERE lower(email) = lower(?1)
				 LIMIT 1`,
			)
			.bind(email)
			.first<UserRow>()) ?? null
	);
}

export async function findOrCreateUserFromGoogleProfile(
	db: AnyD1Database,
	profile: GoogleIdentityProfile,
): Promise<LocalUser> {
	const existingByIdentity = await findUserByGoogleIdentity(db, profile.sub);
	const existingByEmail = existingByIdentity ? null : await findUserByEmail(db, profile.email);
	const userId = existingByIdentity?.id ?? existingByEmail?.id ?? crypto.randomUUID();
	const timestamp = nowUnixSeconds();

	await db
		.prepare(
			`INSERT INTO users (id, email, name, avatar_url, created_at, updated_at)
			 VALUES (?1, ?2, ?3, ?4, ?5, ?5)
			 ON CONFLICT(id) DO UPDATE SET
			   email = excluded.email,
			   name = excluded.name,
			   avatar_url = excluded.avatar_url,
			   updated_at = excluded.updated_at`,
		)
		.bind(userId, profile.email, profile.name ?? profile.email, profile.picture ?? null, timestamp)
		.run();

	await db
		.prepare(
			`INSERT INTO user_identities (user_id, provider, provider_user_id, created_at, updated_at)
			 VALUES (?1, ?2, ?3, ?4, ?4)
			 ON CONFLICT(provider, provider_user_id) DO UPDATE SET
			   user_id = excluded.user_id,
			   updated_at = excluded.updated_at`,
		)
		.bind(userId, GOOGLE_PROVIDER, profile.sub, timestamp)
		.run();

	const user = await db
		.prepare(
			`SELECT id, email, name, avatar_url AS avatarUrl
			 FROM users
			 WHERE id = ?1
			 LIMIT 1`,
		)
		.bind(userId)
		.first<UserRow>();

	if (!user) {
		throw new Error("Failed to load local user after Google upsert");
	}

	return {
		id: user.id,
		email: user.email,
		name: user.name,
		avatarUrl: user.avatarUrl ?? null,
	};
}
