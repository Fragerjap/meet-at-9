import { pgTable, integer, text } from "drizzle-orm/pg-core";

export const meetingLabelsTable = pgTable("meeting_labels", {
  columnIndex: integer("column_index").primaryKey(),
  label: text("label").notNull().default(""),
});

export type MeetingLabel = typeof meetingLabelsTable.$inferSelect;
