import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const roleEnum = pgEnum("role", ["admin", "user"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: roleEnum("role").default("user").notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userSchema= createSelectSchema(users)

export const userLoginSchema = createInsertSchema(users).pick({
    email: true,
    passwordHash: true,
}).extend({
    email: z.string().email("Invalid email address"),
    passwordHash: z.string().min(6, "Password must be at least 6 characters long"),
})

export const userSignUpSchema = createInsertSchema(users).omit({
    id: true,
    createdAt: true
})

export type User = z.infer<typeof userSchema>
export type NewUser = z.infer<typeof userSignUpSchema>
export type UpdateUser = Partial<z.infer<typeof userSignUpSchema>>;
export type LoginUser = z.infer<typeof userLoginSchema>;
export type SignUpUser = z.infer<typeof userSignUpSchema>;
export type UserById = z.infer<typeof userSchema>;