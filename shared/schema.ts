import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  // نخليه username موجود (بنستعمله غالبًا كـ email)
  username: text("username").notNull().unique(),

  // ✅ Google login ما يحتاج password
  password: text("password"), // صار nullable

  // ✅ بيانات Google
  googleId: text("google_id").unique(),
  email: text("email").unique(),
  name: text("name"),
  avatarUrl: text("avatar_url"),

  // ✅ هل كمل ملفه؟
  profileCompleted: boolean("profile_completed").notNull().default(false),
});

// هذا للـ signup العادي (لو تبي تخلّيه موجود)
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
