import type {
  MassageMode,
  ProgramEditIntent,
  RegionTarget,
  SessionContext,
} from "@/lib/prototype-program";

export type HouseholdMember = {
  id: string;
  label: string;
  detail: string;
  initials: string;
};

export type SessionOutcome = "舒服咗" | "差唔多" | "更加唔舒服";

export type SavedMemberPreferences = {
  targets: RegionTarget[];
  durationMinutes: number;
  context: SessionContext;
};

export type SessionHistoryEntry = {
  id: string;
  completedAt: string;
  memberId: string;
  memberLabel: string;
  massageMode: MassageMode;
  targets: RegionTarget[];
  durationMinutes: number;
  context: SessionContext;
  editIntent: ProgramEditIntent;
  completedSegments: number;
  segmentCount: number;
  outcome: SessionOutcome | null;
};

export type MassageFlowStoredData = {
  version: 1;
  members: HouseholdMember[];
  preferencesByMember: Record<string, SavedMemberPreferences>;
  history: SessionHistoryEntry[];
};

export const HISTORY_LIMIT = 30;

export const initialHouseholdMembers: HouseholdMember[] = [
  { id: "self", label: "我", detail: "本機家庭成員", initials: "我" },
  { id: "partner", label: "伴侶", detail: "本機家庭成員", initials: "伴" },
  { id: "family", label: "家人", detail: "本機家庭成員", initials: "家" },
];

export function createLocalSessionId(): string {
  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
}

function cloneTargets(targets: RegionTarget[]) {
  return targets.map((target) => ({ ...target }));
}

function cloneContext(context: SessionContext): SessionContext {
  return { ...context };
}

export function cloneEditIntent(editIntent: ProgramEditIntent): ProgramEditIntent {
  return {
    ...(editIntent.targetOrder?.length ? { targetOrder: cloneTargets(editIntent.targetOrder) } : {}),
    ...(editIntent.mainDurationOverrides ? { mainDurationOverrides: { ...editIntent.mainDurationOverrides } } : {}),
    ...(editIntent.substituteVariants ? { substituteVariants: { ...editIntent.substituteVariants } } : {}),
  };
}

function clonePreferences(preferences: SavedMemberPreferences): SavedMemberPreferences {
  return {
    targets: cloneTargets(preferences.targets),
    durationMinutes: preferences.durationMinutes,
    context: cloneContext(preferences.context),
  };
}

function cloneHistoryEntry(entry: SessionHistoryEntry): SessionHistoryEntry {
  return {
    ...entry,
    targets: cloneTargets(entry.targets),
    context: cloneContext(entry.context),
    editIntent: cloneEditIntent(entry.editIntent),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isMember(value: unknown): value is HouseholdMember {
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.label === "string"
    && typeof value.detail === "string"
    && typeof value.initials === "string";
}

function normalizeMembers(value: unknown): HouseholdMember[] {
  const candidates = Array.isArray(value) ? value.filter(isMember) : [];
  const unique = new Map(candidates.map((member) => [member.id, { ...member, initials: member.initials || member.label.slice(0, 1) }]));
  const self = unique.get("self") ?? initialHouseholdMembers[0];
  const helpers = [...unique.values()].filter((member) => member.id !== "self");
  return [self, ...(helpers.length > 0 ? helpers : initialHouseholdMembers.slice(1))];
}

function isPreference(value: unknown): value is SavedMemberPreferences {
  return isRecord(value)
    && Array.isArray(value.targets)
    && typeof value.durationMinutes === "number"
    && isRecord(value.context);
}

function isHistoryEntry(value: unknown): value is SessionHistoryEntry {
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.completedAt === "string"
    && typeof value.memberId === "string"
    && typeof value.memberLabel === "string"
    && (value.massageMode === "SELF" || value.massageMode === "HELP_OTHER")
    && Array.isArray(value.targets)
    && typeof value.durationMinutes === "number"
    && isRecord(value.context)
    && isRecord(value.editIntent)
    && typeof value.completedSegments === "number"
    && typeof value.segmentCount === "number";
}

export function createEmptyStoredData(): MassageFlowStoredData {
  return {
    version: 1,
    members: initialHouseholdMembers.map((member) => ({ ...member })),
    preferencesByMember: {},
    history: [],
  };
}

export function normalizeStoredData(value: unknown): MassageFlowStoredData {
  if (!isRecord(value)) return createEmptyStoredData();

  const preferencesByMember = isRecord(value.preferencesByMember)
    ? Object.fromEntries(
        Object.entries(value.preferencesByMember)
          .filter(([, preference]) => isPreference(preference))
          .map(([memberId, preference]) => [memberId, clonePreferences(preference as SavedMemberPreferences)]),
      )
    : {};

  return {
    version: 1,
    members: normalizeMembers(value.members),
    preferencesByMember,
    history: Array.isArray(value.history)
      ? value.history.filter(isHistoryEntry).map(cloneHistoryEntry).slice(0, HISTORY_LIMIT)
      : [],
  };
}

export function appendHistoryEntry(history: SessionHistoryEntry[], entry: SessionHistoryEntry): SessionHistoryEntry[] {
  return [cloneHistoryEntry(entry), ...history.map(cloneHistoryEntry)].slice(0, HISTORY_LIMIT);
}

export function updateHistoryOutcome(
  history: SessionHistoryEntry[],
  entryId: string,
  outcome: SessionOutcome,
): SessionHistoryEntry[] {
  return history.map((entry) => entry.id === entryId ? { ...cloneHistoryEntry(entry), outcome } : cloneHistoryEntry(entry));
}

export function removeHistoryEntry(history: SessionHistoryEntry[], entryId: string): SessionHistoryEntry[] {
  return history.filter((entry) => entry.id !== entryId).map(cloneHistoryEntry);
}

export function createHistoryEntry(input: Omit<SessionHistoryEntry, "outcome"> & { outcome?: SessionOutcome | null }): SessionHistoryEntry {
  return {
    ...input,
    targets: cloneTargets(input.targets),
    context: cloneContext(input.context),
    editIntent: cloneEditIntent(input.editIntent),
    outcome: input.outcome ?? null,
  };
}
