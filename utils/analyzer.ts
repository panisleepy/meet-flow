/**
 * 會議空檔分析：以每位成員的「空閒時段」（freeTime）對應至 `availability` 欄位。
 */

export type TimeSlot = string;

/** 僅需可比對空閒時段的成員形狀 */
export type MemberWithAvailability = {
  availability: TimeSlot[];
};

/** 與所有成員 availability 的交集（全員同時空閒的時段） */
export function findCommonFreeTime(
  members: MemberWithAvailability[]
): TimeSlot[] {
  if (members.length === 0) return [];
  const [first, ...rest] = members;
  return first.availability.filter((s) =>
    rest.every((m) => m.availability.includes(s))
  );
}

/** 產生與 UI Grid 一致的所有可選時段鍵（格式：`day-hour`） */
export function buildAllGridSlots(
  dayCount: number,
  hours: readonly number[]
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let d = 0; d < dayCount; d++) {
    for (const h of hours) {
      slots.push(`${d}-${h}`);
    }
  }
  return slots;
}

export type GoldenSlot = {
  slot: TimeSlot;
  /** 該時段有空的人數 */
  participantCount: number;
  /** 是否全員皆可參與 */
  isFullAttendance: boolean;
};

/**
 * 黃金時段：依「參與人數」由高到低排序，取前 `limit` 名。
 * 全員參與的時段會自然排在最前面（人數最多）。
 */
export function findTopGoldenSlots(
  members: MemberWithAvailability[],
  allSlots: readonly TimeSlot[],
  limit = 3
): GoldenSlot[] {
  const total = members.length;
  if (total === 0 || allSlots.length === 0) return [];

  const ranked: GoldenSlot[] = allSlots.map((s) => {
    const participantCount = members.filter((m) =>
      m.availability.includes(s)
    ).length;
    return {
      slot: s,
      participantCount,
      isFullAttendance: participantCount === total && total > 0,
    };
  });

  ranked.sort((a, b) => {
    if (b.participantCount !== a.participantCount) {
      return b.participantCount - a.participantCount;
    }
    return a.slot.localeCompare(b.slot, undefined, { numeric: true });
  });

  return ranked.slice(0, limit);
}
