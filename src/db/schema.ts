import { mysqlTable, serial, int, varchar, boolean, json, timestamp } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  uuid: varchar("uuid", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  roles: json("roles").$type<string[]>().default(["user"]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
