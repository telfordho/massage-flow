export type BodySide = "LEFT" | "RIGHT" | "BOTH";

export type MassageMode = "SELF" | "HELP_OTHER";

export type BodyRegion = "UPPER_BACK" | "MID_BACK" | "LOWER_BACK";

export type Sensation = "TIGHT" | "SORE" | "STIFF" | "TENDER" | "RELAX";

export type DurationBand = "TODAY" | "DAYS" | "RECURRING";

export type SessionGoal = "GENERAL" | "PRE_ACTIVITY" | "POST_ACTIVITY" | "MOVEMENT" | "SLEEP";

export type SessionContext = {
  sensation: Sensation;
  severity: 1 | 2 | 3 | 4 | 5;
  durationBand: DurationBand;
  goal: SessionGoal;
};

export const DEFAULT_SESSION_CONTEXT: SessionContext = {
  sensation: "RELAX",
  severity: 2,
  durationBand: "TODAY",
  goal: "GENERAL",
};

export type SubstituteVariant = "DEFAULT" | "GENTLE";

export type ProgramEditIntent = {
  targetOrder?: RegionTarget[];
  mainDurationOverrides?: Record<string, number>;
  substituteVariants?: Record<string, SubstituteVariant>;
};

export const EMPTY_PROGRAM_EDIT: ProgramEditIntent = {
  mainDurationOverrides: {},
  substituteVariants: {},
};

export type RegionTarget = {
  region: BodyRegion;
  side: BodySide;
};

export type ProgramPhase = "PREPARATION" | "MAIN" | "COOL_DOWN";

export type Reachability = "DIRECT" | "SUBSTITUTE_ONLY";

export type ProgramSegment = {
  id: string;
  phase: ProgramPhase;
  region: BodyRegion;
  regionLabel: string;
  muscleName: string;
  plainLocation: string;
  technique: string;
  instruction: string;
  durationSec: number;
  side: BodySide;
  reachability: Reachability;
  adaptationLabel?: string;
  nextHint: string;
};

type DraftProgramSegment = Omit<ProgramSegment, "nextHint">;

export type MassageProgram = {
  targets: RegionTarget[];
  mode: MassageMode;
  context: SessionContext;
  durationMinutes: number;
  totalDurationSec: number;
  modeNotice: string;
  contextNotice: string;
  allocationNotice: string;
  segments: ProgramSegment[];
};

export type PlaybackState = {
  segmentIndex: number;
  segmentRemainingSec: number;
  isComplete: boolean;
};

export type SkipPlaybackResult = {
  segmentIndex: number;
  segmentRemainingSec: number;
  shouldAutoStart: boolean;
};

export const REGION_DETAILS: Record<BodyRegion, { label: string; shortLabel: string; selfHint: string; helperHint: string }> = {
  UPPER_BACK: {
    label: "膊頭／上背",
    shortLabel: "上背",
    selfHint: "會保留膊頭外側；中央上背會改用替代動作。",
    helperHint: "可以安排完整嘅肩胛周邊同中央上背流程。",
  },
  MID_BACK: {
    label: "中背",
    shortLabel: "中背",
    selfHint: "中間位置較難自己掂到，會改用側背伸展作替代。",
    helperHint: "可以安排中背兩側嘅輕柔放鬆流程。",
  },
  LOWER_BACK: {
    label: "下背",
    shortLabel: "下背",
    selfHint: "只會處理腰側較易掂到嘅位置，唔會安排脊柱正中動作。",
    helperHint: "可以安排下背兩側嘅輕柔放鬆流程。",
  },
};

const sideLabel: Record<BodySide, string> = {
  LEFT: "左側",
  RIGHT: "右側",
  BOTH: "雙側",
};

function distributeDuration(total: number, ratios: number[]) {
  const values = ratios.map((ratio) => Math.floor(total * ratio));
  const remainder = total - values.reduce((sum, value) => sum + value, 0);
  values[values.length - 1] += remainder;
  return values;
}

function distributeByPriority(total: number, targetCount: number) {
  const weights = Array.from({ length: targetCount }, (_, index) => targetCount - index);
  const weightTotal = weights.reduce((sum, value) => sum + value, 0);
  const values = weights.map((weight) => Math.floor((total * weight) / weightTotal));
  values[values.length - 1] += total - values.reduce((sum, value) => sum + value, 0);
  return values;
}

function addNextHints(draft: Omit<ProgramSegment, "nextHint">[]): ProgramSegment[] {
  return draft.map((segment, index) => ({
    ...segment,
    nextHint: draft[index + 1]
      ? `下一步：${draft[index + 1].muscleName}`
      : "完成後返去放鬆呼吸。",
  }));
}

