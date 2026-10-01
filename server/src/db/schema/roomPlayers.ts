import {
  pgTable,
  uuid,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

import { rooms } from "./rooms.js";
import { users } from "./users.js";

export const playerRole = pgEnum("player_role", [
  "host",
  "player",
]);

export const playerStatus = pgEnum("player_status", [
  "active",
  "left",
]);

export const roomPlayers = pgTable("room_players", {
  id: uuid("id").defaultRandom().primaryKey(),

  roomId: uuid("room_id")
    .notNull()
    .references(() => rooms.id),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),

  role: playerRole("role").default("player").notNull(),

  status: playerStatus("status").default("active").notNull(),

  joinedAt: timestamp("joined_at").defaultNow().notNull(),

  leftAt: timestamp("left_at"),
});