import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, boolean, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * お気に入り銘柄テーブル
 */
export const favorites = mysqlTable("favorites", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  name: text("name"),
  market: varchar("market", { length: 50 }),
  industry: varchar("industry", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  codeIdx: index("code_idx").on(table.code),
}));

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

/**
 * ユーザー設定テーブル
 */
export const userSettings = mysqlTable("userSettings", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).notNull().unique(),
  sma1: int("sma1").default(5),
  sma2: int("sma2").default(25),
  sma3: int("sma3").default(75),
  playbackSpeed: int("playbackSpeed").default(1000), // milliseconds
  showVolume: boolean("showVolume").default(true),
  logScale: boolean("logScale").default(false),
  theme: varchar("theme", { length: 20 }).default("dark"),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type UserSetting = typeof userSettings.$inferSelect;
export type InsertUserSetting = typeof userSettings.$inferInsert;