function step(
  id: string,
  phase: ProgramPhase,
  target: RegionTarget,
  muscleName: string,
  plainLocation: string,
  technique: string,
  instruction: string,
  reachability: Reachability = "DIRECT",
  adaptationLabel?: string,
): Omit<ProgramSegment, "nextHint" | "durationSec"> {
  return {
    id,
    phase,
    region: target.region,
    regionLabel: REGION_DETAILS[target.region].label,
    muscleName,
    plainLocation,
    technique,
    instruction,
    side: target.side,
    reachability,
    adaptationLabel,
  };
}

function mainStepsFor(target: RegionTarget, mode: MassageMode) {
  const side = sideLabel[target.side];
  const prefix = target.side === "BOTH" ? "左右輪流" : `集中處理${side}`;

  if (target.region === "UPPER_BACK") {
    if (mode === "SELF") {
      return [
        step("self-upper-trapezius", "MAIN", target, "上斜方肌", "膊頭近頸嘅外側位置", "指腹慢揉", `用另一隻手嘅指腹，以輕至中等力度慢慢揉按${side}膊頭近頸嘅外側位置。`),
        step("self-scapular-substitute", "MAIN", target, "肩胛周邊替代放鬆", "膊頭外側至肩胛上緣較易掂到嘅位置", "交叉手掌長推撫", `中央上背較難自己掂到；改用另一隻手，由${side}膊頭外側向肩胛上緣慢慢長推撫。`, "SUBSTITUTE_ONLY", "自己按替代動作"),
      ];
    }
    return [
      step("upper-trapezius", "MAIN", target, "上斜方肌", "膊頭近頸嘅位置", "指腹慢揉", `${prefix}，以輕至中等力度慢慢揉按上斜方肌。`),
      step("scapular-border", "MAIN", target, "肩胛周邊", "肩胛骨內側周邊", "定點輕壓", `沿${side}肩胛骨旁嘅肌肉位置短暫停留，再慢慢放開。`),
      step("rhomboids", "MAIN", target, "菱形肌區域", "兩邊肩胛骨之間嘅上背", "向外推揉", `喺${side}肩胛骨之間，以短而慢嘅路徑向外推揉。`),
    ];
  }

  if (target.region === "MID_BACK") {
    if (mode === "SELF") {
      return [
        step("self-mid-back-side", "MAIN", target, "中背側邊放鬆", "中背兩側較易掂到嘅位置", "掌心緩推", `${prefix}，用掌心沿中背兩側慢慢推撫，唔好處理脊柱正中。`),
        step("self-mid-back-substitute", "MAIN", target, "中背伸展替代", "側背同肋緣外側", "抱臂輕推", "中背中央較難自己掂到；改以雙手環抱上身，向側背輕柔推壓同放鬆。", "SUBSTITUTE_ONLY", "自己按替代動作"),
      ];
    }
    return [
      step("mid-back-paraspinal", "MAIN", target, "中背兩側肌群", "脊柱兩側嘅中背軟組織", "掌心緩推", `${prefix}，沿中背兩側以掌心慢慢推撫，避開脊柱正中。`),
      step("mid-back-side", "MAIN", target, "中背側邊", "肩胛下方至側背", "輕柔揉動", `喺${side}中背側邊細範圍輕柔揉動，再慢慢放開。`),
    ];
  }

  if (mode === "SELF") {
    return [
      step("self-lower-back-side", "MAIN", target, "腰側放鬆", "腰部兩側較易掂到嘅軟組織", "掌心慢推", `${prefix}，用掌心喺腰部兩側慢慢推撫，唔好處理脊柱正中。`),
      step("self-lower-back-substitute", "MAIN", target, "下背側邊替代放鬆", "腰側至臀髖上緣", "交叉手掌推撫", "下背中央較難自己控制力度；改喺腰側至臀髖上緣作交叉手掌慢推。", "SUBSTITUTE_ONLY", "自己按替代動作"),
    ];
  }
  return [
    step("lower-back-side", "MAIN", target, "下背兩側肌群", "腰部兩側軟組織", "掌根緩推", `${prefix}，以掌根喺下背兩側慢慢推撫，避開脊柱正中。`),
    step("lower-back-outer", "MAIN", target, "腰側同臀髖上緣", "下背外側至臀髖上緣", "輕柔揉動", `喺${side}下背外側細範圍輕柔揉動，再慢慢放開。`),
  ];
}

