import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Platform } from "react-native";
import {
  getMeetingGrid,
  setMeetingCell,
  setMeetingRange,
  clearMeetingUser,
  getMeetingLabels,
  setMeetingLabel,
  getMeetingUserNames,
  setMeetingUserName,
  setMeetingUserSkip,
  getMeetingDescription,
  setMeetingDescription,
  getMeetingConfig,
  setMeetingConfig,
} from "@workspace/api-client-react";
import type { MeetingCell } from "@workspace/api-client-react";
import { DAYS, HOURS, USERS, USER_NAMES } from "@/constants/colors";

export type GridState = Record<string, Record<number, Record<string, boolean>>>;

const DEFAULT_SKIPPED: Record<string, boolean> = {
  zhenya: false,
  slava: false,
  kurt: false,
};

export interface MeetingConfigType {
  startHour: number;
  startMinute: number;
  halfHourStep: boolean;
}

const DEFAULT_MEETING_CONFIG: MeetingConfigType = {
  startHour: 10,
  startMinute: 0,
  halfHourStep: false,
};

interface AppContextType {
  selectedUser: string | null;
  grid: GridState;
  dayLabels: string[];
  userNames: Record<string, string>;
  userSkipped: Record<string, boolean>;
  description: string;
  meetingConfig: MeetingConfigType;
  selectUser: (userId: string) => void;
  deselectUser: () => void;
  toggleCell: (day: string, hour: number, userId: string, value: boolean) => void;
  colorRange: (day: string, minHour: number, maxHour: number, userId: string) => void;
  clearUserCells: () => void;
  clearAllCells: () => void;
  setDayLabel: (columnIndex: number, label: string) => void;
  setUserName: (userId: string, name: string) => void;
  setUserSkip: (userId: string, skipped: boolean) => void;
  setDescription: (text: string) => void;
  setMeetingConfigFn: (cfg: MeetingConfigType) => void;
  syncing: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const USER_KEY = "@meeting_user_v3";

const userStore = {
  get: (): string | null => {
    try {
      if (Platform.OS === "web") return localStorage.getItem(USER_KEY);
    } catch {}
    return null;
  },
  set: (v: string) => {
    try {
      if (Platform.OS === "web") localStorage.setItem(USER_KEY, v);
    } catch {}
  },
  clear: () => {
    try {
      if (Platform.OS === "web") localStorage.removeItem(USER_KEY);
    } catch {}
  },
};

function initGrid(): GridState {
  const g: GridState = {};
  for (const day of DAYS) {
    g[day] = {};
    for (const hour of HOURS) {
      g[day][hour] = {};
      for (const user of USERS) {
        g[day][hour][user] = false;
      }
    }
  }
  return g;
}

function cellsToGrid(cells: MeetingCell[]): GridState {
  const g = initGrid();
  for (const cell of cells) {
    if (g[cell.day]?.[cell.hour] !== undefined) {
      g[cell.day][cell.hour][cell.userId] = cell.colored;
    }
  }
  return g;
}

const POLL_INTERVAL = 3000;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [grid, setGrid] = useState<GridState>(initGrid);
  const [dayLabels, setDayLabels] = useState<string[]>(DAYS);
  const [userNames, setUserNames] = useState<Record<string, string>>(USER_NAMES);
  const [userSkipped, setUserSkipped] = useState<Record<string, boolean>>(DEFAULT_SKIPPED);
  const [description, setDescriptionState] = useState<string>("This week agenda");
  const [meetingConfig, setMeetingConfigState] = useState<MeetingConfigType>(DEFAULT_MEETING_CONFIG);
  const [syncing, setSyncing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  // Counts writes currently in-flight. The poll skips setGrid while this > 0
  // to prevent stale server responses from clobbering optimistic updates.
  const pendingWrites = useRef(0);

  useEffect(() => {
    const saved = userStore.get();
    if (saved) setSelectedUser(saved);

    Promise.all([getMeetingGrid(), getMeetingLabels(), getMeetingUserNames(), getMeetingDescription(), getMeetingConfig()])
      .then(([gridData, labelData, nameData, descData, cfgData]) => {
        setGrid(cellsToGrid(gridData.cells));
        setDayLabels(labelData.labels);
        setUserNames({ ...USER_NAMES, ...nameData.names });
        setUserSkipped({ ...DEFAULT_SKIPPED, ...nameData.skipped });
        setDescriptionState(descData.description);
        setMeetingConfigState({ startHour: cfgData.startHour, startMinute: cfgData.startMinute, halfHourStep: cfgData.halfHourStep });
      })
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      getMeetingGrid()
        .then((data) => {
          // Skip grid update while a write is in-flight — the write's own
          // response will commit the correct state once it lands.
          if (pendingWrites.current === 0) setGrid(cellsToGrid(data.cells));
        })
        .catch(() => {});
      getMeetingLabels()
        .then((data) => setDayLabels(data.labels))
        .catch(() => {});
      getMeetingUserNames()
        .then((data) => {
          setUserNames({ ...USER_NAMES, ...data.names });
          setUserSkipped({ ...DEFAULT_SKIPPED, ...data.skipped });
        })
        .catch(() => {});
      getMeetingDescription()
        .then((data) => setDescriptionState(data.description))
        .catch(() => {});
      getMeetingConfig()
        .then((data) => setMeetingConfigState({ startHour: data.startHour, startMinute: data.startMinute, halfHourStep: data.halfHourStep }))
        .catch(() => {});
    }, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [loaded]);

  const selectUser = useCallback((userId: string) => {
    setSelectedUser(userId);
    userStore.set(userId);
  }, []);

  const deselectUser = useCallback(() => {
    setSelectedUser(null);
    userStore.clear();
  }, []);

  const toggleCell = useCallback(
    async (day: string, hour: number, userId: string, value: boolean) => {
      // Optimistic update — cell changes instantly in the UI.
      setGrid((prev) => ({
        ...prev,
        [day]: { ...prev[day], [hour]: { ...prev[day]?.[hour], [userId]: value } },
      }));
      pendingWrites.current++;
      try {
        setSyncing(true);
        const data = await setMeetingCell({ day, hour, userId, colored: value });
        setGrid(cellsToGrid(data.cells));
      } catch {
        getMeetingGrid().then((data) => setGrid(cellsToGrid(data.cells))).catch(() => {});
      } finally {
        pendingWrites.current--;
        setSyncing(false);
      }
    },
    []
  );

  const colorRange = useCallback(
    async (day: string, minHour: number, maxHour: number, userId: string) => {
      setGrid((prev) => {
        const next: GridState = { ...prev, [day]: { ...prev[day] } };
        for (const hour of HOURS) {
          if (hour >= minHour && hour <= maxHour) {
            next[day][hour] = { ...prev[day]?.[hour], [userId]: true };
          }
        }
        return next;
      });
      pendingWrites.current++;
      try {
        setSyncing(true);
        const data = await setMeetingRange({ day, minHour, maxHour, userId });
        setGrid(cellsToGrid(data.cells));
      } catch {
        getMeetingGrid().then((data) => setGrid(cellsToGrid(data.cells))).catch(() => {});
      } finally {
        pendingWrites.current--;
        setSyncing(false);
      }
    },
    []
  );

  const clearUserCells = useCallback(async () => {
    if (!selectedUser) return;
    const userId = selectedUser;
    setGrid((prev) => {
      const next: GridState = {};
      for (const day of DAYS) {
        next[day] = {};
        for (const hour of HOURS) {
          next[day][hour] = { ...prev[day]?.[hour], [userId]: false };
        }
      }
      return next;
    });
    pendingWrites.current++;
    try {
      setSyncing(true);
      const data = await clearMeetingUser({ userId });
      setGrid(cellsToGrid(data.cells));
    } catch {
      getMeetingGrid().then((data) => setGrid(cellsToGrid(data.cells))).catch(() => {});
    } finally {
      pendingWrites.current--;
      setSyncing(false);
    }
  }, [selectedUser]);

  const setDayLabel = useCallback(async (columnIndex: number, label: string) => {
    setDayLabels((prev) => {
      const next = [...prev];
      next[columnIndex] = label;
      return next;
    });
    try {
      const data = await setMeetingLabel({ columnIndex, label });
      setDayLabels(data.labels);
    } catch {}
  }, []);

  const setUserNameFn = useCallback(async (userId: string, name: string) => {
    setUserNames((prev) => ({ ...prev, [userId]: name }));
    try {
      const data = await setMeetingUserName({ userId, name });
      setUserNames({ ...USER_NAMES, ...data.names });
      setUserSkipped({ ...DEFAULT_SKIPPED, ...data.skipped });
    } catch {}
  }, []);

  const setMeetingConfigFnCb = useCallback(async (cfg: MeetingConfigType) => {
    setMeetingConfigState(cfg);
    try {
      const data = await setMeetingConfig({ startHour: cfg.startHour, startMinute: cfg.startMinute, halfHourStep: cfg.halfHourStep });
      setMeetingConfigState({ startHour: data.startHour, startMinute: data.startMinute, halfHourStep: data.halfHourStep });
    } catch {}
  }, []);

  const setDescriptionFn = useCallback(async (text: string) => {
    setDescriptionState(text);
    try {
      const data = await setMeetingDescription({ description: text });
      setDescriptionState(data.description);
    } catch {}
  }, []);

  const setUserSkipFn = useCallback(async (userId: string, skipped: boolean) => {
    setUserSkipped((prev) => ({ ...prev, [userId]: skipped }));
    try {
      const data = await setMeetingUserSkip({ userId, skipped });
      setUserNames({ ...USER_NAMES, ...data.names });
      setUserSkipped({ ...DEFAULT_SKIPPED, ...data.skipped });
    } catch {}
  }, []);

  const clearAllCells = useCallback(async () => {
    setGrid(initGrid());
    pendingWrites.current++;
    try {
      setSyncing(true);
      let data = await clearMeetingUser({ userId: USERS[0] });
      data = await clearMeetingUser({ userId: USERS[1] });
      data = await clearMeetingUser({ userId: USERS[2] });
      setGrid(cellsToGrid(data.cells));
    } catch {
      getMeetingGrid().then((data) => setGrid(cellsToGrid(data.cells))).catch(() => {});
    } finally {
      pendingWrites.current--;
      setSyncing(false);
    }
  }, []);

  if (!loaded) return null;

  return (
    <AppContext.Provider
      value={{
        selectedUser,
        grid,
        dayLabels,
        userNames,
        userSkipped,
        description,
        meetingConfig,
        selectUser,
        deselectUser,
        toggleCell,
        colorRange,
        clearUserCells,
        clearAllCells,
        setDayLabel,
        setUserName: setUserNameFn,
        setUserSkip: setUserSkipFn,
        setDescription: setDescriptionFn,
        setMeetingConfigFn: setMeetingConfigFnCb,
        syncing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext outside AppProvider");
  return ctx;
}
