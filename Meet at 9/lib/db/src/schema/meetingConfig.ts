import { pgTable, text, integer, boolean } from "drizzle-orm/pg-core";

export const meetingConfigTable = pgTable("meeting_config", {
  key: text("key").primaryKey(),
  startHour: integer("start_hour").notNull().default(10),
  startMinute: integer("start_minute").notNull().default(0),
  halfHourStep: boolean("half_hour_step").notNull().default(false),
});

export type MeetingConfig = typeof meetingConfigTable.$inferSelect;
