import { describe, expect, it } from "vitest";

import {
  advancePlayback,
  createPlaybackState,
  generateMassageProgram,
  generateUpperBackProgram,
  skipPlaybackSegment,
} from "./prototype-program";

describe("generateMassageProgram", () => {
  it("creates a deterministic five-segment helper program from broad upper-back input", () => {
    const first = generateUpperBackProgram(10, "BOTH", "HELP_OTHER");
    const second = generateUpperBackProgram(10, "BOTH", "HELP_OTHER");

    expect(first).toEqual(second);
    expect(first.segments).toHaveLength(5);
    expect(first.segments.map((segment) => segment.muscleName)).toEqual([
      "上背暖身",
      "上斜方肌",
      "肩胛周邊",
      "菱形肌區域",
      "上背收尾放鬆",
    ]);
    expect(first.segments.every((segment) => segment.reachability === "DIRECT")).toBe(true);
  });

  it("filters hard-to-reach upper-back actions for self massage and uses the approved substitute", () => {
    const program = generateUpperBackProgram(10, "BOTH", "SELF");

    expect(program.segments).toHaveLength(4);
    expect(program.segments.map((segment) => segment.muscleName)).not.toContain("菱形肌區域");
    expect(program.segments.find((segment) => segment.reachability === "SUBSTITUTE_ONLY")).toMatchObject({
      muscleName: "肩胛周邊替代放鬆",
      adaptationLabel: "自己按替代動作",
    });
  });

  it("creates a shoulder-and-neck helper program that keeps every main step inside the approved surface boundary", () => {
    const program = generateMassageProgram(10, [{ region: "SHOULDER_NECK", side: "BOTH" }], "HELP_OTHER");
    const mainSegments = program.segments.filter((segment) => segment.phase === "MAIN");

    expect(mainSegments.map((segment) => segment.muscleName)).toEqual([
      "後頸與膊頭表面放鬆",
      "肩上緣輕推",
      "肩上緣停留放鬆",
    ]);
    expect(mainSegments.every((segment) => segment.region === "SHOULDER_NECK")).toBe(true);
    expect(mainSegments.every((segment) => segment.instruction.includes("避開頸前、喉嚨、頸兩側同脊柱正中"))).toBe(true);
    expect(program.segments.reduce((sum, segment) => sum + segment.durationSec, 0)).toBe(600);
  });

  it("uses an approved shoulder-and-neck substitute when self massage would otherwise be harder to control", () => {
    const program = generateMassageProgram(5, [{ region: "SHOULDER_NECK", side: "LEFT" }], "SELF");
    const mainSegments = program.segments.filter((segment) => segment.phase === "MAIN");

    expect(mainSegments).toHaveLength(2);
    expect(mainSegments.find((segment) => segment.reachability === "SUBSTITUTE_ONLY")).toMatchObject({
      muscleName: "肩上緣替代放鬆",
      adaptationLabel: "自己按替代動作",
    });
    expect(mainSegments.every((segment) => segment.side === "LEFT")).toBe(true);
    expect(mainSegments.every((segment) => segment.instruction.includes("避開頸前、喉嚨、頸兩側同脊柱正中"))).toBe(true);
  });

  it("creates distinct middle and lower back steps, with self-mode substitutions", () => {
    const selfProgram = generateMassageProgram(10, [
      { region: "MID_BACK", side: "BOTH" },
      { region: "LOWER_BACK", side: "LEFT" },
    ], "SELF");
    const helperProgram = generateMassageProgram(10, [{ region: "MID_BACK", side: "BOTH" }], "HELP_OTHER");

    expect(selfProgram.segments.some((segment) => segment.region === "LOWER_BACK")).toBe(true);
    expect(selfProgram.segments.some((segment) => segment.adaptationLabel === "自己按替代動作")).toBe(true);
    expect(helperProgram.segments.some((segment) => segment.muscleName === "中背兩側肌群")).toBe(true);
  });

  it("allocates more main time to earlier, higher-priority selected regions", () => {
    const program = generateMassageProgram(10, [
      { region: "UPPER_BACK", side: "BOTH" },
      { region: "LOWER_BACK", side: "BOTH" },
    ], "HELP_OTHER");
    const mainTime = (region: "UPPER_BACK" | "LOWER_BACK") => program.segments
      .filter((segment) => segment.phase === "MAIN" && segment.region === region)
      .reduce((sum, segment) => sum + segment.durationSec, 0);

    expect(mainTime("UPPER_BACK")).toBeGreaterThan(mainTime("LOWER_BACK"));
    expect(program.segments.reduce((sum, segment) => sum + segment.durationSec, 0)).toBe(600);
  });

  it("allocates the entire selected duration without requiring manual muscles", () => {
    const program = generateUpperBackProgram(5, "LEFT", "SELF");

    expect(program.totalDurationSec).toBe(300);
    expect(program.segments.reduce((sum, segment) => sum + segment.durationSec, 0)).toBe(300);
    expect(program.segments.every((segment) => segment.side === "LEFT")).toBe(true);
  });

  it("uses sensation and goal inputs to make a high-severity sleep program more conservative", () => {
    const standard = generateMassageProgram(10, [{ region: "UPPER_BACK", side: "BOTH" }], "SELF");
    const sleep = generateMassageProgram(10, [{ region: "UPPER_BACK", side: "BOTH" }], "SELF", {
      sensation: "TIGHT",
      severity: 4,
      durationBand: "DAYS",
      goal: "SLEEP",
    });
    const phaseDuration = (program: typeof sleep, phase: "PREPARATION" | "MAIN" | "COOL_DOWN") => program.segments
      .filter((segment) => segment.phase === phase)
      .reduce((sum, segment) => sum + segment.durationSec, 0);

    expect(sleep.contextNotice).toContain("繃緊");
    expect(sleep.contextNotice).toContain("睡前舒緩");
    expect(phaseDuration(sleep, "COOL_DOWN")).toBeGreaterThan(phaseDuration(standard, "COOL_DOWN"));
    expect(phaseDuration(sleep, "MAIN")).toBeLessThan(phaseDuration(standard, "MAIN"));
    expect(sleep.segments.reduce((sum, segment) => sum + segment.durationSec, 0)).toBe(600);
  });

  it("applies controlled edits without removing warm-up, cool-down, or changing total duration", () => {
    const plan = generateMassageProgram(10, [
      { region: "UPPER_BACK", side: "BOTH" },
      { region: "LOWER_BACK", side: "LEFT" },
    ], "SELF", undefined, {
      targetOrder: [{ region: "LOWER_BACK", side: "LEFT" }, { region: "UPPER_BACK", side: "BOTH" }],
      mainDurationOverrides: { "self-lower-back-side": 140 },
      substituteVariants: { "self-lower-back-substitute": "GENTLE" },
    });

    const lowerMain = plan.segments.filter((segment) => segment.phase === "MAIN" && segment.region === "LOWER_BACK");
    const upperMainDuration = plan.segments.filter((segment) => segment.phase === "MAIN" && segment.region === "UPPER_BACK").reduce((sum, segment) => sum + segment.durationSec, 0);
    const lowerMainDuration = lowerMain.reduce((sum, segment) => sum + segment.durationSec, 0);

    expect(plan.targets[0].region).toBe("LOWER_BACK");
    expect(lowerMain.find((segment) => segment.id === "self-lower-back-side")?.durationSec).toBe(140);
    expect(lowerMain.some((segment) => segment.adaptationLabel === "較柔和替代動作")).toBe(true);
    expect(lowerMainDuration).toBeGreaterThan(upperMainDuration);
    expect(plan.segments.some((segment) => segment.phase === "PREPARATION")).toBe(true);
    expect(plan.segments.some((segment) => segment.phase === "COOL_DOWN")).toBe(true);
    expect(plan.segments.reduce((sum, segment) => sum + segment.durationSec, 0)).toBe(600);
  });

  it("moves time between the edited segment and the next main segment in a fixed order", () => {
    const base = generateMassageProgram(10, [{ region: "UPPER_BACK", side: "BOTH" }], "HELP_OTHER");
    const baseMain = base.segments.filter((segment) => segment.phase === "MAIN");
    const appliedIncrease = Math.min(30, 180 - baseMain[0].durationSec);
    const edited = generateMassageProgram(10, [{ region: "UPPER_BACK", side: "BOTH" }], "HELP_OTHER", undefined, {
      mainDurationOverrides: { "upper-trapezius": baseMain[0].durationSec + 30 },
    });
    const editedMain = edited.segments.filter((segment) => segment.phase === "MAIN");

    expect(editedMain[0].durationSec).toBe(baseMain[0].durationSec + appliedIncrease);
    expect(editedMain[1].durationSec).toBe(baseMain[1].durationSec - appliedIncrease);
    expect(editedMain[2].durationSec).toBe(baseMain[2].durationSec);
    expect(edited.segments.reduce((sum, segment) => sum + segment.durationSec, 0)).toBe(600);
  });

  it("keeps prior edits stable when another selected main segment is adjusted", () => {
    const base = generateMassageProgram(10, [{ region: "UPPER_BACK", side: "BOTH" }], "HELP_OTHER");
    const baseMain = base.segments.filter((segment) => segment.phase === "MAIN");
    const appliedIncrease = Math.min(30, 180 - baseMain[0].durationSec);
    const edited = generateMassageProgram(10, [{ region: "UPPER_BACK", side: "BOTH" }], "HELP_OTHER", undefined, {
      mainDurationOverrides: {
        "upper-trapezius": baseMain[0].durationSec + 30,
        "scapular-border": baseMain[1].durationSec,
      },
    });
    const editedMain = edited.segments.filter((segment) => segment.phase === "MAIN");

    expect(editedMain.map((segment) => segment.durationSec)).toEqual([
      baseMain[0].durationSec + appliedIncrease,
      baseMain[1].durationSec,
      baseMain[2].durationSec - appliedIncrease,
    ]);
    expect(edited.segments.reduce((sum, segment) => sum + segment.durationSec, 0)).toBe(600);
  });

  it("moves to the next segment only when the current segment ends", () => {
    const program = generateUpperBackProgram(5, "BOTH", "HELP_OTHER");
    const initial = createPlaybackState(program);

    const oneSecondLater = advancePlayback(program, initial);
    expect(oneSecondLater.segmentIndex).toBe(0);
    expect(oneSecondLater.segmentRemainingSec).toBe(initial.segmentRemainingSec - 1);

    const nextSegment = advancePlayback(program, { ...initial, segmentRemainingSec: 1 });
    expect(nextSegment.segmentIndex).toBe(1);
    expect(nextSegment.segmentRemainingSec).toBe(program.segments[1].durationSec);
  });

  it("automatically resumes countdown after forward Skip, including the final segment", () => {
    const program = generateUpperBackProgram(5, "BOTH", "SELF");
    const result = skipPlaybackSegment(program, program.segments.length - 2, 1);

    expect(result.segmentIndex).toBe(program.segments.length - 1);
    expect(result.segmentRemainingSec).toBe(program.segments.at(-1)?.durationSec);
    expect(result.shouldAutoStart).toBe(true);
  });

  it("marks playback complete after the final segment", () => {
    const program = generateUpperBackProgram(5, "RIGHT", "HELP_OTHER");
    const finalIndex = program.segments.length - 1;
    const finalState = advancePlayback(program, {
      segmentIndex: finalIndex,
      segmentRemainingSec: 1,
      isComplete: false,
    });

    expect(finalState).toMatchObject({ segmentIndex: finalIndex, segmentRemainingSec: 0, isComplete: true });
  });
});