function contextLabels(context: SessionContext) {
  const sensation: Record<Sensation, string> = { TIGHT: "繃緊", SORE: "酸攰", STIFF: "僵硬", TENDER: "壓痛感", RELAX: "純粹想放鬆" };
  const duration: Record<DurationBand, string> = { TODAY: "今日開始", DAYS: "持續幾日", RECURRING: "長期反覆" };
  const goal: Record<SessionGoal, string> = { GENERAL: "一般放鬆", PRE_ACTIVITY: "活動前準備", POST_ACTIVITY: "活動後恢復", MOVEMENT: "改善活動感", SLEEP: "睡前舒緩" };
  return { sensation: sensation[context.sensation], duration: duration[context.durationBand], goal: goal[context.goal] };
}

const MIN_MAIN_SEGMENT_DURATION_SEC = 30;
const MAX_MAIN_SEGMENT_DURATION_SEC = 180;

function transferMainDuration(
  segments: DraftProgramSegment[],
  targetId: string,
  requestedDurationSec: number,
): DraftProgramSegment[] {
  const targetIndex = segments.findIndex((segment) => segment.id === targetId);
  if (targetIndex < 0 || !Number.isFinite(requestedDurationSec)) return segments;

  const currentDuration = segments[targetIndex].durationSec;
  const requestedDuration = Math.min(MAX_MAIN_SEGMENT_DURATION_SEC, Math.max(MIN_MAIN_SEGMENT_DURATION_SEC, Math.round(requestedDurationSec)));
  const requestedDelta = requestedDuration - currentDuration;
  if (requestedDelta === 0) return segments;

  const next = segments.map((segment) => ({ ...segment }));
  const compensators = Array.from({ length: segments.length - 1 }, (_, offset) => (targetIndex + offset + 1) % segments.length);
  let remainingDelta = Math.abs(requestedDelta);

  for (const index of compensators) {
    const capacity = requestedDelta > 0
      ? next[index].durationSec - MIN_MAIN_SEGMENT_DURATION_SEC
      : MAX_MAIN_SEGMENT_DURATION_SEC - next[index].durationSec;
    const transferred = Math.min(remainingDelta, Math.max(0, capacity));
    if (transferred === 0) continue;
    next[index].durationSec += requestedDelta > 0 ? -transferred : transferred;
    remainingDelta -= transferred;
    if (remainingDelta === 0) break;
  }

  const appliedDelta = Math.abs(requestedDelta) - remainingDelta;
  next[targetIndex].durationSec += requestedDelta > 0 ? appliedDelta : -appliedDelta;
  return next;
}

function applyMainDurationOverrides(segments: DraftProgramSegment[], _mainBudget: number, overrides: Record<string, number> = {}) {
  return Object.entries(overrides).reduce(
    (current, [segmentId, durationSec]) => transferMainDuration(current, segmentId, durationSec),
    segments,
  );
}

function applySubstituteVariants(segments: DraftProgramSegment[], variants: Record<string, SubstituteVariant> = {}) {
  return segments.map((segment) => {
    if (segment.reachability !== "SUBSTITUTE_ONLY" || variants[segment.id] !== "GENTLE") return segment;
    return {
      ...segment,
      technique: "較柔和掌心停留",
      instruction: `${segment.instruction} 如覺得唔舒服，改為更輕柔嘅掌心停留，再慢慢放開。`,
      adaptationLabel: "較柔和替代動作",
    };
  });
}

function startAndFinish(target: RegionTarget, totalDurationSec: number, context: SessionContext) {
  const baseRatios: Record<SessionGoal, { warmUp: number; coolDown: number }> = {
    GENERAL: { warmUp: 0.12, coolDown: 0.12 },
    PRE_ACTIVITY: { warmUp: 0.2, coolDown: 0.08 },
    POST_ACTIVITY: { warmUp: 0.1, coolDown: 0.2 },
    MOVEMENT: { warmUp: 0.15, coolDown: 0.12 },
    SLEEP: { warmUp: 0.1, coolDown: 0.22 },
  };
  const base = baseRatios[context.goal];
  const conservativeBuffer = context.severity >= 4 ? 0.04 : 0;
  const warmUp = Math.floor(totalDurationSec * (base.warmUp + conservativeBuffer));
  const coolDown = Math.floor(totalDurationSec * (base.coolDown + conservativeBuffer));
  return {
    warmUp: {
      ...step(`warm-up-${target.region.toLowerCase()}`, "PREPARATION", target, `${REGION_DETAILS[target.region].shortLabel}暖身`, `${sideLabel[target.side]}${REGION_DETAILS[target.region].label}表面`, "掌心推撫", `先以掌心輕輕推撫${sideLabel[target.side]}${REGION_DETAILS[target.region].label}，準備開始。`),
      durationSec: warmUp,
    },
    coolDown: {
      ...step(`cool-down-${target.region.toLowerCase()}`, "COOL_DOWN", target, `${REGION_DETAILS[target.region].shortLabel}收尾放鬆`, `${sideLabel[target.side]}${REGION_DETAILS[target.region].label}外側`, "慢速收尾推撫", `返到${sideLabel[target.side]}${REGION_DETAILS[target.region].label}外側，以較慢節奏推撫作收尾。`),
      durationSec: coolDown,
    },
  };
}

