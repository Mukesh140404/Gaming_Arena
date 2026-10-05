import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

export const games = pgTable("games", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  minPlayers: integer("min_players").notNull(),
  maxPlayers: integer("max_players").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const gameSchema = createSelectSchema(games)

export const gameAddSchema = createInsertSchema(games).omit({
  id:true,
  slug:true,
  createdAt:true
})

export const gameUpdateSchema = gameAddSchema.partial()

export type Game = z.infer<typeof gameSchema>
export type AddGame = z.infer<typeof gameAddSchema>
export type UpdateGame =z.infer<typeof gameUpdateSchema>
