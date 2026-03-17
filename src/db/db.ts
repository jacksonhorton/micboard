// src/db.ts
import type { AnyD1Database  } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import { integer, sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core";

export type Users = typeof users.$inferSelect;
export type UserIdentities = typeof userIdentities.$inferSelect;

export const users = sqliteTable("users", {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    avatarUrl: text("avatar_url"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const userIdentities = sqliteTable("user_identities", {
    userId: text("user_id").references(() => users.id).notNull(),
    provider: text("provider").notNull(),
    providerUserId: text("provider_user_id").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [
    primaryKey({ columns: [table.provider, table.providerUserId] }),
]);


// export type User = typeof users.$inferSelect;
// export type BaseImage = typeof images.$inferInsert;
// export interface Image extends BaseImage {
//     url: string;
//     lowres_url?: string;
// }
// export interface CollectionWithImages extends Collection {
//     images: Image[]
// }
// export type Collection = typeof collections.$inferSelect;
// export type Session = typeof sessions.$inferSelect;
// export type Portfolio = typeof portfolios.$inferSelect;
// export type PortfolioImage = typeof portfolioImages.$inferSelect;
// export type Invoice = typeof invoices.$inferSelect;
// export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
// export enum InvoiceLineItemStatus {
//     Unpaid = "Unpaid",
//     Paid = "Paid",
//     Partial = "Partial",
//     Voided = "Voided"
// }


// export const sessions = sqliteTable("sessions", {
//     userId: integer("user_id").references(() => users.id).notNull(),
//     sessionId: text("session_id").primaryKey(),
//     sessionName: text("session_name").notNull(),
//     sessionClientName: text("session_client_name").notNull(),
//     accessKey: text("access_key"),
//     coverImageAsset: text("cover_image_asset"),
//     date: text("date")
// });
// export const images = sqliteTable("images", {
//     userId: integer("user_id").references(() => users.id).notNull(),
//     sessionId: text("session_id").references(() => sessions.sessionId).notNull(),
//     r2Filename: text("r2_filename").notNull(),
//     r2LowresFilename: text("r2_lowres_filename"),
//     collectionName: text("collection_name").references(() => collections.collectionName).notNull(),
//     isMetadataStripped: integer("is_metadata_stripped").notNull().default(0),
// });
// export const collections = sqliteTable("collections", {
//     collectionName: text("collection_name").notNull(),
//     sessionId: text("session_id").references(() => sessions.sessionId).notNull(),
//     order: integer("order").notNull().default(0),
//     userId: integer("user_id").references(() => users.id).notNull(),
// }, (table) => [
//     primaryKey({ columns: [table.collectionName, table.sessionId] }),
// ]);
// export const users = sqliteTable("users", {
//     id: integer("id").primaryKey({ autoIncrement: true }),
//     firstName: text("first_name").notNull(),
//     lastName: text("last_name").notNull(),
//     email: text("email").notNull(),
//     passwordHash: text("password_hash"),
//     resetPasswordToken: text("reset_password_token")
// });

// export const portfolios = sqliteTable("portfolios", {
//     id: integer("id").primaryKey({ autoIncrement: true }),
//     name: text("name").notNull(),
//     userId: integer("user_id").references(() => users.id).notNull(),
//     isPrimaryPortfolio: integer("is_primary_portfolio").notNull().default(0)
// })

// export const portfolioImages = sqliteTable("portfolio_images", {
//     r2Filename: text("r2_filename").notNull(),
//     portfolioId: integer("portfolio_id").references(() => portfolios.id).notNull(),
//     order: integer("order").notNull().default(0),
//     userId: integer("user_id").references(() => users.id).notNull(),
//     filename: text("filename").notNull(),
//     r2LowresFilename: text("r2_lowres_filename"),
// })

// export const invoices = sqliteTable("invoices", {
//     invoiceNumber: integer("invoice_number").primaryKey({ autoIncrement: true }),
//     id: text("id").notNull().unique(),
//     userId: integer("user_id").references(() => users.id).notNull(),
//     sessionId: text("session_id").references(() => sessions.sessionId),
//     amountPaidCents: integer("amount_paid_cents").notNull().default(0),
//     accessKey: text("access_key").notNull(),
// })

// export const invoiceLineItems = sqliteTable("invoice_line_items", {
//     id: text("id").primaryKey().notNull(),
//     invoiceId: text("invoice_id").references(() => invoices.id).notNull(),
//     priceCents: integer("price_cents"),
//     paidCents: integer("paid_cents"),
//     taxCode: text("tax_code"),
//     description: text("description").notNull(),
//     discount: text("discount"),
//     status: text("status").notNull(),
//     userId: integer("user_id").references(() => users.id).notNull(),
// })
// export function parseFilenameFromR2Filename(r2Filename: string, sessionId: string) {
//     return String(r2Filename).replace(sessionId + "/", "")
// }

export function createDb(db: AnyD1Database) {
    return drizzle(db);
}