/** Deterministic prototype engine. Target order is priority order. */
export function generateMassageProgram(
  durationMinutes: number,
  requestedTargets: RegionTarget[],
  mode: MassageMode,
  context: SessionContext = DEFAULT_SESSION_CONTEXT,
  editIntent: ProgramEditIntent = EMPTY_PROGRAM_EDIT,
): MassageProgram {
  const editedTargets = editIntent.targetOrder?.length ? editIntent.targetOrder : requestedTargets;
  const targets = editedTargets.length > 0 ? editedTargets : [{ region: "UPPER_BACK" as const, side: "BOTH" as const }];
  const totalDurationSec = durationMinutes * 60;
  const { warmUp, coolDown } = startAndFinish(targets[0], totalDurationSec, context);
  const mainBudget = totalDurationSec - warmUp.durationSec - coolDown.durationSec;
  const targetBudgets = distributeByPriority(mainBudget, targets.length);
  const generatedMainSegments = targets.flatMap((target, index) => {
    const steps = mainStepsFor(target, mode);
    const durations = distributeDuration(targetBudgets[index], steps.map(() => 1 / steps.length));
    return steps.map((mainStep, stepIndex) => ({ ...mainStep, durationSec: durations[stepIndex] }));
  });
  const mainSegments = applySubstituteVariants(
    applyMainDurationOverrides(generatedMainSegments, mainBudget, editIntent.mainDurationOverrides),
    editIntent.substituteVariants,
  );

  return {
    targets,
    mode,
    context,
    durationMinutes,
    totalDurationSec,
    modeNotice: mode === "SELF"
      ? "自己按只安排你一般可以自己掂到嘅位置；較難掂到嘅中背或中央上背會有清楚替代動作。"
      : "幫人按會按你揀嘅優先次序，使用完整嘅已審核肩背動作流程。",
    contextNotice: (() => {
      const labels = contextLabels(context);
      const conservative = context.severity >= 4 ? "程度較高，會保留更多暖身同收尾時間，並以較保守節奏安排。" : "程度屬於一般範圍，會按你揀嘅部位優先次序安排主要時間。";
      return `你揀咗「${labels.sensation}」${context.severity}／5，${labels.duration}，目標係「${labels.goal}」。${conservative}`;
    })(),
    allocationNotice: `暖身 ${Math.ceil(warmUp.durationSec / 60)} 分鐘、主要按摩 ${Math.floor(mainBudget / 60)} 分鐘、收尾 ${Math.ceil(coolDown.durationSec / 60)} 分鐘；部位順序仍以你嘅優先次序為準。`,
    segments: addNextHints([warmUp, ...mainSegments, coolDown]),
  };
}

export function generateUpperBackProgram(durationMinutes: number, side: BodySide, mode: MassageMode): MassageProgram {
  return generateMassageProgram(durationMinutes, [{ region: "UPPER_BACK", side }], mode);
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function createPlaybackState(program: MassageProgram): PlaybackState {
  return { segmentIndex: 0, segmentRemainingSec: program.segments[0]?.durationSec ?? 0, isComplete: program.segments.length === 0 };
}

export function skipPlaybackSegment(program: MassageProgram, currentIndex: number, direction: -1 | 1): SkipPlaybackResult {
  const segmentIndex = Math.min(Math.max(currentIndex + direction, 0), program.segments.length - 1);
  return { segmentIndex, segmentRemainingSec: program.segments[segmentIndex]?.durationSec ?? 0, shouldAutoStart: direction === 1 };
}

export function advancePlayback(program: MassageProgram, state: PlaybackState): PlaybackState {
  if (state.isComplete || program.segments.length === 0) return state;
  if (state.segmentRemainingSec > 1) return { ...state, segmentRemainingSec: state.segmentRemainingSec - 1 };
  const nextIndex = state.segmentIndex + 1;
  if (nextIndex >= program.segments.length) return { ...state, segmentRemainingSec: 0, isComplete: true };
  return { segmentIndex: nextIndex, segmentRemainingSec: program.segments[nextIndex].durationSec, isComplete: false };
}
