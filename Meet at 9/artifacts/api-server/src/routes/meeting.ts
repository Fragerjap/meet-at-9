import { Router } from "express";
import { db } from "@workspace/db";
import { meetingCellsTable, meetingLabelsTable, meetingUserNamesTable, meetingDescriptionTable, meetingConfigTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const DAYS = ["среда", "четверг", "пятница"];
const HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const USERS = ["zhenya", "slava", "kurt"];

const NUM_COLUMNS = 3;
const DEFAULT_LABELS = ["среда", "четверг", "пятница"];
const DEFAULT_NAMES: Record<string, string> = {
  zhenya: "Dwarf",
  slava: "Elf",
  kurt: "Satyr",
};

async function getAllUserNames(): Promise<{ names: Record<string, string>; skipped: Record<string, boolean> }> {
  const rows = await db.select().from(meetingUserNamesTable);
  const names = { ...DEFAULT_NAMES };
  const skipped: Record<string, boolean> = { zhenya: false, slava: false, kurt: false };
  for (const row of rows) {
    if (USERS.includes(row.userId)) {
      names[row.userId] = row.name;
      skipped[row.userId] = row.skipped;
    }
  }
  return { names, skipped };
}

async function getAllLabels(): Promise<string[]> {
  const rows = await db.select().from(meetingLabelsTable);
  const labels = [...DEFAULT_LABELS];
  for (const row of rows) {
    if (row.columnIndex >= 0 && row.columnIndex < NUM_COLUMNS) {
      labels[row.columnIndex] = row.label;
    }
  }
  return labels;
}

async function getAllCells() {
  const rows = await db.select().from(meetingCellsTable);
  return rows.map((r) => ({
    day: r.day,
    hour: r.hour,
    userId: r.userId,
    colored: r.colored,
  }));
}

const CONFIG_KEY = "main";
const DEFAULT_CONFIG = { startHour: 10, startMinute: 0, halfHourStep: false };

async function getConfig() {
  const rows = await db.select().from(meetingConfigTable).where(eq(meetingConfigTable.key, CONFIG_KEY));
  const row = rows[0];
  return row
    ? { startHour: row.startHour, startMinute: row.startMinute, halfHourStep: row.halfHourStep }
    : DEFAULT_CONFIG;
}

router.get("/meeting/config", async (req, res) => {
  res.json(await getConfig());
});

const setConfigSchema = z.object({
  startHour: z.number().int().min(0).max(23),
  startMinute: z.number().int().min(0).max(59),
  halfHourStep: z.boolean(),
});

router.post("/meeting/config", async (req, res) => {
  const parsed = setConfigSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { startHour, startMinute, halfHourStep } = parsed.data;
  await db
    .insert(meetingConfigTable)
    .values({ key: CONFIG_KEY, startHour, startMinute, halfHourStep })
    .onConflictDoUpdate({
      target: [meetingConfigTable.key],
      set: { startHour, startMinute, halfHourStep },
    });
  res.json(await getConfig());
});

const DEFAULT_DESCRIPTION = "This week agenda";
const DESCRIPTION_KEY = "main";

async function getDescription(): Promise<string> {
  const rows = await db.select().from(meetingDescriptionTable).where(eq(meetingDescriptionTable.key, DESCRIPTION_KEY));
  return rows[0]?.value ?? DEFAULT_DESCRIPTION;
}

router.get("/meeting/description", async (req, res) => {
  res.json({ description: await getDescription() });
});

const setDescriptionSchema = z.object({
  description: z.string().max(200),
});

router.post("/meeting/description", async (req, res) => {
  const parsed = setDescriptionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  await db
    .insert(meetingDescriptionTable)
    .values({ key: DESCRIPTION_KEY, value: parsed.data.description })
    .onConflictDoUpdate({
      target: [meetingDescriptionTable.key],
      set: { value: parsed.data.description },
    });
  res.json({ description: await getDescription() });
});

router.get("/meeting/user-names", async (req, res) => {
  const result = await getAllUserNames();
  res.json(result);
});

const setUserNameSchema = z.object({
  userId: z.string(),
  name: z.string().min(1).max(40),
});

router.post("/meeting/user-name", async (req, res) => {
  const parsed = setUserNameSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { userId, name } = parsed.data;
  if (!USERS.includes(userId)) {
    res.status(400).json({ error: "Unknown user" });
    return;
  }

  await db
    .insert(meetingUserNamesTable)
    .values({ userId, name, skipped: false })
    .onConflictDoUpdate({
      target: [meetingUserNamesTable.userId],
      set: { name },
    });

  res.json(await getAllUserNames());
});

const setUserSkipSchema = z.object({
  userId: z.string(),
  skipped: z.boolean(),
});

router.post("/meeting/user-skip", async (req, res) => {
  const parsed = setUserSkipSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { userId, skipped } = parsed.data;
  if (!USERS.includes(userId)) {
    res.status(400).json({ error: "Unknown user" });
    return;
  }

  await db
    .insert(meetingUserNamesTable)
    .values({ userId, name: DEFAULT_NAMES[userId], skipped })
    .onConflictDoUpdate({
      target: [meetingUserNamesTable.userId],
      set: { skipped },
    });

  res.json(await getAllUserNames());
});

router.get("/meeting/labels", async (req, res) => {
  const labels = await getAllLabels();
  res.json({ labels });
});

const setLabelSchema = z.object({
  columnIndex: z.number().int().min(0).max(2),
  label: z.string(),
});

router.post("/meeting/label", async (req, res) => {
  const parsed = setLabelSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { columnIndex, label } = parsed.data;

  await db
    .insert(meetingLabelsTable)
    .values({ columnIndex, label })
    .onConflictDoUpdate({
      target: [meetingLabelsTable.columnIndex],
      set: { label },
    });

  res.json({ labels: await getAllLabels() });
});

router.get("/meeting/grid", async (req, res) => {
  const cells = await getAllCells();
  res.json({ cells });
});

const setCellSchema = z.object({
  day: z.string(),
  hour: z.number().int(),
  userId: z.string(),
  colored: z.boolean(),
});

router.post("/meeting/cell", async (req, res) => {
  const parsed = setCellSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { day, hour, userId, colored } = parsed.data;

  await db
    .insert(meetingCellsTable)
    .values({ day, hour, userId, colored })
    .onConflictDoUpdate({
      target: [meetingCellsTable.day, meetingCellsTable.hour, meetingCellsTable.userId],
      set: { colored, updatedAt: new Date() },
    });

  res.json({ cells: await getAllCells() });
});

const setRangeSchema = z.object({
  day: z.string(),
  minHour: z.number().int(),
  maxHour: z.number().int(),
  userId: z.string(),
});

router.post("/meeting/range", async (req, res) => {
  const parsed = setRangeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { day, minHour, maxHour, userId } = parsed.data;

  const hours = HOURS.filter((h) => h >= minHour && h <= maxHour);
  const values = hours.map((hour) => ({ day, hour, userId, colored: true }));

  for (const v of values) {
    await db
      .insert(meetingCellsTable)
      .values(v)
      .onConflictDoUpdate({
        target: [meetingCellsTable.day, meetingCellsTable.hour, meetingCellsTable.userId],
        set: { colored: true, updatedAt: new Date() },
      });
  }

  res.json({ cells: await getAllCells() });
});

const clearUserSchema = z.object({
  userId: z.string(),
});

router.post("/meeting/clear", async (req, res) => {
  const parsed = clearUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { userId } = parsed.data;

  await db
    .update(meetingCellsTable)
    .set({ colored: false, updatedAt: new Date() })
    .where(eq(meetingCellsTable.userId, userId));

  res.json({ cells: await getAllCells() });
});

export default router;
