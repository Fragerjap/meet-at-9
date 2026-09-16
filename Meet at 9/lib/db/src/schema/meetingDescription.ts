import { pgTable, text } from "drizzle-orm/pg-core";

export const meetingDescriptionTable = pgTable("meeting_description", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type MeetingDescription = typeof meetingDescriptionTable.$inferSelect;
