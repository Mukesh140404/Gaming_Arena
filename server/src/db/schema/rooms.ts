import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

import { games } from "./games";
import { users } from "./users";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

export const roomVisibility = pgEnum("room_visibility", [
  "public",
  "private",
]);

export const roomStatus = pgEnum("room_status", [
  "waiting",
  "started",
  "finished",
]);

export const rooms = pgTable("rooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  roomCode: varchar("room_code", { length: 20 }).notNull().unique(),
  gameId: uuid("game_id")
    .notNull()
    .references(() => games.id),
  hostId: uuid("host_id")
    .notNull()
    .references(() => users.id),
  name: varchar("name", { length: 100 }).notNull(),
  visibility: roomVisibility("visibility").default("public").notNull(),
  passwordHash: varchar("password_hash", { length: 255 }),
  status: roomStatus("status").default("waiting").notNull(),
  maxPlayers: integer("max_players").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),
});

export const roomSchema = createSelectSchema(rooms)

export const createRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true,
  startedAt: true,
  finishedAt: true,
  status: true,
  hostId: true,
})

export const updateRoomSchema = createInsertSchema(rooms).partial().pick({
  status:true,
  startedAt:true,
  finishedAt:true
})

export type Room = z.infer<typeof roomSchema>
export type CreateRoom = z.infer<typeof createRoomSchema>
export type UpdateRoom = z.infer<typeof updateRoomSchema>