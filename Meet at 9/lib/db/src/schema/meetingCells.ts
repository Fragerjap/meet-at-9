import { pgTable, text, integer, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";

export const meetingCellsTable = pgTable(
  "meeting_cells",
  {
    day: text("day").notNull(),
    hour: integer("hour").notNull(),
    userId: text("user_id").notNull(),
    colored: boolean("colored").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [primaryKey({ columns: [table.day, table.hour, table.userId] })]
);

export type MeetingCell = typeof meetingCellsTable.$inferSelect;
