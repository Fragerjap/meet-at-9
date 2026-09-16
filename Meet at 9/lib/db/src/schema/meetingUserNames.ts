import { pgTable, text, boolean } from "drizzle-orm/pg-core";

export const meetingUserNamesTable = pgTable("meeting_user_names", {
  userId: text("user_id").primaryKey(),
  name: text("name").notNull(),
  skipped: boolean("skipped").notNull().default(false),
});

export type MeetingUserName = typeof meetingUserNamesTable.$inferSelect;
