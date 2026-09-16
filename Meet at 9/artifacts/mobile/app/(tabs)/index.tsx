import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  PanResponder,
  Platform,
  Modal,
  ScrollView,
  TextInput,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { useAppContext } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";
import {
  USER_COLORS,
  USER_COLORS_LIGHT,
  USER_INITIALS,
  USERS,
  DAYS,
  HOURS,
} from "@/constants/colors";

const WHEEL_OPTIONS = [
  "понедельник", "вторник", "среда", "четверг", "пятница",
  "суббота", "воскресенье", "",
];
const WHEEL_ITEM_H = 46;
const WHEEL_VISIBLE = 5;

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i));
const MINUTE_OPTIONS = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

function slotLabel(startHour: number, startMinute: number, halfHourStep: boolean, slotIndex: number): string {
  const stepMins = halfHourStep ? 30 : 60;
  const totalMins = startHour * 60 + startMinute + slotIndex * stepMins;
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

function WheelPicker({
  value,
  onSelect,
  options,
  width = 96,
}: {
  value: string;
  onSelect: (v: string) => void;
  options?: string[];
  width?: number;
}) {
  const c = useColors();
  const opts = options ?? WHEEL_OPTIONS;
  const scrollRef = useRef<ScrollView>(null);
  // Track scroll position so the web wheel handler can compute the next Y.
  const scrollY = useRef(0);
  const [activeIdx, setActiveIdx] = useState(() => {
    const i = opts.indexOf(value);
    return i >= 0 ? i : 0;
  });
  const lastEmittedIdx = useRef(-1);
  // Stable unique ID used to attach the DOM wheel listener on web.
  const containerId = useRef(`whl-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    const y = activeIdx * WHEEL_ITEM_H;
    scrollY.current = y;
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y, animated: false });
    }, 50);
  }, []);

  const handleScroll = useCallback(
    (y: number) => {
      scrollY.current = y;
      const i = Math.max(0, Math.min(opts.length - 1, Math.round(y / WHEEL_ITEM_H)));
      if (i !== lastEmittedIdx.current) {
        lastEmittedIdx.current = i;
        setActiveIdx(i);
        onSelect(opts[i]);
      }
    },
    [onSelect, opts],
  );

  // Desktop: capture mouse-wheel events and forward them to the scroll view.
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const el = document.getElementById(containerId);
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const maxY = (opts.length - 1) * WHEEL_ITEM_H;
      const next = Math.max(0, Math.min(maxY, scrollY.current + e.deltaY));
      scrollRef.current?.scrollTo({ y: next, animated: true });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [containerId, opts.length]);

  return (
    <View
      nativeID={containerId}
      style={[wheelStyles.container, { width, overflow: "hidden" }]}
    >
      <View
        style={[
          wheelStyles.highlight,
          {
            backgroundColor: c.isDark ? "rgba(139, 132, 255, 0.12)" : "rgba(108, 99, 255, 0.08)",
            borderColor: c.primary,
          },
        ]}
        pointerEvents="none"
      />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={WHEEL_ITEM_H}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={(e) => handleScroll(e.nativeEvent.contentOffset.y)}
        onMomentumScrollEnd={(e) => handleScroll(e.nativeEvent.contentOffset.y)}
        onScrollEndDrag={(e) => handleScroll(e.nativeEvent.contentOffset.y)}
        contentContainerStyle={{ paddingVertical: Math.floor(WHEEL_VISIBLE / 2) * WHEEL_ITEM_H }}
      >
        {opts.map((opt, i) => (
          <TouchableOpacity
            key={i}
            style={wheelStyles.item}
            onPress={() => {
              scrollRef.current?.scrollTo({ y: i * WHEEL_ITEM_H, animated: true });
              setActiveIdx(i);
              onSelect(opt);
            }}
            activeOpacity={0.7}
          >
            <Text
              selectable={false}
              style={[
                wheelStyles.itemText,
                { color: c.isDark ? "#5A5878" : "#B0AECF" },
                i === activeIdx && { color: c.primary, fontWeight: "700", fontFamily: "Inter_700Bold", fontSize: 18 },
              ]}
            >
              {opt || "—"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const wheelStyles = StyleSheet.create({
  container: {
    height: WHEEL_VISIBLE * WHEEL_ITEM_H,
    position: "relative",
  },
  highlight: {
    position: "absolute",
    top: Math.floor(WHEEL_VISIBLE / 2) * WHEEL_ITEM_H,
    left: 0,
    right: 0,
    height: WHEEL_ITEM_H,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    zIndex: 1,
  },
  item: {
    height: WHEEL_ITEM_H,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    fontSize: 17,
    fontFamily: "Inter_400Regular",
  },
});

function NameEditModal({
  userId,
  currentName,
  onSave,
  onClose,
}: {
  userId: string;
  currentName: string;
  onSave: (name: string) => void;
  onClose: () => void;
}) {
  const c = useColors();
  const [text, setText] = useState(currentName);
  const color = USER_COLORS[userId] ?? "#6C63FF";
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={[modalSt.overlay]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[modalSt.card, { backgroundColor: c.card }]}>
          <Text selectable={false} style={[modalSt.title, { color: c.text }]}>Имя участника</Text>
          <View style={[modalSt.nameInputWrap, { borderColor: color }]}>
            <TextInput
              style={[modalSt.nameInput, { color }]}
              value={text}
              onChangeText={setText}
              maxLength={20}
              autoFocus
              selectTextOnFocus
              returnKeyType="done"
              onSubmitEditing={() => {
                const trimmed = text.trim();
                if (trimmed) onSave(trimmed);
                onClose();
              }}
            />
          </View>
          <TouchableOpacity
            style={[modalSt.done, { backgroundColor: color }]}
            onPress={() => {
              const trimmed = text.trim();
              if (trimmed) onSave(trimmed);
              onClose();
            }}
            activeOpacity={0.8}
          >
            <Text selectable={false} style={modalSt.doneText}>Сохранить</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

import type { MeetingConfigType } from "@/context/AppContext";

function TimePickerModal({
  config,
  onSave,
  onClose,
}: {
  config: MeetingConfigType;
  onSave: (cfg: MeetingConfigType) => void;
  onClose: () => void;
}) {
  const c = useColors();
  const [localHour, setLocalHour] = useState(config.startHour);
  const [localMinute, setLocalMinute] = useState(config.startMinute);
  const [localHalfHour, setLocalHalfHour] = useState(config.halfHourStep);

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={modalSt.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[modalSt.card, { backgroundColor: c.card }]}>
          <Text selectable={false} style={[modalSt.title, { color: c.text }]}>Время начала</Text>

          <View style={timePickerSt.pickerRow}>
            <WheelPicker
              value={String(localHour)}
              options={HOUR_OPTIONS}
              onSelect={(v) => setLocalHour(parseInt(v, 10))}
            />
            <Text selectable={false} style={[timePickerSt.colon, { color: c.primary }]}>:</Text>
            <WheelPicker
              value={localMinute.toString().padStart(2, "0")}
              options={MINUTE_OPTIONS}
              onSelect={(v) => setLocalMinute(parseInt(v, 10))}
            />
          </View>

          <TouchableOpacity
            style={timePickerSt.checkRow}
            onPress={() => setLocalHalfHour((v) => !v)}
            activeOpacity={0.7}
          >
            <View style={[
              timePickerSt.checkbox,
              { borderColor: c.border, backgroundColor: c.card },
              localHalfHour && { borderColor: c.primary, backgroundColor: c.primary },
            ]}>
              {localHalfHour && <Text selectable={false} style={timePickerSt.checkmark}>✓</Text>}
            </View>
            <Text selectable={false} style={[timePickerSt.checkLabel, { color: c.mutedForeground }]}>
              30-минутный шаг
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[modalSt.done, { backgroundColor: c.primary }]}
            onPress={() => { onSave({ startHour: localHour, startMinute: localMinute, halfHourStep: localHalfHour }); onClose(); }}
            activeOpacity={0.8}
          >
            <Text selectable={false} style={modalSt.doneText}>Готово</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const timePickerSt = StyleSheet.create({
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  colon: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    lineHeight: 16,
  },
  checkLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});

// Shared modal styles (colors applied inline)
const modalSt = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.50)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: 280,
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
    gap: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  done: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  doneText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  nameInputWrap: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  nameInput: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    textAlign: "center",
  },
});

const CELL_H = 34;
const HEADER_DAY_H = 28;
const HEADER_INIT_H = 24;
const HEADER_H = HEADER_DAY_H + HEADER_INIT_H;
const TIME_W = 46;
const SUB_W = 30;
const CELL_MARGIN = 0.5;
const DAY_W = 3 * (SUB_W + CELL_MARGIN * 2);
const DAY_GAP = 8;
const DAY_BLOCK = DAY_W + DAY_GAP;

export default function MainScreen() {
  const { selectedUser } = useAppContext();
  return selectedUser ? <GridScreen /> : <PickerScreen />;
}

function PickerScreen() {
  const { selectUser, userNames, setUserName } = useAppContext();
  const { isDark, toggleTheme } = useTheme();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [editingUser, setEditingUser] = useState<string | null>(null);

  const handlePick = (userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    selectUser(userId);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.background,
        paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
        paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0),
        paddingHorizontal: 24,
        ...(Platform.OS === "web" ? ({ userSelect: "none" } as object) : {}),
      }}
    >
      {/* ── Logo at top ── */}
      <View style={{ alignItems: "center", paddingTop: 28 }}>
        <Text
          selectable={false}
          style={{
            fontSize: 54,
            fontFamily: "DancingScript_700Bold",
            color: c.primary,
            lineHeight: 68,
            letterSpacing: 0.5,
          }}
        >
          Meet at 9
        </Text>
      </View>

      {/* ── Centre: greeting + user blocks ── */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 0 }}>
        <Text
          selectable={false}
          style={{
            fontSize: 44,
            fontWeight: "700",
            fontFamily: "Inter_700Bold",
            color: c.text,
            marginBottom: 8,
          }}
        >
          Привет!
        </Text>
        <Text
          selectable={false}
          style={{
            fontSize: 16,
            color: c.mutedForeground,
            fontFamily: "Inter_400Regular",
            marginBottom: 6,
            textAlign: "center",
          }}
        >
          Выбери свой цвет для встречи
        </Text>
        <Text
          selectable={false}
          style={{
            fontSize: 12,
            color: isDark ? "#5A5878" : "#B0AECF",
            fontFamily: "Inter_400Regular",
            marginBottom: 44,
            textAlign: "center",
          }}
        >
          Долгое нажатие — переименовать
        </Text>

        <View style={{ flexDirection: "row", gap: 16 }}>
          {USERS.map((uid) => (
            <TouchableOpacity
              key={uid}
              style={{
                width: 94,
                height: 118,
                borderRadius: 22,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: USER_COLORS[uid],
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: isDark ? 0.45 : 0.18,
                shadowRadius: 14,
                elevation: 8,
              }}
              onPress={() => handlePick(uid)}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setEditingUser(uid);
              }}
              delayLongPress={450}
              activeOpacity={0.8}
            >
              <Text
                selectable={false}
                style={{
                  fontSize: 19,
                  fontWeight: "700",
                  color: "#fff",
                  fontFamily: "Inter_700Bold",
                }}
              >
                {userNames[uid]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Bottom: dark/light theme toggle ── */}
      <View style={{ alignItems: "center", paddingBottom: 20 }}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            toggleTheme();
          }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingHorizontal: 24,
            paddingVertical: 11,
            borderRadius: 28,
            backgroundColor: isDark ? "#1E1A35" : "#F0EEFF",
            borderWidth: 1.5,
            borderColor: isDark ? "#2A2744" : "#E2E0F5",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.06,
            shadowRadius: 6,
            elevation: 2,
          }}
          activeOpacity={0.7}
        >
          {/* icon switches: moon means "go dark", sun means "go light" */}
          <Text style={{ fontSize: 22, lineHeight: 26 }}>
            {isDark ? "☀️" : "🌙"}
          </Text>
          <Text
            selectable={false}
            style={{
              fontSize: 13,
              fontFamily: "Inter_500Medium",
              color: isDark ? "#8A8DAA" : "#7A7D9C",
              letterSpacing: 0.1,
            }}
          >
            {isDark ? "Светлая тема" : "Тёмная тема"}
          </Text>
        </TouchableOpacity>
      </View>

      {editingUser !== null && (
        <NameEditModal
          userId={editingUser}
          currentName={userNames[editingUser]}
          onSave={(name) => setUserName(editingUser, name)}
          onClose={() => setEditingUser(null)}
        />
      )}
    </View>
  );
}

function GridScreen() {
  const {
    selectedUser,
    grid,
    dayLabels,
    userNames,
    userSkipped,
    description,
    meetingConfig,
    setUserName,
    deselectUser,
    toggleCell,
    colorRange,
    clearUserCells,
    clearAllCells,
    setDayLabel,
    setUserSkip,
    setDescription,
    setMeetingConfigFn,
  } = useAppContext();

  const c = useColors();
  const [descDraft, setDescDraft] = useState(description);

  useEffect(() => {
    setDescDraft(description);
  }, [description]);
  const insets = useSafeAreaInsets();

  const [clearCount, setClearCount] = useState(0);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [editingColumn, setEditingColumn] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editingStartTime, setEditingStartTime] = useState(false);

  const gridViewRef = useRef<View>(null);
  const gridPX = useRef(0);
  const gridPY = useRef(0);

  const selectedUserRef = useRef(selectedUser);
  selectedUserRef.current = selectedUser;
  const gridRef = useRef(grid);
  gridRef.current = grid;
  const toggleCellRef = useRef(toggleCell);
  toggleCellRef.current = toggleCell;
  const colorRangeRef = useRef(colorRange);
  colorRangeRef.current = colorRange;

  const dragActive = useRef(false);
  const dragDay = useRef(-1);
  const dragUser = useRef(-1);
  const dragStartHour = useRef(-1);
  const dragEndHour = useRef(-1);

  const [dragState, setDragState] = useState<{
    dayIndex: number;
    userIndex: number;
    startHour: number;
    endHour: number;
  } | null>(null);

  const measureGrid = useCallback(() => {
    gridViewRef.current?.measure((_x, _y, _w, _h, px, py) => {
      gridPX.current = px;
      gridPY.current = py;
    });
  }, []);

  const touchToCell = useCallback((pageX: number, pageY: number) => {
    const lx = pageX - gridPX.current;
    const ly = pageY - gridPY.current - HEADER_H;
    if (lx < TIME_W || ly < 0) return null;
    const hi = Math.floor(ly / CELL_H);
    if (hi < 0 || hi >= HOURS.length) return null;
    const lxT = lx - TIME_W;
    const di = Math.floor(lxT / DAY_BLOCK);
    if (di < 0 || di >= DAYS.length) return null;
    const lxD = lxT - di * DAY_BLOCK;
    if (lxD >= DAY_W) return null;
    const ui = Math.floor(lxD / SUB_W);
    if (ui < 0 || ui >= USERS.length) return null;
    return { di, hi, ui };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dy) > 4 || Math.abs(gs.dx) > 4,

      onPanResponderGrant(evt) {
        const { pageX, pageY } = evt.nativeEvent;
        const cell = touchToCell(pageX, pageY);
        if (!cell) return;
        const su = selectedUserRef.current;
        if (!su || USERS[cell.ui] !== su) return;

        dragActive.current = true;
        dragDay.current = cell.di;
        dragUser.current = cell.ui;
        dragStartHour.current = cell.hi;
        dragEndHour.current = cell.hi;

        setDragState({
          dayIndex: cell.di,
          userIndex: cell.ui,
          startHour: cell.hi,
          endHour: cell.hi,
        });
      },

      onPanResponderMove(evt) {
        if (!dragActive.current) return;
        const { pageY } = evt.nativeEvent;
        const ly = pageY - gridPY.current - HEADER_H;
        const hi = Math.max(
          0,
          Math.min(HOURS.length - 1, Math.floor(ly / CELL_H))
        );
        if (hi !== dragEndHour.current) {
          dragEndHour.current = hi;
          Haptics.selectionAsync();
          setDragState((prev) =>
            prev ? { ...prev, endHour: hi } : null
          );
        }
      },

      onPanResponderRelease(evt) {
        if (!dragActive.current) {
          setDragState(null);
          return;
        }
        const su = selectedUserRef.current;
        if (!su) {
          dragActive.current = false;
          setDragState(null);
          return;
        }

        const day = DAYS[dragDay.current];
        const sh = dragStartHour.current;
        const eh = dragEndHour.current;

        if (sh === eh) {
          const current =
            gridRef.current[day]?.[HOURS[sh]]?.[su] ?? false;
          toggleCellRef.current(day, HOURS[sh], su, !current);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          const minH = Math.min(sh, eh);
          const maxH = Math.max(sh, eh);
          colorRangeRef.current(
            day,
            HOURS[minH],
            HOURS[maxH],
            su
          );
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        dragActive.current = false;
        dragDay.current = -1;
        dragUser.current = -1;
        dragStartHour.current = -1;
        dragEndHour.current = -1;
        setDragState(null);
      },

      onPanResponderTerminate() {
        dragActive.current = false;
        setDragState(null);
      },
    })
  ).current;

  const handleClear = () => {
    const next = clearCount + 1;
    if (clearTimer.current) clearTimeout(clearTimer.current);
    if (next >= 10) {
      clearAllCells();
      USERS.forEach((uid) => setUserSkip(uid, false));
      setClearCount(0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (next === 5) {
      clearUserCells();
      setUserSkip(su, false);
      setClearCount(5);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      clearTimer.current = setTimeout(() => setClearCount(0), 4000);
    } else {
      if (next === 1) {
        setUserSkip(su, true);
      }
      setClearCount(next);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      clearTimer.current = setTimeout(() => setClearCount(0), 4000);
    }
  };

  const isAllColored = (di: number, hi: number) => {
    const day = DAYS[di];
    const hour = HOURS[hi];
    return USERS.every((u) => grid[day]?.[hour]?.[u]);
  };

  const inDragRange = (di: number, hi: number, ui: number) => {
    if (!dragState) return false;
    if (dragState.dayIndex !== di || dragState.userIndex !== ui) return false;
    const mn = Math.min(dragState.startHour, dragState.endHour);
    const mx = Math.max(dragState.startHour, dragState.endHour);
    return hi >= mn && hi <= mx;
  };

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const su = selectedUser!;

  // Theme-aware cell empty backgrounds
  const cellBgOwn    = c.isDark ? "#1E1A35" : "#F0EEFF";
  const cellBgOther  = c.isDark ? "#18162E" : "#F5F5FA";
  const cellBgAll    = c.isDark ? "#2D2460" : "#EDE9FE";

  return (
    <View
      style={[
        gridSt.screen,
        { backgroundColor: c.background, paddingTop: topPad, paddingBottom: botPad },
      ]}
    >
      {/* Meeting description */}
      <TextInput
        style={[
          gridSt.descInput,
          { color: c.mutedForeground, borderColor: c.border },
        ]}
        value={descDraft}
        onChangeText={setDescDraft}
        onBlur={() => {
          setDescription(descDraft);
          Keyboard.dismiss();
        }}
        onSubmitEditing={() => {
          setDescription(descDraft);
          Keyboard.dismiss();
        }}
        returnKeyType="done"
        selectTextOnFocus
        multiline={false}
        maxLength={120}
      />

      {/* User badge */}
      <View style={gridSt.userBar}>
        <View style={[gridSt.userDot, { backgroundColor: USER_COLORS[su] }]} />
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setEditingUser(su);
          }}
          activeOpacity={0.7}
        >
          <Text selectable={false} style={[gridSt.userBarText, { color: c.text }]}>{userNames[su]}</Text>
        </TouchableOpacity>
        <Text selectable={false} style={[gridSt.userBarHint, { color: c.mutedForeground }]}>
          {" "}— тапай/тяни своё свободное время
        </Text>
      </View>

      {/* Grid */}
      <View
        ref={gridViewRef}
        onLayout={measureGrid}
        style={[gridSt.grid, Platform.OS === "web" && ({ userSelect: "none" } as object)]}
        {...panResponder.panHandlers}
      >
        {/* Header row 1: day names */}
        <View style={gridSt.hRow1}>
          <View style={{ width: TIME_W }} />
          {DAYS.map((day, di) => (
            <React.Fragment key={day}>
              <TouchableOpacity
                style={[gridSt.dayHdr, { width: DAY_W, backgroundColor: c.primary }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setEditingColumn(di);
                }}
                activeOpacity={0.75}
              >
                <Text selectable={false} style={gridSt.dayHdrText} numberOfLines={1} adjustsFontSizeToFit>
                  {dayLabels[di] || "—"}
                </Text>
              </TouchableOpacity>
              {di < DAYS.length - 1 && <View style={{ width: DAY_GAP }} />}
            </React.Fragment>
          ))}
        </View>

        {/* Header row 2: user initials */}
        <View style={gridSt.hRow2}>
          <View style={{ width: TIME_W }} />
          {DAYS.map((day, di) => (
            <React.Fragment key={day}>
              {USERS.map((uid) => (
                <View
                  key={uid}
                  style={[
                    gridSt.initCell,
                    { width: SUB_W, margin: CELL_MARGIN, backgroundColor: USER_COLORS_LIGHT[uid] },
                  ]}
                >
                  <Text selectable={false} style={[gridSt.initText, { color: USER_COLORS[uid] }]}>
                    {(userNames[uid]?.[0] ?? USER_INITIALS[uid]).toUpperCase()}
                  </Text>
                </View>
              ))}
              {di < DAYS.length - 1 && <View style={{ width: DAY_GAP }} />}
            </React.Fragment>
          ))}
        </View>

        {/* Data rows */}
        {HOURS.map((hour, hi) => (
          <View key={hour} style={gridSt.dataRow}>
            {hi === 0 ? (
              <TouchableOpacity
                style={[gridSt.timeCell, { height: CELL_H }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setEditingStartTime(true);
                }}
                activeOpacity={0.7}
              >
                <Text selectable={false} style={[gridSt.timeText, gridSt.timeTextFirst, { color: c.primary }]}>
                  {slotLabel(meetingConfig.startHour, meetingConfig.startMinute, meetingConfig.halfHourStep, hi)}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={[gridSt.timeCell, { height: CELL_H }]}>
                <Text selectable={false} style={[gridSt.timeText, { color: c.mutedForeground }]}>
                  {slotLabel(meetingConfig.startHour, meetingConfig.startMinute, meetingConfig.halfHourStep, hi)}
                </Text>
              </View>
            )}

            {DAYS.map((day, di) => {
              const allFull = isAllColored(di, hi);
              return (
                <React.Fragment key={day}>
                  {USERS.map((uid, ui) => {
                    const colored = grid[day]?.[hour]?.[uid] ?? false;
                    const dragging = inDragRange(di, hi, ui);
                    const isOwn = uid === su;
                    const filled = colored || dragging;
                    const bg = filled
                      ? USER_COLORS[uid]
                      : allFull
                      ? cellBgAll
                      : isOwn
                      ? cellBgOwn
                      : cellBgOther;
                    const bd = allFull
                      ? "#7C3AED"
                      : filled
                      ? USER_COLORS[uid]
                      : c.border;
                    return (
                      <View
                        key={uid}
                        style={[
                          gridSt.cell,
                          {
                            width: SUB_W,
                            height: CELL_H,
                            backgroundColor: bg,
                            borderColor: bd,
                            borderWidth: allFull ? 1.5 : 0.5,
                          },
                        ]}
                      >
                        {userSkipped[uid] && (
                          <View style={[StyleSheet.absoluteFill, gridSt.xContainer]} pointerEvents="none">
                            <Text selectable={false} style={[gridSt.xMark, { color: USER_COLORS[uid] }]}>×</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                  {di < DAYS.length - 1 && <View style={{ width: DAY_GAP }} />}
                </React.Fragment>
              );
            })}
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={gridSt.legend}>
        {USERS.map((uid) => (
          <View key={uid} style={gridSt.legendItem}>
            <View style={[gridSt.legendDot, { backgroundColor: USER_COLORS[uid] }]} />
            <Text selectable={false} style={[gridSt.legendText, { color: c.mutedForeground }]}>{userNames[uid]}</Text>
          </View>
        ))}
      </View>

      {/* Day label picker modal */}
      {editingColumn !== null && (
        <Modal transparent animationType="fade" onRequestClose={() => setEditingColumn(null)}>
          <TouchableOpacity
            style={modalSt.overlay}
            activeOpacity={1}
            onPress={() => setEditingColumn(null)}
          >
            <View style={[modalSt.card, { backgroundColor: c.card }]} onStartShouldSetResponder={() => true}>
              <Text selectable={false} style={[modalSt.title, { color: c.text }]}>Название дня</Text>
              <WheelPicker
                value={dayLabels[editingColumn] ?? ""}
                onSelect={(label) => setDayLabel(editingColumn, label)}
                width={200}
              />
              <TouchableOpacity
                style={[modalSt.done, { backgroundColor: c.primary }]}
                onPress={() => setEditingColumn(null)}
                activeOpacity={0.8}
              >
                <Text selectable={false} style={modalSt.doneText}>Готово</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Name edit modal */}
      {editingUser !== null && (
        <NameEditModal
          userId={editingUser}
          currentName={userNames[editingUser]}
          onSave={(name) => setUserName(editingUser, name)}
          onClose={() => setEditingUser(null)}
        />
      )}

      {/* Start time picker modal */}
      {editingStartTime && (
        <TimePickerModal
          config={meetingConfig}
          onSave={(cfg) => setMeetingConfigFn(cfg)}
          onClose={() => setEditingStartTime(false)}
        />
      )}

      {/* Clear button */}
      {(() => {
        const phase2 = clearCount >= 5;
        const dotsFilled = phase2 ? clearCount - 5 : clearCount;
        const btnColor = phase2 ? "#EF4444" : USER_COLORS[su];
        const btnBg = phase2
          ? (c.isDark ? "#2A1010" : "#FEF2F2")
          : (c.isDark ? (USER_COLORS_LIGHT[su] + "22") : USER_COLORS_LIGHT[su]);
        const btnLabel = clearCount === 0 ? "Пропущу встречу" : phase2 ? "Очистить всё" : "Очистить своё";
        return (
          <View style={gridSt.clearWrap}>
            <TouchableOpacity
              style={[
                gridSt.clearBtn,
                {
                  borderColor: btnColor,
                  backgroundColor: clearCount === 0
                    ? (c.isDark ? USER_COLORS_LIGHT[su] + "18" : USER_COLORS_LIGHT[su])
                    : btnBg,
                },
              ]}
              onPress={handleClear}
              activeOpacity={0.8}
            >
              {clearCount > 0 ? (
                <View style={gridSt.clearDots}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <View
                      key={i}
                      style={[
                        gridSt.clearDot,
                        { backgroundColor: i < dotsFilled ? btnColor : c.border },
                      ]}
                    />
                  ))}
                </View>
              ) : null}
              <Text selectable={false} style={[gridSt.clearText, { color: btnColor }]}>
                {btnLabel}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })()}

      {/* Back button */}
      <TouchableOpacity
        style={gridSt.backBtn}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          deselectUser();
        }}
        activeOpacity={0.7}
      >
        <Text selectable={false} style={[gridSt.backBtnText, { color: c.isDark ? "#5A5878" : "#B0AECF" }]}>
          ← Сменить участника
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Grid screen static layout styles (no colours) ───────────────────────────
const gridSt = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 10,
  },
  descInput: {
    alignSelf: "center",
    width: 295,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  userBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  userDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
  },
  userBarText: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  userBarHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  grid: {
    alignSelf: "center",
  },
  hRow1: {
    flexDirection: "row",
    height: HEADER_DAY_H,
    alignItems: "center",
  },
  dayHdr: {
    height: HEADER_DAY_H,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  dayHdrText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
  hRow2: {
    flexDirection: "row",
    height: HEADER_INIT_H,
    alignItems: "center",
  },
  initCell: {
    height: HEADER_INIT_H,
    alignItems: "center",
    justifyContent: "center",
  },
  initText: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeCell: {
    width: TIME_W,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: 6,
  },
  timeText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  timeTextFirst: {
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textDecorationLine: "underline",
    textDecorationStyle: "dotted",
    textDecorationColor: "#B0AECF",
  },
  cell: {
    borderRadius: 3,
    margin: CELL_MARGIN,
  },
  xContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  xMark: {
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 18,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    gap: 12,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  clearWrap: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 4,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  clearText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  clearDots: {
    flexDirection: "row",
    gap: 4,
  },
  clearDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  backBtn: {
    alignSelf: "center",
    marginTop: 6,
    marginBottom: 4,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  backBtnText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
