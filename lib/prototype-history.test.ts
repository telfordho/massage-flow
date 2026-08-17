import { describe, expect, it } from "vitest";

import {
  appendHistoryEntry,
  createLocalSessionId,
  createEmptyStoredData,
  createHistoryEntry,
  HISTORY_LIMIT,
  normalizeStoredData,
  updateHistoryOutcome,
} from "./prototype-history";

const sampleEntry = createHistoryEntry({
  id: "session-1",
  completedAt: "2026-08-17T00:00:00.000Z",
  memberId: "self",
  memberLabel: "我",
  massageMode: "SELF",
  targets: [{ region: "UPPER_BACK", side: "BOTH" }],
  durationMinutes: 10,
  context: { sensation: "RELAX", severity: 2, durationBand: "TODAY", goal: "GENERAL" },
  editIntent: {},
  completedSegments: 4,
  segmentCount: 4,
});

describe("local history data", () => {
  it("creates distinct UUID v4 identifiers for local sessions", () => {
    const first = createLocalSessionId();
    const second = createLocalSessionId();
    expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(second).not.toBe(first);
  });

  it("creates a safe local default with self and adult helper members", () => {
    const data = createEmptyStoredData();
    expect(data.members.map((member) => member.id)).toEqual(["self", "partner", "family"]);
    expect(data.history).toEqual([]);
  });

  it("normalizes incomplete stored members without losing the self identity", () => {
    const data = normalizeStoredData({
      members: [{ id: "friend", label: "朋友", detail: "本機家庭成員", initials: "友" }],
      history: [],
    });
    expect(data.members[0].id).toBe("self");
    expect(data.members.some((member) => member.id === "friend")).toBe(true);
  });

  it("prepends sessions, limits retained history, and keeps the original entry immutable", () => {
    const history = Array.from({ length: HISTORY_LIMIT }, (_, index) => ({ ...sampleEntry, id: `old-${index}` }));
    const next = appendHistoryEntry(history, sampleEntry);
    next[0].targets[0].side = "LEFT";
    expect(next).toHaveLength(HISTORY_LIMIT);
    expect(next[0].id).toBe("session-1");
    expect(sampleEntry.targets[0].side).toBe("BOTH");
  });

  it("updates feedback for the matching completed session only", () => {
    const next = updateHistoryOutcome([sampleEntry, { ...sampleEntry, id: "session-2" }], "session-2", "舒服咗");
    expect(next[0].outcome).toBeNull();
    expect(next[1].outcome).toBe("舒服咗");
  });
});
