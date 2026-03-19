import type { AnyD1Database } from "drizzle-orm/d1";

export interface CreateProjectInput {
	userId: string;
	name: string;
	description: string | null;
}

export interface ProjectRecord {
	id: string;
	userId: string;
	name: string;
	description: string | null;
	createdAt: number;
	updatedAt: number;
}

function nowUnixSeconds(): number {
	return Math.floor(Date.now() / 1000);
}

export async function createProject(
	db: AnyD1Database,
	input: CreateProjectInput,
): Promise<ProjectRecord> {
	const timestamp = nowUnixSeconds();
	const projectId = crypto.randomUUID();

	// TODO: Replace with a real insert once the projects table is created.
	// Suggested schema:
	// CREATE TABLE projects (
	//   id TEXT PRIMARY KEY,
	//   user_id TEXT NOT NULL,
	//   name TEXT NOT NULL,
	//   description TEXT,
	//   created_at INTEGER NOT NULL,
	//   updated_at INTEGER NOT NULL
	// );
	//
	// Example insert:
	// await db
	//   .prepare(
	//     `INSERT INTO projects (id, user_id, name, description, created_at, updated_at)
	//      VALUES (?1, ?2, ?3, ?4, ?5, ?5)`
	//   )
	//   .bind(projectId, input.userId, input.name, input.description, timestamp)
	//   .run();
	void db;

	return {
		id: projectId,
		userId: input.userId,
		name: input.name,
		description: input.description,
		createdAt: timestamp,
		updatedAt: timestamp,
	};
}
