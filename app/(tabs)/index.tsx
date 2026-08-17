import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenContainer } from "@/components/screen-container";
import {
  advancePlayback,
  type BodyRegion,
  type BodySide,
  DEFAULT_SESSION_CONTEXT,
  createPlaybackState,
  formatDuration,
  generateMassageProgram,
  type ProgramSegment,
  REGION_DETAILS,
  type RegionTarget,
  type Sensation,
  type DurationBand,
  type SessionContext,
  type SessionGoal,
  type ProgramEditIntent,
  skipPlaybackSegment,
} from "@/lib/prototype-program";
import {
  appendHistoryEntry,
  cloneEditIntent,
  createHistoryEntry,
  createLocalSessionId,
  initialHouseholdMembers,
  updateHistoryOutcome,
  type HouseholdMember,
  type SessionHistoryEntry,
  type SessionOutcome,
} from "@/lib/prototype-history";
import { loadMassageFlowData, saveMassageFlowData } from "@/lib/prototype-storage";

type Screen = "DECLARATION" | "MODE" | "MEMBER" | "MANAGE" | "MEMBER_FORM" | "HOME" | "REGIONS" | "SELECT" | "CONTEXT" | "DURATION" | "BUILDING" | "PREVIEW" | "EDIT" | "DEMO" | "GUIDE" | "DONE" | "HISTORY";
type Outcome = SessionOutcome | null;
type MassageMode = "SELF" | "HELP_OTHER";

const durationOptions = [5, 10, 15];
const sideOptions: { value: BodySide; label: string; helper: string }[] = [
  { value: "LEFT", label: "左側", helper: "集中處理左邊位置" },
  { value: "BOTH", label: "雙側", helper: "左右平均安排" },
  { value: "RIGHT", label: "右側", helper: "集中處理右邊位置" },
];
const regionOptions: BodyRegion[] = ["UPPER_BACK", "MID_BACK", "LOWER_BACK"];
const sensationOptions: { value: Sensation; label: string }[] = [
  { value: "TIGHT", label: "繃緊" },
  { value: "SORE", label: "酸攰" },
  { value: "STIFF", label: "僵硬" },
  { value: "TENDER", label: "壓痛感" },
  { value: "RELAX", label: "純粹想放鬆" },
];
const conditionDurationOptions: { value: DurationBand; label: string }[] = [
  { value: "TODAY", label: "今日開始" },
  { value: "DAYS", label: "幾日" },
  { value: "RECURRING", label: "長期反覆" },
];
const goalOptions: { value: SessionGoal; label: string; helper: string }[] = [
  { value: "GENERAL", label: "一般放鬆", helper: "維持平衡嘅暖身、主要按摩同收尾。" },
  { value: "PRE_ACTIVITY", label: "活動前準備", helper: "會保留較多暖身時間，幫你慢慢進入狀態。" },
  { value: "POST_ACTIVITY", label: "活動後恢復", helper: "會保留較多收尾時間，讓節奏慢慢放緩。" },
  { value: "MOVEMENT", label: "改善活動感", helper: "暖身同主要段落會較平均分配。" },
  { value: "SLEEP", label: "睡前舒緩", helper: "會加長收尾時間，令整體節奏更慢。" },
];

const phaseLabel: Record<ProgramSegment["phase"], string> = {
  PREPARATION: "準備",
  MAIN: "主要按摩",
  COOL_DOWN: "收尾",
};

function formatHistoryDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "剛剛完成";
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

function BackMap({ side, regions = ["UPPER_BACK"], emphasis = false }: { side: BodySide; regions?: BodyRegion[]; emphasis?: boolean }) {
  const showLeft = side === "LEFT" || side === "BOTH";
  const showRight = side === "RIGHT" || side === "BOTH";
  const upper = regions.includes("UPPER_BACK");
  const middle = regions.includes("MID_BACK");
  const lower = regions.includes("LOWER_BACK");
  const activeColor = emphasis ? "#D77A61" : "#1F4D4A";

  return (
    <View style={styles.bodyMapWrap} accessible accessibilityLabel="肩背位置示意圖">
      <Svg width={206} height={250} viewBox="0 0 206 250">
        <Path
          d="M82 20 C66 22 62 42 64 60 L45 76 C35 84 38 106 50 110 L63 108 L69 201 C70 220 83 232 103 232 C123 232 136 220 137 201 L143 108 L156 110 C168 106 171 84 161 76 L142 60 C144 42 140 22 124 20 C116 13 90 13 82 20 Z"
          fill="#EEEDE7"
          stroke="#AAB8B1"
          strokeWidth={2}
        />
        <Circle cx={103} cy={30} r={18} fill="#EEEDE7" stroke="#AAB8B1" strokeWidth={2} />
        <Path d="M103 56 L103 192" stroke="#C4CEC8" strokeWidth={2} strokeDasharray="4 5" />
        <Path
          d="M67 72 C78 64 93 68 100 82 L94 108 C82 101 71 96 61 91 Z"
          fill={upper && showLeft ? activeColor : "#DCE9E3"}
          opacity={upper && showLeft ? 0.96 : 0.55}
        />
        <Path
          d="M139 72 C128 64 113 68 106 82 L112 108 C124 101 135 96 145 91 Z"
          fill={upper && showRight ? activeColor : "#DCE9E3"}
          opacity={upper && showRight ? 0.96 : 0.55}
        />
        <Path d="M71 112 C82 104 92 109 98 119 L96 148 L76 143 Z" fill={middle && showLeft ? activeColor : "#DCE9E3"} opacity={middle && showLeft ? 0.96 : 0.55} />
        <Path d="M135 112 C124 104 114 109 108 119 L110 148 L130 143 Z" fill={middle && showRight ? activeColor : "#DCE9E3"} opacity={middle && showRight ? 0.96 : 0.55} />
        <Path d="M77 151 L96 154 L96 183 L80 180 Z" fill={lower && showLeft ? activeColor : "#DCE9E3"} opacity={lower && showLeft ? 0.96 : 0.55} />
        <Path d="M129 151 L110 154 L110 183 L126 180 Z" fill={lower && showRight ? activeColor : "#DCE9E3"} opacity={lower && showRight ? 0.96 : 0.55} />
      </Svg>
      <View style={styles.mapCaption}>
        <View style={styles.mapDot} />
        <Text style={styles.mapCaptionText}>{regions.map((region) => REGION_DETAILS[region].shortLabel).join(" · ")} · 概括選區</Text>
      </View>
    </View>
  );
}

function PrimaryButton({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, (pressed || disabled) && styles.primaryButtonPressed]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
      <Text style={styles.primaryArrow}>›</Text>
    </Pressable>
  );
}

function GhostButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.ghostButton, pressed && styles.ghostPressed]}>
      <Text style={styles.ghostButtonText}>{label}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const bottomScrollSpace = Math.max(insets.bottom, 18) + 96;
  const [screen, setScreen] = useState<Screen>("DECLARATION");
  const [hasAcceptedDeclaration, setHasAcceptedDeclaration] = useState(false);
  const [massageMode, setMassageMode] = useState<MassageMode>("SELF");
  const [members, setMembers] = useState<HouseholdMember[]>(initialHouseholdMembers);
  const [preferencesByMember, setPreferencesByMember] = useState<Record<string, { targets: RegionTarget[]; durationMinutes: number; context: SessionContext }>>({});
  const [history, setHistory] = useState<SessionHistoryEntry[]>([]);
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("self");
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberNameDraft, setMemberNameDraft] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [selectedTargets, setSelectedTargets] = useState<RegionTarget[]>([{ region: "UPPER_BACK", side: "BOTH" }]);
  const [activeTargetIndex, setActiveTargetIndex] = useState(0);
  const [sessionContext, setSessionContext] = useState<SessionContext>(DEFAULT_SESSION_CONTEXT);
  const [editIntent, setEditIntent] = useState<ProgramEditIntent>({});
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [demoIndex, setDemoIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [segmentRemaining, setSegmentRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  const program = useMemo(
    () => generateMassageProgram(durationMinutes, selectedTargets, massageMode, sessionContext, editIntent),
    [durationMinutes, selectedTargets, massageMode, sessionContext, editIntent],
  );
  const selectedMember = members.find((member) => member.id === selectedMemberId) ?? members[0] ?? initialHouseholdMembers[0];
  const helperMembers = members.filter((member) => member.id !== "self");
  const selectedHelperMember = helperMembers.find((member) => member.id === selectedMemberId) ?? helperMembers[0];
  const activeTarget = selectedTargets[activeTargetIndex] ?? selectedTargets[0];
  const selectedRegionLabels = program.targets.map((target) => REGION_DETAILS[target.region].shortLabel).join("、");
  const hasEdits = Boolean(editIntent.targetOrder?.length || Object.keys(editIntent.mainDurationOverrides ?? {}).length || Object.keys(editIntent.substituteVariants ?? {}).length);
  const currentSegment = program.segments[currentIndex];
  const completedCount = currentIndex;
  const elapsedSeconds = program.segments
    .slice(0, currentIndex)
    .reduce((sum, segment) => sum + segment.durationSec, 0) + (currentSegment.durationSec - segmentRemaining);
  const totalRemaining = Math.max(0, program.totalDurationSec - elapsedSeconds);

  useEffect(() => {
    let isMounted = true;
    void loadMassageFlowData().then((data) => {
      if (!isMounted) return;
      setMembers(data.members);
      setPreferencesByMember(data.preferencesByMember);
      setHistory(data.history);
      setSelectedMemberId((current) => data.members.some((member) => member.id === current) ? current : "self");
      setIsStorageReady(true);
    });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!isStorageReady) return;
    void saveMassageFlowData({ version: 1, members, preferencesByMember, history });
  }, [history, isStorageReady, members, preferencesByMember]);

  const applySavedPreferences = (memberId: string) => {
    const saved = preferencesByMember[memberId];
    if (!saved) return;
    setSelectedTargets(saved.targets.map((target) => ({ ...target })));
    setActiveTargetIndex(0);
    setDurationMinutes(saved.durationMinutes);
    setSessionContext({ ...saved.context });
    setEditIntent({});
  };

  const completeSession = useCallback(() => {
    const id = createLocalSessionId();
    const participant = selectedMember;
    const completedSegments = Math.min(program.segments.length, Math.max(1, currentIndex + 1));
    const entry = createHistoryEntry({
      id,
      completedAt: new Date().toISOString(),
      memberId: participant.id,
      memberLabel: participant.label,
      massageMode,
      targets: program.targets,
      durationMinutes,
      context: sessionContext,
      editIntent,
      completedSegments,
      segmentCount: program.segments.length,
    });
    setPreferencesByMember((current) => ({
      ...current,
      [participant.id]: {
        targets: selectedTargets.map((target) => ({ ...target })),
        durationMinutes,
        context: { ...sessionContext },
      },
    }));
    setHistory((current) => appendHistoryEntry(current, entry));
    setActiveHistoryId(id);
    setIsRunning(false);
    setScreen("DONE");
  }, [currentIndex, durationMinutes, editIntent, massageMode, program, selectedMember, selectedTargets, sessionContext]);

  useEffect(() => {
    if (screen !== "BUILDING") return;
    const timeout = setTimeout(() => setScreen("PREVIEW"), 850);
    return () => clearTimeout(timeout);
  }, [screen]);

  useEffect(() => {
    if (screen !== "GUIDE" || !isRunning) return;
    const timer = setInterval(() => {
      setSegmentRemaining((value) => {
        const nextState = advancePlayback(program, {
          segmentIndex: currentIndex,
          segmentRemainingSec: value,
          isComplete: false,
        });
        if (nextState.isComplete) {
          completeSession();
          return 0;
        }
        if (nextState.segmentIndex !== currentIndex) setCurrentIndex(nextState.segmentIndex);
        return nextState.segmentRemainingSec;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [screen, isRunning, currentIndex, program, completeSession]);

  const startGuide = () => {
    const initialPlayback = createPlaybackState(program);
    setCurrentIndex(initialPlayback.segmentIndex);
    setSegmentRemaining(initialPlayback.segmentRemainingSec);
    setIsRunning(true);
    setOutcome(null);
    setScreen("GUIDE");
  };

  const moveSegment = (direction: -1 | 1) => {
    const nextState = skipPlaybackSegment(program, currentIndex, direction);
    setCurrentIndex(nextState.segmentIndex);
    setSegmentRemaining(nextState.segmentRemainingSec);
    setIsRunning(nextState.shouldAutoStart);
  };

  const resetPrototype = () => {
    setSelectedTargets([{ region: "UPPER_BACK", side: "BOTH" }]);
    setActiveTargetIndex(0);
    setSessionContext(DEFAULT_SESSION_CONTEXT);
    setEditIntent({});
    setDurationMinutes(10);
    setCurrentIndex(0);
    setDemoIndex(0);
    setOutcome(null);
    setActiveHistoryId(null);
    setScreen("MODE");
  };

  const chooseMassageMode = (mode: MassageMode) => {
    setMassageMode(mode);
    if (mode === "SELF") {
      setSelectedMemberId("self");
      applySavedPreferences("self");
      return;
    }
    if (selectedMemberId === "self" && helperMembers[0]) setSelectedMemberId(helperMembers[0].id);
  };

  const toggleRegion = (region: BodyRegion) => {
    setSelectedTargets((current) => {
      const index = current.findIndex((target) => target.region === region);
      if (index >= 0) {
        if (current.length === 1) return current;
        const next = current.filter((target) => target.region !== region);
        setActiveTargetIndex((active) => Math.min(active, next.length - 1));
        return next;
      }
      return [...current, { region, side: "BOTH" }];
    });
  };

  const setActiveSide = (nextSide: BodySide) => {
    setSelectedTargets((current) => current.map((target, index) => index === activeTargetIndex ? { ...target, side: nextSide } : target));
  };

  const moveTargetPriority = (index: number, direction: -1 | 1) => {
    setSelectedTargets((current) => {
      const nextIndex = Math.min(Math.max(index + direction, 0), current.length - 1);
      if (nextIndex === index) return current;
      const reordered = [...current];
      [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
      setActiveTargetIndex(nextIndex);
      return reordered;
    });
  };

  const moveEditTargetPriority = (index: number, direction: -1 | 1) => {
    setEditIntent((current) => {
      const currentTargets = current.targetOrder?.length ? current.targetOrder : selectedTargets;
      const nextIndex = Math.min(Math.max(index + direction, 0), currentTargets.length - 1);
      if (nextIndex === index) return current;
      const reordered = [...currentTargets];
      [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
      return { ...current, targetOrder: reordered };
    });
  };

  const adjustMainSegmentDuration = (segment: ProgramSegment, change: -30 | 30) => {
    setEditIntent((current) => {
      const overrides = { ...(current.mainDurationOverrides ?? {}) };
      overrides[segment.id] = Math.min(180, Math.max(30, (overrides[segment.id] ?? segment.durationSec) + change));
      return { ...current, mainDurationOverrides: overrides };
    });
  };

  const toggleGentleSubstitute = (segment: ProgramSegment) => {
    setEditIntent((current) => {
      const variants = { ...(current.substituteVariants ?? {}) };
      variants[segment.id] = variants[segment.id] === "GENTLE" ? "DEFAULT" : "GENTLE";
      return { ...current, substituteVariants: variants };
    });
  };

  const continueFromMode = () => {
    if (massageMode === "SELF") {
      setSelectedMemberId("self");
      applySavedPreferences("self");
      setScreen("HOME");
      return;
    }
    if (selectedMemberId === "self" && helperMembers[0]) setSelectedMemberId(helperMembers[0].id);
    setScreen("MEMBER");
  };

  const openMemberForm = (member?: HouseholdMember) => {
    setEditingMemberId(member?.id ?? null);
    setMemberNameDraft(member?.label ?? "");
    setScreen("MEMBER_FORM");
  };

  const saveMember = () => {
    const label = memberNameDraft.trim();
    if (!label) return;

    if (editingMemberId) {
      setMembers((current) => current.map((member) => member.id === editingMemberId ? { ...member, label, initials: label.slice(0, 1) } : member));
    } else {
      const id = `member-${Date.now()}`;
      setMembers((current) => [...current, { id, label, detail: "本機家庭成員", initials: label.slice(0, 1) }]);
      setSelectedMemberId(id);
    }
    setMemberNameDraft("");
    setEditingMemberId(null);
    setScreen("MANAGE");
  };

  const confirmDeleteMember = () => {
    if (!pendingDeleteId || pendingDeleteId === "self" || helperMembers.length <= 1) return;
    const remaining = members.filter((member) => member.id !== pendingDeleteId);
    setMembers(remaining);
    if (selectedMemberId === pendingDeleteId) setSelectedMemberId(remaining.find((member) => member.id !== "self")?.id ?? "self");
    setPreferencesByMember((current) => {
      const { [pendingDeleteId]: _removed, ...remainingPreferences } = current;
      return remainingPreferences;
    });
    setPendingDeleteId(null);
  };

  const replayHistoryEntry = (entry: SessionHistoryEntry) => {
    const availableHelper = members.find((member) => member.id === entry.memberId && member.id !== "self")
      ?? helperMembers[0];
    const nextMemberId = entry.massageMode === "SELF" ? "self" : availableHelper?.id ?? "self";
    setMassageMode(entry.massageMode);
    setSelectedMemberId(nextMemberId);
    setSelectedTargets(entry.targets.map((target) => ({ ...target })));
    setActiveTargetIndex(0);
    setDurationMinutes(entry.durationMinutes);
    setSessionContext({ ...entry.context });
    setEditIntent(cloneEditIntent(entry.editIntent));
    setCurrentIndex(0);
    setDemoIndex(0);
    setOutcome(null);
    setActiveHistoryId(null);
    setScreen("PREVIEW");
  };

  const recordOutcome = (nextOutcome: SessionOutcome) => {
    setOutcome(nextOutcome);
    if (activeHistoryId) setHistory((current) => updateHistoryOutcome(current, activeHistoryId, nextOutcome));
  };

  const renderDeclaration = () => (
    <ScrollView contentContainerStyle={styles.declarationPage} showsVerticalScrollIndicator={false}>
      <View style={styles.declarationMark}><Text style={styles.declarationMarkText}>MF</Text></View>
      <Text style={styles.eyebrow}>MASSAGE FLOW</Text>
      <Text style={styles.declarationTitle}>開始前，先確認你的使用方式。</Text>
      <Text style={styles.declarationLead}>這個 Prototype 以一般放鬆流程為目的，會用清楚的步驟帶領你完成肩／上背按摩。</Text>
      <View style={styles.declarationCard}>
        <Text style={styles.declarationCardTitle}>請留意</Text>
        <Text style={styles.declarationLine}>• 只供 18 歲或以上成年人使用。</Text>
        <Text style={styles.declarationLine}>• 不作診斷、治療或取代專業意見。</Text>
        <Text style={styles.declarationLine}>• 如感到不適，請立即停止本次流程。</Text>
      </View>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: hasAcceptedDeclaration }}
        accessibilityLabel="確認已年滿十八歲並明白使用說明"
        hitSlop={12}
        onPress={() => setHasAcceptedDeclaration((value) => !value)}
        style={({ pressed }) => [styles.confirmCard, hasAcceptedDeclaration && styles.confirmCardSelected, pressed && styles.optionCardPressed]}
      >
        <View style={[styles.confirmBox, hasAcceptedDeclaration && styles.confirmBoxSelected]}>{hasAcceptedDeclaration && <Text style={styles.confirmCheck}>✓</Text>}</View>
        <Text style={styles.confirmCopy}>我確認已年滿 18 歲，並明白以上使用說明。</Text>
      </Pressable>
      <View style={styles.declarationAction}><PrimaryButton label={hasAcceptedDeclaration ? "我明白並繼續" : "確認已滿 18 歲並繼續"} onPress={() => { setHasAcceptedDeclaration(true); setScreen("MODE"); }} /></View>
    </ScrollView>
  );

  const renderMode = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepLabel}>開始設定</Text>
      <Text style={styles.screenTitle}>今次想怎樣使用？</Text>
      <Text style={styles.screenSubtitle}>先選擇角色，之後再安排概括部位與流程。</Text>
      <View style={styles.modeStack}>
        <Pressable onPress={() => chooseMassageMode("SELF")} style={({ pressed }) => [styles.modeCard, massageMode === "SELF" && styles.modeCardSelected, pressed && styles.optionCardPressed]}>
          <View style={styles.modeIcon}><Text style={styles.modeIconText}>我</Text></View>
          <View style={styles.optionCopy}><Text style={[styles.optionTitle, massageMode === "SELF" && styles.optionTitleSelected]}>自己按</Text><Text style={styles.optionHelper}>流程會以自己較容易觸及的位置為基準。</Text></View>
          <View style={[styles.radio, massageMode === "SELF" && styles.radioSelected]}>{massageMode === "SELF" && <View style={styles.radioDot} />}</View>
        </Pressable>
        <Pressable onPress={() => chooseMassageMode("HELP_OTHER")} style={({ pressed }) => [styles.modeCard, massageMode === "HELP_OTHER" && styles.modeCardSelected, pressed && styles.optionCardPressed]}>
          <View style={styles.modeIcon}><Text style={styles.modeIconText}>＋</Text></View>
          <View style={styles.optionCopy}><Text style={[styles.optionTitle, massageMode === "HELP_OTHER" && styles.optionTitleSelected]}>幫伴侶／成年家人按</Text><Text style={styles.optionHelper}>流程會以按摩者的操作次序作為提示。</Text></View>
          <View style={[styles.radio, massageMode === "HELP_OTHER" && styles.radioSelected]}>{massageMode === "HELP_OTHER" && <View style={styles.radioDot} />}</View>
        </Pressable>
      </View>
      <View style={styles.modeNote}><Text style={styles.modeNoteTitle}>{massageMode === "SELF" ? "自己按會直接開始" : "下一步選擇家庭成員"}</Text><Text style={styles.modeNoteText}>{massageMode === "SELF" ? "已自動設定為「我」，不需要再選擇安排對象。" : "你可在下一頁選擇、新增或管理要接受按摩的成年人。"}</Text></View>
      <View style={styles.bottomActions}><GhostButton label="返回聲明" onPress={() => setScreen("DECLARATION")} /><PrimaryButton label={massageMode === "SELF" ? "開始設定部位" : "選擇家庭成員"} onPress={continueFromMode} /></View>
    </ScrollView>
  );

  const renderMember = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.memberHeader}><Text style={styles.stepLabel}>本機家庭檔案</Text><Pressable onPress={() => setScreen("MANAGE")} style={styles.manageLink}><Text style={styles.manageLinkText}>管理</Text></Pressable></View>
      <Text style={styles.screenTitle}>今次為誰安排流程？</Text>
      <Text style={styles.screenSubtitle}>揀今次要幫手按嘅本機家庭成員；「我」只會喺自己按模式自動使用。</Text>
      <View style={styles.memberStack}>
        {helperMembers.map((member) => {
          const selected = member.id === selectedHelperMember?.id;
          return (
            <Pressable key={member.id} onPress={() => setSelectedMemberId(member.id)} style={({ pressed }) => [styles.memberCard, selected && styles.memberCardSelected, pressed && styles.optionCardPressed]}>
              <View style={[styles.memberAvatar, selected && styles.memberAvatarSelected]}><Text style={[styles.memberAvatarText, selected && styles.memberAvatarTextSelected]}>{member.initials}</Text></View>
              <View style={styles.optionCopy}><Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>{member.label}</Text><Text style={styles.optionHelper}>{member.detail}</Text></View>
              <View style={[styles.radio, selected && styles.radioSelected]}>{selected && <View style={styles.radioDot} />}</View>
            </Pressable>
          );
        })}
      </View>
      {selectedHelperMember && <View style={styles.memberNote}><Text style={styles.memberNoteTitle}>目前對象：{selectedHelperMember.label}</Text><Text style={styles.memberNoteText}>完成流程後可回到此處，選擇另一位家庭成員重新開始。</Text></View>}
      <Pressable onPress={() => openMemberForm()} style={({ pressed }) => [styles.addMemberButton, pressed && styles.optionCardPressed]}><Text style={styles.addMemberButtonText}>＋ 新增家庭成員</Text></Pressable>
      <View style={styles.bottomActions}><GhostButton label="返回使用方式" onPress={() => setScreen("MODE")} /><PrimaryButton label={selectedHelperMember ? `為${selectedHelperMember.label}開始` : "新增家庭成員"} onPress={() => { if (selectedHelperMember) { setSelectedMemberId(selectedHelperMember.id); setScreen("HOME"); } else { openMemberForm(); } }} /></View>
    </ScrollView>
  );

  const renderManageMembers = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.memberHeader}><Text style={styles.stepLabel}>本機家庭檔案</Text><Pressable onPress={() => openMemberForm()} style={styles.manageLink}><Text style={styles.manageLinkText}>＋ 新增</Text></Pressable></View>
      <Text style={styles.screenTitle}>管理家庭成員</Text>
      <Text style={styles.screenSubtitle}>只管理幫他人按時可選嘅對象；「我」會喺自己按模式自動使用。</Text>
      <View style={styles.manageList}>
        {helperMembers.map((member) => (
          <View key={member.id} style={styles.manageMemberCard}>
            <View style={styles.memberAvatar}><Text style={styles.memberAvatarText}>{member.initials}</Text></View>
            <View style={styles.optionCopy}><Text style={styles.optionTitle}>{member.label}</Text><Text style={styles.optionHelper}>{member.detail}</Text></View>
            <View style={styles.memberActions}><Pressable onPress={() => openMemberForm(member)} style={styles.smallAction}><Text style={styles.smallActionText}>編輯</Text></Pressable><Pressable disabled={helperMembers.length === 1} onPress={() => setPendingDeleteId(member.id)} style={({ pressed }) => [styles.smallAction, styles.deleteAction, helperMembers.length === 1 && styles.actionDisabled, pressed && styles.optionCardPressed]}><Text style={styles.deleteActionText}>刪除</Text></Pressable></View>
          </View>
        ))}
      </View>
      {pendingDeleteId && (
        <View style={styles.deleteConfirmCard}>
          <Text style={styles.deleteConfirmTitle}>確定刪除此家庭成員？</Text>
          <Text style={styles.deleteConfirmText}>刪除後將不能在此 Prototype 內復原。</Text>
          <View style={styles.deleteConfirmActions}><GhostButton label="取消" onPress={() => setPendingDeleteId(null)} /><Pressable onPress={confirmDeleteMember} style={({ pressed }) => [styles.deleteConfirmButton, pressed && styles.optionCardPressed]}><Text style={styles.deleteConfirmButtonText}>確認刪除</Text></Pressable></View>
        </View>
      )}
      <View style={styles.bottomActions}><GhostButton label="返回選擇" onPress={() => { setPendingDeleteId(null); setScreen("MEMBER"); }} /><PrimaryButton label="新增家庭成員" onPress={() => openMemberForm()} /></View>
    </ScrollView>
  );

  const renderMemberForm = () => {
    const isEditing = Boolean(editingMemberId);
    return (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.stepLabel}>本機家庭檔案</Text>
        <Text style={styles.screenTitle}>{isEditing ? "編輯家庭成員" : "新增家庭成員"}</Text>
        <Text style={styles.screenSubtitle}>請輸入一個方便辨識的名稱，例如「我」、「伴侶」或「媽媽」。</Text>
        <View style={styles.formCard}>
          <Text style={styles.formLabel}>顯示名稱</Text>
          <TextInput value={memberNameDraft} onChangeText={setMemberNameDraft} placeholder="輸入名稱" placeholderTextColor="#8B9893" autoFocus maxLength={20} returnKeyType="done" onSubmitEditing={saveMember} style={styles.memberNameInput} />
          <Text style={styles.formHelp}>資料只在此 Prototype 的當前本機狀態中使用。</Text>
        </View>
        <View style={styles.bottomActions}><GhostButton label="取消" onPress={() => { setMemberNameDraft(""); setEditingMemberId(null); setScreen("MANAGE"); }} /><PrimaryButton label={isEditing ? "儲存變更" : "新增成員"} disabled={!memberNameDraft.trim()} onPress={saveMember} /></View>
      </ScrollView>
    );
  };

  const renderHome = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.heroRow}>
        <View>
          <Text style={styles.eyebrow}>MASSAGE FLOW · PROTOTYPE</Text>
          <Text style={styles.heroTitle}>由概括部位，{`\n`}開始一套有節奏的放鬆。</Text>
        </View>
        <View style={styles.heroActions}>
          <Pressable onPress={() => massageMode === "SELF" ? setScreen("MODE") : setScreen("MEMBER")} style={styles.badge}><Text style={styles.badgeText}>{selectedMember.label}</Text></Pressable>
        </View>
      </View>
      <View style={styles.homeCard}>
        <Text style={styles.cardKicker}>本機家庭成員 · {selectedMember.label}</Text>
        <Text style={styles.cardTitle}>由部位開始安排</Text>
        <Text style={styles.cardText}>{massageMode === "SELF" ? "可揀上背、中背或下背；較難自行接觸嘅位置會清楚標示替代流程。" : "可按優先次序揀上背、中背及下背，系統會安排完整嘅按摩者動作流程。"}</Text>
        <BackMap side="BOTH" regions={regionOptions} />
      </View>
      <Pressable onPress={() => setScreen("HISTORY")} style={({ pressed }) => [styles.historyEntryCard, pressed && styles.optionCardPressed]}>
        <View style={styles.historyEntryIcon}><Text style={styles.historyEntryIconText}>↺</Text></View>
        <View style={styles.historyEntryCopy}>
          <Text style={styles.historyEntryTitle}>流程歷史</Text>
          <Text style={styles.historyEntryText}>{history.length > 0 ? `你有 ${history.length} 個已完成流程，可查看或重做同一套設定。` : "完成流程後，會喺呢度保存紀錄同回饋。"}</Text>
        </View>
        <Text style={styles.historyEntryArrow}>›</Text>
      </Pressable>
      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>倒數前，先看懂安排</Text>
        <Text style={styles.noteText}>程序預覽會說明系統如何按部位、優先次序與時長，細分成可跟隨的幾個階段。</Text>
      </View>
      <PrimaryButton label="選擇概括部位" onPress={() => setScreen("REGIONS")} />
      <Text style={styles.disclaimer}>只供一般放鬆使用；如感到不適，請停止並按需要尋求合適協助。</Text>
    </ScrollView>
  );

  const renderRegions = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepLabel}>步驟 1／3</Text>
      <Text style={styles.screenTitle}>想放鬆哪些部位？</Text>
      <Text style={styles.screenSubtitle}>先選概括部位，再逐一設定左右側；清單順序就是系統分配時間的優先次序。</Text>
      <BackMap side="BOTH" regions={selectedTargets.map((target) => target.region)} />
      <View style={styles.optionStack}>
        {regionOptions.map((region) => {
          const selected = selectedTargets.some((target) => target.region === region);
          const detail = REGION_DETAILS[region];
          return (
            <Pressable key={region} onPress={() => toggleRegion(region)} style={({ pressed }) => [styles.optionCard, selected && styles.optionCardSelected, pressed && styles.optionCardPressed]}>
              <View style={[styles.radio, selected && styles.radioSelected]}>{selected && <View style={styles.radioDot} />}</View>
              <View style={styles.optionCopy}>
                <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>{detail.label}</Text>
                <Text style={styles.optionHelper}>{massageMode === "SELF" ? detail.selfHint : detail.helperHint}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.priorityCard}>
        <Text style={styles.priorityTitle}>處理優先次序</Text>
        <Text style={styles.priorityCopy}>排喺前面嘅部位會獲得較多主要按摩時間。</Text>
        {selectedTargets.map((target, index) => (
          <View key={target.region} style={styles.priorityRow}>
            <View style={styles.priorityNumber}><Text style={styles.priorityNumberText}>{index + 1}</Text></View>
            <Text style={styles.priorityName}>{REGION_DETAILS[target.region].label}</Text>
            <Pressable disabled={index === 0} onPress={() => moveTargetPriority(index, -1)} style={[styles.priorityMove, index === 0 && styles.priorityMoveDisabled]}><Text style={styles.priorityMoveText}>↑</Text></Pressable>
            <Pressable disabled={index === selectedTargets.length - 1} onPress={() => moveTargetPriority(index, 1)} style={[styles.priorityMove, index === selectedTargets.length - 1 && styles.priorityMoveDisabled]}><Text style={styles.priorityMoveText}>↓</Text></Pressable>
          </View>
        ))}
      </View>
      <View style={styles.bottomActions}><GhostButton label="返回" onPress={() => setScreen("HOME")} /><PrimaryButton label="確認左右側" onPress={() => { setActiveTargetIndex(0); setScreen("SELECT"); }} /></View>
    </ScrollView>
  );

  const renderSelection = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepLabel}>步驟 2／3 · 部位 {activeTargetIndex + 1}／{selectedTargets.length}</Text>
      <Text style={styles.screenTitle}>{REGION_DETAILS[activeTarget.region].label}想放鬆哪一邊？</Text>
      <Text style={styles.screenSubtitle}>{massageMode === "SELF" ? REGION_DETAILS[activeTarget.region].selfHint : "先確認左右側；肌群同動作會由系統喺下一步安排。"}</Text>
      <BackMap side={activeTarget.side} regions={[activeTarget.region]} />
      {massageMode === "SELF" && <View style={styles.reachabilityCard}><Text style={styles.reachabilityTitle}>自己按可觸及範圍</Text><Text style={styles.reachabilityText}>{REGION_DETAILS[activeTarget.region].selfHint}</Text></View>}
      <View style={styles.optionStack}>
        {sideOptions.map((option) => {
          const selected = activeTarget.side === option.value;
          return (
            <Pressable key={option.value} onPress={() => setActiveSide(option.value)} style={({ pressed }) => [styles.optionCard, selected && styles.optionCardSelected, pressed && styles.optionCardPressed]}>
              <View style={[styles.radio, selected && styles.radioSelected]}>{selected && <View style={styles.radioDot} />}</View>
              <View style={styles.optionCopy}>
                <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>{option.label}{REGION_DETAILS[activeTarget.region].label}</Text>
                <Text style={styles.optionHelper}>{option.helper}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.bottomActions}><GhostButton label="返回部位" onPress={() => setScreen("REGIONS")} /><PrimaryButton label={activeTargetIndex === selectedTargets.length - 1 ? "下一步：揀感受" : "確認下一個部位"} onPress={() => activeTargetIndex === selectedTargets.length - 1 ? setScreen("CONTEXT") : setActiveTargetIndex((index) => index + 1)} /></View>
    </ScrollView>
  );

  const renderContext = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepLabel}>步驟 3／4</Text>
      <Text style={styles.screenTitle}>今次感覺點？</Text>
      <Text style={styles.screenSubtitle}>呢啲快捷選項會影響暖身、收尾同主要按摩時間；唔會作診斷。</Text>

      <View style={styles.contextSection}>
        <Text style={styles.contextLabel}>主要感受</Text>
        <View style={styles.contextChipRow}>
          {sensationOptions.map((option) => {
            const selected = sessionContext.sensation === option.value;
            return <Pressable key={option.value} onPress={() => setSessionContext((current) => ({ ...current, sensation: option.value }))} style={({ pressed }) => [styles.contextChip, selected && styles.contextChipSelected, pressed && styles.optionCardPressed]}><Text style={[styles.contextChipText, selected && styles.contextChipTextSelected]}>{option.label}</Text></Pressable>;
          })}
        </View>
      </View>

      <View style={styles.contextSection}>
        <Text style={styles.contextLabel}>程度：{sessionContext.severity}／5</Text>
        <View style={styles.severityRow}>
          {([1, 2, 3, 4, 5] as const).map((level) => {
            const selected = sessionContext.severity === level;
            return <Pressable key={level} onPress={() => setSessionContext((current) => ({ ...current, severity: level }))} style={({ pressed }) => [styles.severityButton, selected && styles.severityButtonSelected, pressed && styles.optionCardPressed]}><Text style={[styles.severityText, selected && styles.severityTextSelected]}>{level}</Text></Pressable>;
          })}
        </View>
        {sessionContext.severity >= 4 && <Text style={styles.contextHint}>程度較高時，系統會保留更多暖身同收尾時間，並採用較保守節奏。</Text>}
      </View>

      <View style={styles.contextSection}>
        <Text style={styles.contextLabel}>感覺咗幾耐？</Text>
        <View style={styles.contextChipRow}>
          {conditionDurationOptions.map((option) => {
            const selected = sessionContext.durationBand === option.value;
            return <Pressable key={option.value} onPress={() => setSessionContext((current) => ({ ...current, durationBand: option.value }))} style={({ pressed }) => [styles.contextChip, selected && styles.contextChipSelected, pressed && styles.optionCardPressed]}><Text style={[styles.contextChipText, selected && styles.contextChipTextSelected]}>{option.label}</Text></Pressable>;
          })}
        </View>
      </View>

      <View style={styles.contextSection}>
        <Text style={styles.contextLabel}>今次目標</Text>
        <View style={styles.optionStack}>
          {goalOptions.map((option) => {
            const selected = sessionContext.goal === option.value;
            return <Pressable key={option.value} onPress={() => setSessionContext((current) => ({ ...current, goal: option.value }))} style={({ pressed }) => [styles.optionCard, selected && styles.optionCardSelected, pressed && styles.optionCardPressed]}><View style={[styles.radio, selected && styles.radioSelected]}>{selected && <View style={styles.radioDot} />}</View><View style={styles.optionCopy}><Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>{option.label}</Text><Text style={styles.optionHelper}>{option.helper}</Text></View></Pressable>;
          })}
        </View>
      </View>

      <View style={styles.bottomActions}><GhostButton label="返回左右側" onPress={() => setScreen("SELECT")} /><PrimaryButton label="下一步：揀時間" onPress={() => setScreen("DURATION")} /></View>
    </ScrollView>
  );

  const renderDuration = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepLabel}>步驟 4／4</Text>
      <Text style={styles.screenTitle}>你有多少時間？</Text>
      <Text style={styles.screenSubtitle}>已選：{selectedRegionLabels}。系統會保留暖身和收尾，再按優先次序分配主要段落。</Text>
      <View style={styles.durationRow}>
        {durationOptions.map((minutes) => {
          const selected = durationMinutes === minutes;
          return (
            <Pressable key={minutes} onPress={() => setDurationMinutes(minutes)} style={({ pressed }) => [styles.durationCard, selected && styles.durationCardSelected, pressed && styles.optionCardPressed]}>
              <Text style={[styles.durationValue, selected && styles.durationValueSelected]}>{minutes}</Text>
              <Text style={[styles.durationUnit, selected && styles.durationValueSelected]}>分鐘</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.ruleCard}>
        <Text style={styles.ruleEyebrow}>今次編排規則</Text>
        <Text style={styles.ruleText}>{program.contextNotice}</Text>
      </View>
      <View style={styles.bottomActions}><GhostButton label="返回感受" onPress={() => setScreen("CONTEXT")} /><PrimaryButton label="為我安排流程" onPress={() => setScreen("BUILDING")} /></View>
    </ScrollView>
  );

  const renderBuilding = () => (
    <View style={styles.centerPage}>
      <View style={styles.orbit}><View style={styles.orbitCore} /></View>
      <Text style={styles.screenTitle}>正在安排你的節奏</Text>
      <Text style={[styles.screenSubtitle, styles.centerText]}>而家將「{selectedRegionLabels}」按優先次序細分成可跟隨嘅動作同時段。</Text>
      <View style={styles.buildingSteps}>
        <Text style={styles.buildingStep}>✓ 保留暖身與收尾</Text>
        <Text style={styles.buildingStep}>✓ 按優先次序安排 {selectedRegionLabels}</Text>
        <Text style={styles.buildingStep}>✓ 按你嘅感受同目標調整節奏</Text>
        <Text style={styles.buildingStep}>{massageMode === "SELF" ? "✓ 以可觸及動作及替代流程編排" : "✓ 保留完整的按摩者視角動作"}</Text>
        <Text style={styles.buildingStep}>✓ 準備預覽與示範</Text>
      </View>
    </View>
  );

  const renderPreview = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.previewHeader}>
        <View><Text style={styles.eyebrow}>你的按摩程序</Text><Text style={styles.screenTitle}>先看懂，再開始。</Text></View>
        <View style={styles.timePill}><Text style={styles.timePillText}>{durationMinutes} 分鐘</Text></View>
      </View>
      <View style={styles.explainCard}>
        <Text style={styles.explainTitle}>系統如何細分</Text>
        <Text style={styles.explainText}>你揀咗 {selectedRegionLabels}。以下係按優先次序同固定安全規則產生嘅 {program.segments.length} 個可執行段落。</Text>
        <View style={styles.modeNotice}><Text style={styles.modeNoticeText}>{program.contextNotice}</Text><Text style={styles.modeNoticeText}>{program.allocationNotice}</Text></View>
        <View style={styles.modeNotice}><Text style={styles.modeNoticeText}>{program.modeNotice}</Text></View>
        <Pressable onPress={() => { setDemoIndex(0); setScreen("DEMO"); }} style={({ pressed }) => [styles.demoButton, pressed && styles.ghostPressed]}><Text style={styles.demoButtonText}>觀看整套示範</Text><Text style={styles.demoButtonArrow}>↗</Text></Pressable>
        {hasEdits && <Text style={styles.editAppliedNote}>已套用你嘅受控調整；總時長同必要暖身／收尾已重新驗證。</Text>}
      </View>
      <View style={styles.timeline}>
        {program.segments.map((segment, index) => (
          <View key={segment.id} style={styles.segmentRow}>
            <View style={styles.timelineRail}><View style={[styles.timelineDot, segment.phase === "MAIN" && styles.timelineDotMain]} />{index < program.segments.length - 1 && <View style={styles.timelineLine} />}</View>
            <Pressable onPress={() => { setDemoIndex(index); setScreen("DEMO"); }} style={({ pressed }) => [styles.segmentCard, pressed && styles.optionCardPressed]}>
              <View style={styles.segmentTopLine}><Text style={styles.segmentPhase}>{phaseLabel[segment.phase]}</Text><Text style={styles.segmentDuration}>{formatDuration(segment.durationSec)}</Text></View>
              <Text style={styles.segmentTitle}>{segment.muscleName}</Text>
              <Text style={styles.segmentDetail}>{segment.technique} · {segment.plainLocation}</Text>
              {segment.adaptationLabel && <View style={styles.adaptationBadge}><Text style={styles.adaptationBadgeText}>{segment.adaptationLabel}</Text></View>}
              <Text style={styles.segmentDemoLink}>查看示範  ›</Text>
            </Pressable>
          </View>
        ))}
      </View>
      <View style={styles.previewActions}><GhostButton label="調整程序" onPress={() => setScreen("EDIT")} /><PrimaryButton label="開始逐段引導" onPress={startGuide} /></View>
    </ScrollView>
  );

  const renderEdit = () => {
    const editableTargets = editIntent.targetOrder?.length ? editIntent.targetOrder : selectedTargets;
    const mainSegments = program.segments.filter((segment) => segment.phase === "MAIN");
    return (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepLabel}>程序預覽 · 受控調整</Text>
        <Text style={styles.screenTitle}>微調先開始。</Text>
        <Text style={styles.screenSubtitle}>只可以改已審核嘅次序、時長同替代動作；必要暖身、收尾同總時間會保留。</Text>
        {editableTargets.length > 1 && <View style={styles.editSection}>
          <Text style={styles.editSectionTitle}>部位優先次序</Text>
          <Text style={styles.editSectionHint}>排得較前嘅部位會分到較多主要時間。</Text>
          {editableTargets.map((target, index) => <View key={`${target.region}-${target.side}`} style={styles.editTargetRow}>
            <View style={styles.editTargetNumber}><Text style={styles.editTargetNumberText}>{index + 1}</Text></View>
            <Text style={styles.editTargetName}>{REGION_DETAILS[target.region].label} · {sideOptions.find((option) => option.value === target.side)?.label}</Text>
            <Pressable disabled={index === 0} onPress={() => moveEditTargetPriority(index, -1)} style={[styles.editMoveButton, index === 0 && styles.priorityMoveDisabled]}><Text style={styles.editMoveText}>↑</Text></Pressable>
            <Pressable disabled={index === editableTargets.length - 1} onPress={() => moveEditTargetPriority(index, 1)} style={[styles.editMoveButton, index === editableTargets.length - 1 && styles.priorityMoveDisabled]}><Text style={styles.editMoveText}>↓</Text></Pressable>
          </View>)}
        </View>}
        <View style={styles.editSection}>
          <Text style={styles.editSectionTitle}>主要段落時長</Text>
          <Text style={styles.editSectionHint}>每次可加減 30 秒；系統只會按畫面次序同下一個可補償嘅主要段落交收時間，總時長維持不變。</Text>
          {mainSegments.map((segment) => <View key={segment.id} style={styles.editSegmentCard}>
            <View style={styles.editSegmentCopy}><Text style={styles.editSegmentTitle}>{segment.muscleName}</Text><Text style={styles.editSegmentDetail}>{segment.technique} · {formatDuration(segment.durationSec)}</Text></View>
            <View style={styles.editDurationControls}><Pressable onPress={() => adjustMainSegmentDuration(segment, -30)} style={styles.editAdjustButton}><Text style={styles.editAdjustText}>−</Text></Pressable><Text style={styles.editDurationText}>{formatDuration(segment.durationSec)}</Text><Pressable onPress={() => adjustMainSegmentDuration(segment, 30)} style={styles.editAdjustButton}><Text style={styles.editAdjustText}>＋</Text></Pressable></View>
            {segment.reachability === "SUBSTITUTE_ONLY" && <Pressable onPress={() => toggleGentleSubstitute(segment)} style={styles.editSubstituteButton}><Text style={styles.editSubstituteText}>{(editIntent.substituteVariants ?? {})[segment.id] === "GENTLE" ? "改回原有替代動作" : "改用較柔和替代動作"}</Text></Pressable>}
          </View>)}
        </View>
        <View style={styles.bottomActions}><GhostButton label="放棄改動" onPress={() => { setEditIntent({}); setScreen("PREVIEW"); }} /><PrimaryButton label="更新程序預覽" onPress={() => setScreen("PREVIEW")} /></View>
      </ScrollView>
    );
  };

  const renderDemo = () => {
    const segment = program.segments[demoIndex];
    return (
      <ScrollView style={styles.fullPageScroll} contentContainerStyle={[styles.demoPage, { paddingBottom: bottomScrollSpace }]} showsVerticalScrollIndicator={false}>
        <View style={styles.demoTop}><Text style={styles.stepLabel}>示範 {demoIndex + 1}／{program.segments.length}</Text><GhostButton label="返回預覽" onPress={() => setScreen("PREVIEW")} /></View>
        <View style={styles.demoVisual}><BackMap side={segment.side} regions={[segment.region]} emphasis /><View style={styles.demoNumber}><Text style={styles.demoNumberText}>{demoIndex + 1}</Text></View></View>
        <Text style={styles.segmentPhase}>{phaseLabel[segment.phase]}</Text>
        <Text style={styles.demoTitle}>{segment.muscleName}</Text>
        <Text style={styles.demoLocation}>{segment.plainLocation}</Text>
        <Text style={styles.demoInstruction}>{segment.instruction}</Text>
        {segment.adaptationLabel && <View style={styles.demoAdaptation}><Text style={styles.demoAdaptationText}>{segment.adaptationLabel}：這個步驟已取代較難自行接觸的位置。</Text></View>}
        <View style={styles.demoTip}><Text style={styles.demoTipLabel}>手法</Text><Text style={styles.demoTipText}>{segment.technique} · 輕至中等力度</Text></View>
        <View style={styles.demoNav}><GhostButton label="‹ 上一段" onPress={() => setDemoIndex((index) => Math.max(0, index - 1))} /><PrimaryButton label={demoIndex === program.segments.length - 1 ? "返回程序" : "下一段示範"} onPress={() => demoIndex === program.segments.length - 1 ? setScreen("PREVIEW") : setDemoIndex((index) => index + 1)} /></View>
      </ScrollView>
    );
  };

  const renderGuide = () => {
    const progress = ((currentIndex + 1) / program.segments.length) * 100;
    const isFinalSegment = currentIndex === program.segments.length - 1;
    const finishSession = () => {
      completeSession();
    };
    return (
      <ScrollView style={styles.fullPageScroll} contentContainerStyle={[styles.guidePage, { paddingBottom: bottomScrollSpace }]} showsVerticalScrollIndicator={false}>
        <View style={styles.guideTop}><Pressable onPress={() => { setIsRunning(false); setScreen("PREVIEW"); }} style={styles.closeButton}><Text style={styles.closeText}>×</Text></Pressable><View><Text style={styles.guideCounter}>第 {currentIndex + 1}／{program.segments.length} 段</Text><Text style={styles.guideTotal}>總餘 {formatDuration(totalRemaining)}</Text></View></View>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
        <View style={styles.guideVisual}><BackMap side={currentSegment.side} regions={[currentSegment.region]} emphasis /></View>
        <Text style={styles.guidePhase}>{phaseLabel[currentSegment.phase]}</Text>
        <Text style={styles.guideTitle}>{currentSegment.muscleName}</Text>
        <Text style={styles.guideLocation}>{currentSegment.plainLocation}</Text>
        <Text style={styles.guideInstruction}>{currentSegment.instruction}</Text>
        {currentSegment.adaptationLabel && <Text style={styles.guideAdaptation}>{currentSegment.adaptationLabel}：已避開較難自行接觸的位置。</Text>}
        <View style={styles.countdownCard}><Text style={styles.countdownLabel}>本段餘下</Text><Text style={styles.countdownValue}>{formatDuration(segmentRemaining)}</Text><Text style={styles.nextHint}>{currentSegment.nextHint}</Text></View>
        {isFinalSegment ? (
          <View style={styles.finalActionArea}>
            <Text style={styles.finalActionHint}>這是最後一段，可隨時完成流程。</Text>
            <Pressable onPress={finishSession} style={({ pressed }) => [styles.finalActionButton, pressed && styles.primaryButtonPressed]}>
              <Text style={styles.finalActionButtonText}>完成並結束流程</Text>
              <Text style={styles.finalActionArrow}>✓</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.controls}><Pressable onPress={() => moveSegment(-1)} style={styles.roundControl}><Text style={styles.controlText}>‹</Text></Pressable><Pressable onPress={() => setIsRunning((value) => !value)} style={styles.playControl}><Text style={styles.playText}>{isRunning ? "暫停" : "繼續"}</Text></Pressable><Pressable onPress={() => moveSegment(1)} style={styles.roundControl}><Text style={styles.controlText}>›</Text></Pressable></View>
            <Pressable onPress={finishSession} style={styles.endLink}><Text style={styles.endLinkText}>結束本次流程</Text></Pressable>
          </>
        )}
      </ScrollView>
    );
  };

  const renderDone = () => (
    <ScrollView contentContainerStyle={styles.donePage} showsVerticalScrollIndicator={false}>
      <View style={styles.doneSeal}><Text style={styles.doneSealText}>✓</Text></View>
      <Text style={styles.eyebrow}>流程摘要</Text>
      <Text style={styles.doneTitle}>今次嘅{selectedRegionLabels}放鬆流程完成咗。</Text>
      <Text style={styles.doneText}>你完成咗 {completedCount === 0 ? program.segments.length : completedCount} 個安排段落。呢個感受只會喺本機 Prototype 裡面記低。</Text>
      <View style={styles.outcomeStack}>{(["舒服咗", "差唔多", "更加唔舒服"] as const).map((item) => <Pressable key={item} onPress={() => recordOutcome(item)} style={({ pressed }) => [styles.outcomeButton, outcome === item && styles.outcomeButtonSelected, pressed && styles.optionCardPressed]}><Text style={[styles.outcomeText, outcome === item && styles.outcomeTextSelected]}>{item}</Text></Pressable>)}</View>
      {outcome === "更加唔舒服" && <View style={styles.cautionCard}><Text style={styles.cautionText}>請停止今次流程，並按需要搵合適嘅協助。本 Prototype 唔會提供診斷。</Text></View>}
      <Pressable onPress={() => setScreen("HISTORY")} style={({ pressed }) => [styles.doneHistoryEntry, pressed && styles.optionCardPressed]}>
        <View><Text style={styles.doneHistoryTitle}>今次流程已保存</Text><Text style={styles.doneHistoryText}>查看歷史紀錄，或者用相同設定再做一次。</Text></View>
        <Text style={styles.doneHistoryArrow}>›</Text>
      </Pressable>
      <View style={styles.donePrimaryAction}><PrimaryButton label="重新揀使用方式" onPress={resetPrototype} /></View>
    </ScrollView>
  );

  const renderHistory = () => (
    <FlatList
      data={history}
      keyExtractor={(entry) => entry.id}
      contentContainerStyle={styles.historyList}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={styles.historyHeader}>
          <Text style={styles.stepLabel}>本機紀錄</Text>
          <Text style={styles.screenTitle}>之前完成過嘅流程</Text>
          <Text style={styles.screenSubtitle}>資料只會保存在此裝置。你可以用相同設定重做，再於預覽確認。</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.historyEmptyCard}>
          <Text style={styles.historyEmptyTitle}>未有完成紀錄</Text>
          <Text style={styles.historyEmptyText}>完成第一套流程後，呢度會保留對象、部位、時長同你嘅主觀感受。</Text>
        </View>
      }
      renderItem={({ item }) => {
        const regionLabels = item.targets.map((target) => REGION_DETAILS[target.region].shortLabel).join("、");
        const outcomeLabel = item.outcome ?? "未填回饋";
        return (
          <View style={styles.historyCard}>
            <View style={styles.historyCardTop}><Text style={styles.historyDate}>{formatHistoryDate(item.completedAt)}</Text><Text style={styles.historyDuration}>{item.durationMinutes} 分鐘</Text></View>
            <Text style={styles.historyTitle}>{item.memberLabel} · {regionLabels}</Text>
            <Text style={styles.historyMeta}>{item.massageMode === "SELF" ? "自己按" : "幫他人按"} · 完成 {item.completedSegments}／{item.segmentCount} 段 · {outcomeLabel}</Text>
            <Pressable onPress={() => replayHistoryEntry(item)} style={({ pressed }) => [styles.historyReplayButton, pressed && styles.primaryButtonPressed]}><Text style={styles.historyReplayText}>重做同一套流程</Text><Text style={styles.historyReplayArrow}>›</Text></Pressable>
          </View>
        );
      }}
      ListFooterComponent={<View style={styles.historyFooter}><GhostButton label="返回首頁" onPress={() => setScreen("HOME")} /></View>}
    />
  );

  const content = {
    DECLARATION: renderDeclaration,
    MODE: renderMode,
    MEMBER: renderMember,
    MANAGE: renderManageMembers,
    MEMBER_FORM: renderMemberForm,
    HOME: renderHome,
    REGIONS: renderRegions,
    SELECT: renderSelection,
    CONTEXT: renderContext,
    DURATION: renderDuration,
    BUILDING: renderBuilding,
    PREVIEW: renderPreview,
    EDIT: renderEdit,
    DEMO: renderDemo,
    GUIDE: renderGuide,
    DONE: renderDone,
    HISTORY: renderHistory,
  }[screen]();

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="flex-1">{content}</ScreenContainer>;
}

const styles = StyleSheet.create({
  scrollContent: { padding: 24, paddingBottom: 32, gap: 20 },
  heroRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 6 },
  heroActions: { alignItems: "flex-end", gap: 8 },
  eyebrow: { color: "#55706A", fontSize: 12, fontWeight: "700", letterSpacing: 1.2, textTransform: "uppercase" },
  heroTitle: { color: "#1B2523", fontSize: 32, lineHeight: 39, fontWeight: "700", marginTop: 10, letterSpacing: -0.6 },
  badge: { backgroundColor: "#DCE9E3", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  badgeText: { color: "#1F4D4A", fontSize: 13, fontWeight: "700" },
  homeCard: { backgroundColor: "#FFFFFF", borderRadius: 28, padding: 22, borderWidth: 1, borderColor: "#E5E8E3", shadowColor: "#1B2523", shadowOpacity: 0.05, shadowRadius: 20, elevation: 2 },
  cardKicker: { color: "#55706A", fontSize: 13, fontWeight: "600" },
  cardTitle: { color: "#1B2523", fontSize: 24, fontWeight: "700", marginTop: 6 },
  cardText: { color: "#5C6965", fontSize: 15, lineHeight: 22, marginTop: 7 },
  bodyMapWrap: { alignItems: "center", marginVertical: 14 },
  mapCaption: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: -8 },
  mapDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#1F4D4A" },
  mapCaptionText: { color: "#55706A", fontSize: 12, fontWeight: "600" },
  historyEntryCard: { minHeight: 92, backgroundColor: "#E7F0EB", borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center", gap: 13, borderWidth: 1, borderColor: "#C9DED3" },
  historyEntryIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#1F4D4A", alignItems: "center", justifyContent: "center" },
  historyEntryIconText: { color: "#FFFFFF", fontSize: 25, fontWeight: "500", marginTop: -2 },
  historyEntryCopy: { flex: 1 },
  historyEntryTitle: { color: "#1F4D4A", fontSize: 17, fontWeight: "800" },
  historyEntryText: { color: "#587068", fontSize: 13, lineHeight: 19, marginTop: 3 },
  historyEntryArrow: { color: "#1F4D4A", fontSize: 30, fontWeight: "300", marginTop: -3 },
  noteCard: { backgroundColor: "#EEEAE0", borderRadius: 20, padding: 18 },
  noteTitle: { color: "#1B2523", fontSize: 16, fontWeight: "700" },
  noteText: { color: "#5C6965", fontSize: 14, lineHeight: 21, marginTop: 6 },
  priorityCard: { backgroundColor: "#F6F3EC", borderRadius: 20, padding: 16, gap: 10 },
  priorityTitle: { color: "#1B2523", fontSize: 15, fontWeight: "800" },
  priorityCopy: { color: "#63716C", fontSize: 13, lineHeight: 19 },
  priorityRow: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 9, paddingVertical: 4 },
  priorityNumber: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#1F4D4A", alignItems: "center", justifyContent: "center" },
  priorityNumberText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  priorityName: { flex: 1, color: "#30413B", fontSize: 14, fontWeight: "700" },
  priorityMove: { width: 32, height: 32, borderRadius: 11, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DCE4DE", alignItems: "center", justifyContent: "center" },
  priorityMoveDisabled: { opacity: 0.35 },
  priorityMoveText: { color: "#1F4D4A", fontSize: 17, fontWeight: "800" },
  reachabilityCard: { backgroundColor: "#F9F1E6", borderRadius: 18, padding: 16, marginTop: -4 },
  reachabilityTitle: { color: "#8A5B50", fontSize: 14, fontWeight: "800" },
  reachabilityText: { color: "#715D52", fontSize: 13, lineHeight: 20, marginTop: 5 },
  primaryButton: { backgroundColor: "#1F4D4A", minHeight: 54, paddingHorizontal: 18, borderRadius: 17, flexDirection: "row", alignItems: "center", justifyContent: "space-between", flex: 1 },
  primaryButtonPressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  primaryArrow: { color: "#FFFFFF", fontSize: 28, fontWeight: "300", marginTop: -2 },
  disclaimer: { color: "#80908A", fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: -4, paddingHorizontal: 8 },
  declarationPage: { flexGrow: 1, padding: 28, paddingTop: 48, paddingBottom: 32 },
  declarationMark: { width: 56, height: 56, borderRadius: 20, backgroundColor: "#1F4D4A", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  declarationMarkText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800", letterSpacing: 1 },
  declarationTitle: { color: "#1B2523", fontSize: 31, lineHeight: 38, fontWeight: "700", letterSpacing: -0.5, marginTop: 10 },
  declarationLead: { color: "#5C6965", fontSize: 16, lineHeight: 24, marginTop: 13 },
  declarationCard: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 19, gap: 8, marginTop: 24, borderWidth: 1, borderColor: "#E2E8E4" },
  declarationCardTitle: { color: "#1F4D4A", fontSize: 16, fontWeight: "700", marginBottom: 2 },
  declarationLine: { color: "#53625D", fontSize: 14, lineHeight: 21 },
  confirmCard: { flexDirection: "row", gap: 12, padding: 16, borderRadius: 18, borderWidth: 1.5, borderColor: "#D4DED8", backgroundColor: "#FFFFFF", marginTop: 14, alignItems: "center" },
  confirmCardSelected: { borderColor: "#1F4D4A", backgroundColor: "#EFF6F2" },
  confirmBox: { width: 23, height: 23, borderRadius: 7, borderWidth: 1.5, borderColor: "#9AACA4", alignItems: "center", justifyContent: "center" },
  confirmBoxSelected: { backgroundColor: "#1F4D4A", borderColor: "#1F4D4A" },
  confirmCheck: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  confirmCopy: { flex: 1, color: "#35443F", fontSize: 14, lineHeight: 21, fontWeight: "600" },
  declarationAction: { marginTop: "auto", paddingTop: 24 },
  stepLabel: { color: "#D77A61", fontSize: 13, fontWeight: "700", letterSpacing: 0.7 },
  screenTitle: { color: "#1B2523", fontSize: 29, lineHeight: 36, fontWeight: "700", letterSpacing: -0.5 },
  screenSubtitle: { color: "#63716C", fontSize: 15, lineHeight: 23, marginTop: -9 },
  optionStack: { gap: 12 },
  optionCard: { borderWidth: 1.5, borderColor: "#DEE5E0", borderRadius: 18, backgroundColor: "#FFFFFF", padding: 17, flexDirection: "row", alignItems: "center", gap: 13 },
  optionCardSelected: { borderColor: "#1F4D4A", backgroundColor: "#EFF6F2" },
  optionCardPressed: { opacity: 0.75 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: "#AAB8B1", justifyContent: "center", alignItems: "center" },
  radioSelected: { borderColor: "#1F4D4A" },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#1F4D4A" },
  optionCopy: { flex: 1 },
  optionTitle: { color: "#1B2523", fontSize: 16, fontWeight: "700" },
  optionTitleSelected: { color: "#1F4D4A" },
  optionHelper: { color: "#70807A", fontSize: 13, marginTop: 3 },
  modeStack: { gap: 12, marginTop: 16 },
  modeCard: { minHeight: 100, borderWidth: 1.5, borderColor: "#DEE5E0", borderRadius: 20, backgroundColor: "#FFFFFF", padding: 16, flexDirection: "row", alignItems: "center", gap: 13 },
  modeCardSelected: { borderColor: "#1F4D4A", backgroundColor: "#EFF6F2" },
  modeIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: "#DCE9E3", alignItems: "center", justifyContent: "center" },
  modeIconText: { color: "#1F4D4A", fontSize: 18, fontWeight: "800" },
  modeNote: { backgroundColor: "#EEEAE0", borderRadius: 18, padding: 16, marginTop: 8 },
  modeNoteTitle: { color: "#1B2523", fontSize: 14, fontWeight: "700" },
  modeNoteText: { color: "#63716C", fontSize: 13, lineHeight: 20, marginTop: 4 },
  memberStack: { gap: 12, marginTop: 14 },
  memberCard: { minHeight: 82, borderWidth: 1.5, borderColor: "#DEE5E0", borderRadius: 20, backgroundColor: "#FFFFFF", padding: 16, flexDirection: "row", alignItems: "center", gap: 13 },
  memberCardSelected: { borderColor: "#1F4D4A", backgroundColor: "#EFF6F2" },
  memberAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#E8EEE9", alignItems: "center", justifyContent: "center" },
  memberAvatarSelected: { backgroundColor: "#1F4D4A" },
  memberAvatarText: { color: "#42645B", fontSize: 17, fontWeight: "800" },
  memberAvatarTextSelected: { color: "#FFFFFF" },
  memberNote: { backgroundColor: "#EEEAE0", borderRadius: 18, padding: 16, marginTop: 8 },
  memberNoteTitle: { color: "#1B2523", fontSize: 14, fontWeight: "700" },
  memberNoteText: { color: "#63716C", fontSize: 13, lineHeight: 20, marginTop: 4 },
  memberHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  manageLink: { minHeight: 34, paddingHorizontal: 11, borderRadius: 10, backgroundColor: "#E7F0EB", alignItems: "center", justifyContent: "center" },
  manageLinkText: { color: "#1F4D4A", fontSize: 13, fontWeight: "800" },
  addMemberButton: { minHeight: 50, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1.5, borderColor: "#BFD1C7", alignItems: "center", justifyContent: "center" },
  addMemberButtonText: { color: "#1F4D4A", fontSize: 15, fontWeight: "700" },
  manageList: { gap: 11, marginTop: 14 },
  manageMemberCard: { minHeight: 80, borderRadius: 19, borderWidth: 1, borderColor: "#E0E7E2", backgroundColor: "#FFFFFF", padding: 14, flexDirection: "row", alignItems: "center", gap: 11 },
  memberActions: { flexDirection: "row", gap: 6 },
  smallAction: { minHeight: 34, paddingHorizontal: 9, borderRadius: 10, backgroundColor: "#E7F0EB", alignItems: "center", justifyContent: "center" },
  smallActionText: { color: "#1F4D4A", fontSize: 12, fontWeight: "800" },
  deleteAction: { backgroundColor: "#F9E9E4" },
  deleteActionText: { color: "#A55243", fontSize: 12, fontWeight: "800" },
  actionDisabled: { opacity: 0.4 },
  deleteConfirmCard: { backgroundColor: "#F9E9E4", borderRadius: 19, padding: 17, marginTop: 8 },
  deleteConfirmTitle: { color: "#7D4539", fontSize: 16, fontWeight: "800" },
  deleteConfirmText: { color: "#925C50", fontSize: 13, lineHeight: 20, marginTop: 5 },
  deleteConfirmActions: { flexDirection: "row", gap: 10, marginTop: 14 },
  deleteConfirmButton: { flex: 1, minHeight: 54, borderRadius: 17, backgroundColor: "#B65348", alignItems: "center", justifyContent: "center" },
  deleteConfirmButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  formCard: { backgroundColor: "#FFFFFF", borderRadius: 21, padding: 18, marginTop: 16, borderWidth: 1, borderColor: "#E0E7E2" },
  formLabel: { color: "#1F4D4A", fontSize: 13, fontWeight: "800" },
  memberNameInput: { minHeight: 52, borderRadius: 14, borderWidth: 1.5, borderColor: "#BFD1C7", color: "#1B2523", fontSize: 17, fontWeight: "700", paddingHorizontal: 14, marginTop: 9 },
  formHelp: { color: "#71817B", fontSize: 12, lineHeight: 18, marginTop: 9 },
  bottomActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  ghostButton: { minHeight: 54, paddingHorizontal: 16, borderRadius: 17, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#C7D2CB", backgroundColor: "#FFFFFF" },
  ghostButtonText: { color: "#365A52", fontSize: 15, fontWeight: "700" },
  ghostPressed: { opacity: 0.66 },
  durationRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  durationCard: { flex: 1, minHeight: 122, backgroundColor: "#FFFFFF", borderWidth: 1.5, borderColor: "#DEE5E0", borderRadius: 20, alignItems: "center", justifyContent: "center" },
  durationCardSelected: { backgroundColor: "#1F4D4A", borderColor: "#1F4D4A" },
  durationValue: { color: "#1B2523", fontSize: 33, lineHeight: 38, fontWeight: "700" },
  durationUnit: { color: "#66756F", fontSize: 13, marginTop: 3 },
  durationValueSelected: { color: "#FFFFFF" },
  contextSection: { gap: 10 },
  contextLabel: { color: "#1B2523", fontSize: 16, fontWeight: "800" },
  contextChipRow: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  contextChip: { minHeight: 42, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1.5, borderColor: "#D5E1DB", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  contextChipSelected: { borderColor: "#1F4D4A", backgroundColor: "#E7F0EB" },
  contextChipText: { color: "#52645E", fontSize: 14, fontWeight: "700" },
  contextChipTextSelected: { color: "#1F4D4A" },
  severityRow: { flexDirection: "row", gap: 9 },
  severityButton: { flex: 1, minHeight: 48, borderRadius: 14, borderWidth: 1.5, borderColor: "#D5E1DB", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  severityButtonSelected: { borderColor: "#1F4D4A", backgroundColor: "#1F4D4A" },
  severityText: { color: "#52645E", fontSize: 16, fontWeight: "800" },
  severityTextSelected: { color: "#FFFFFF" },
  contextHint: { color: "#8A5B50", fontSize: 13, lineHeight: 20, backgroundColor: "#F9F1E6", borderRadius: 13, padding: 12 },
  ruleCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 19, borderLeftWidth: 4, borderLeftColor: "#D77A61" },
  ruleEyebrow: { color: "#A75B48", fontSize: 12, fontWeight: "700", letterSpacing: 0.8 },
  ruleText: { color: "#35443F", fontSize: 15, lineHeight: 24, marginTop: 7, fontWeight: "600" },
  centerPage: { flex: 1, padding: 28, alignItems: "center", justifyContent: "center", gap: 18 },
  centerText: { textAlign: "center", maxWidth: 290 },
  orbit: { width: 136, height: 136, borderRadius: 68, borderWidth: 1, borderColor: "#B9D1C6", justifyContent: "center", alignItems: "center", backgroundColor: "#EAF3ED" },
  orbitCore: { width: 54, height: 54, borderRadius: 27, backgroundColor: "#1F4D4A" },
  buildingSteps: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 17, gap: 11, width: "100%" },
  buildingStep: { color: "#365A52", fontSize: 14, fontWeight: "600" },
  previewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  timePill: { backgroundColor: "#1F4D4A", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  timePillText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  explainCard: { backgroundColor: "#E7F0EB", borderRadius: 22, padding: 18, gap: 8 },
  explainTitle: { color: "#1F4D4A", fontSize: 17, fontWeight: "700" },
  explainText: { color: "#405750", fontSize: 14, lineHeight: 21 },
  modeNotice: { borderTopWidth: 1, borderTopColor: "#C7DBD0", paddingTop: 9, marginTop: 1 },
  modeNoticeText: { color: "#456058", fontSize: 13, lineHeight: 20, fontWeight: "600" },
  demoButton: { backgroundColor: "#FFFFFF", borderRadius: 13, paddingHorizontal: 14, minHeight: 44, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 3 },
  demoButtonText: { color: "#1F4D4A", fontSize: 14, fontWeight: "700" },
  demoButtonArrow: { color: "#1F4D4A", fontSize: 18 },
  editAppliedNote: { color: "#1F4D4A", fontSize: 12, lineHeight: 18, fontWeight: "700", marginTop: 3 },
  previewActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  editSection: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 17, gap: 11, borderWidth: 1, borderColor: "#E0E7E2" },
  editSectionTitle: { color: "#1B2523", fontSize: 17, fontWeight: "800" },
  editSectionHint: { color: "#64736D", fontSize: 13, lineHeight: 19 },
  editTargetRow: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 8 },
  editTargetNumber: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#1F4D4A", alignItems: "center", justifyContent: "center" },
  editTargetNumberText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  editTargetName: { flex: 1, color: "#35443F", fontSize: 14, fontWeight: "700" },
  editMoveButton: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#F1F5F2", alignItems: "center", justifyContent: "center" },
  editMoveText: { color: "#1F4D4A", fontSize: 17, fontWeight: "800" },
  editSegmentCard: { backgroundColor: "#F7F8F5", borderRadius: 15, padding: 13, gap: 10 },
  editSegmentCopy: { gap: 3 },
  editSegmentTitle: { color: "#1B2523", fontSize: 15, fontWeight: "800" },
  editSegmentDetail: { color: "#66756F", fontSize: 12, lineHeight: 18 },
  editDurationControls: { flexDirection: "row", alignItems: "center", gap: 10 },
  editAdjustButton: { width: 34, height: 34, borderRadius: 11, borderWidth: 1, borderColor: "#C9D8D0", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  editAdjustText: { color: "#1F4D4A", fontSize: 18, fontWeight: "800" },
  editDurationText: { color: "#35443F", fontSize: 15, fontWeight: "800", minWidth: 48, textAlign: "center" },
  editSubstituteButton: { minHeight: 38, borderRadius: 12, backgroundColor: "#F9E9E4", alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  editSubstituteText: { color: "#8B5548", fontSize: 12, fontWeight: "800" },
  timeline: { gap: 2 },
  segmentRow: { flexDirection: "row", gap: 12 },
  timelineRail: { width: 16, alignItems: "center" },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#A5B8B0", marginTop: 19 },
  timelineDotMain: { backgroundColor: "#D77A61" },
  timelineLine: { width: 2, flex: 1, minHeight: 72, backgroundColor: "#D5E1DB", marginTop: 5 },
  segmentCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 17, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "#E2E8E4" },
  segmentTopLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  segmentPhase: { color: "#A75B48", fontSize: 12, fontWeight: "700", letterSpacing: 0.6 },
  segmentDuration: { color: "#66756F", fontSize: 13, fontWeight: "700" },
  segmentTitle: { color: "#1B2523", fontSize: 18, fontWeight: "700", marginTop: 5 },
  segmentDetail: { color: "#63716C", fontSize: 13, marginTop: 4 },
  adaptationBadge: { alignSelf: "flex-start", backgroundColor: "#F9E9E4", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginTop: 9 },
  adaptationBadgeText: { color: "#9B5947", fontSize: 11, fontWeight: "800" },
  segmentDemoLink: { color: "#1F4D4A", fontSize: 13, fontWeight: "700", marginTop: 12 },
  fullPageScroll: { flex: 1 },
  demoPage: { flexGrow: 1, padding: 24 },
  demoTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  demoVisual: { backgroundColor: "#F0F2EA", borderRadius: 28, alignItems: "center", marginVertical: 14, position: "relative" },
  demoNumber: { position: "absolute", top: 18, right: 18, width: 34, height: 34, borderRadius: 17, backgroundColor: "#D77A61", alignItems: "center", justifyContent: "center" },
  demoNumberText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  demoTitle: { color: "#1B2523", fontSize: 30, fontWeight: "700", marginTop: 5 },
  demoLocation: { color: "#65736E", fontSize: 15, marginTop: 4 },
  demoInstruction: { color: "#35443F", fontSize: 17, lineHeight: 27, marginTop: 20 },
  demoAdaptation: { backgroundColor: "#F9E9E4", borderRadius: 15, padding: 13, marginTop: 15 },
  demoAdaptationText: { color: "#8B5548", fontSize: 13, lineHeight: 20, fontWeight: "700" },
  demoTip: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginTop: 18 },
  demoTipLabel: { color: "#A75B48", fontSize: 12, fontWeight: "700" },
  demoTipText: { color: "#1B2523", fontSize: 15, fontWeight: "600", marginTop: 5 },
  demoNav: { flexDirection: "row", gap: 10, marginTop: "auto", paddingTop: 20 },
  guidePage: { flexGrow: 1, padding: 24 },
  guideTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  closeButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#ECEEEA", alignItems: "center", justifyContent: "center" },
  closeText: { fontSize: 27, color: "#42534D", marginTop: -3 },
  guideCounter: { color: "#1B2523", fontSize: 15, fontWeight: "700", textAlign: "right" },
  guideTotal: { color: "#6D7B76", fontSize: 13, marginTop: 3, textAlign: "right" },
  progressTrack: { height: 5, backgroundColor: "#DCE9E3", borderRadius: 3, marginTop: 18, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#D77A61", borderRadius: 3 },
  guideVisual: { minHeight: 242, justifyContent: "center", alignItems: "center" },
  guidePhase: { color: "#A75B48", fontSize: 12, fontWeight: "700", letterSpacing: 0.7, textAlign: "center" },
  guideTitle: { color: "#1B2523", fontSize: 29, fontWeight: "700", textAlign: "center", marginTop: 6 },
  guideLocation: { color: "#65736E", fontSize: 14, textAlign: "center", marginTop: 4 },
  guideInstruction: { color: "#3B4D47", fontSize: 16, lineHeight: 24, textAlign: "center", marginTop: 17, paddingHorizontal: 10 },
  guideAdaptation: { color: "#9B5947", fontSize: 13, lineHeight: 20, textAlign: "center", marginTop: 9, paddingHorizontal: 16, fontWeight: "700" },
  countdownCard: { backgroundColor: "#1F4D4A", borderRadius: 22, padding: 18, marginTop: 18, alignItems: "center" },
  countdownLabel: { color: "#CFE5DA", fontSize: 12, fontWeight: "700", letterSpacing: 0.8 },
  countdownValue: { color: "#FFFFFF", fontSize: 37, lineHeight: 45, fontWeight: "700", marginTop: 4, fontVariant: ["tabular-nums"] },
  nextHint: { color: "#DCE9E3", fontSize: 13, marginTop: 3 },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 18, marginTop: 18 },
  roundControl: { width: 54, height: 54, borderRadius: 27, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D6E0DA", alignItems: "center", justifyContent: "center" },
  controlText: { color: "#1F4D4A", fontSize: 31, fontWeight: "300", marginTop: -3 },
  playControl: { minWidth: 112, minHeight: 54, borderRadius: 27, backgroundColor: "#D77A61", alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  playText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  endLink: { alignItems: "center", paddingVertical: 14 },
  endLinkText: { color: "#8A5B50", fontSize: 13, fontWeight: "700" },
  finalActionArea: { marginTop: 18, gap: 10 },
  finalActionHint: { color: "#6D7B76", fontSize: 13, textAlign: "center" },
  finalActionButton: { minHeight: 64, borderRadius: 20, backgroundColor: "#D77A61", paddingHorizontal: 22, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  finalActionButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  finalActionArrow: { color: "#FFFFFF", fontSize: 22, fontWeight: "700" },
  donePage: { flexGrow: 1, padding: 28, justifyContent: "center", alignItems: "center" },
  doneSeal: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#DCE9E3", alignItems: "center", justifyContent: "center", marginBottom: 18 },
  doneSealText: { color: "#1F4D4A", fontSize: 34, fontWeight: "700" },
  doneTitle: { color: "#1B2523", fontSize: 29, lineHeight: 36, fontWeight: "700", textAlign: "center", marginTop: 7 },
  doneText: { color: "#66756F", fontSize: 15, lineHeight: 23, textAlign: "center", marginTop: 12 },
  outcomeStack: { width: "100%", gap: 10, marginVertical: 24 },
  outcomeButton: { minHeight: 50, borderRadius: 15, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DCE5DF", alignItems: "center", justifyContent: "center" },
  outcomeButtonSelected: { borderColor: "#1F4D4A", backgroundColor: "#E7F0EB" },
  outcomeText: { color: "#42534D", fontSize: 15, fontWeight: "700" },
  outcomeTextSelected: { color: "#1F4D4A" },
  cautionCard: { backgroundColor: "#F9E9E4", borderRadius: 14, padding: 14, width: "100%", marginBottom: 14 },
  cautionText: { color: "#824B3D", fontSize: 13, lineHeight: 20, textAlign: "center" },
  doneHistoryEntry: { width: "100%", borderRadius: 17, backgroundColor: "#E7F0EB", borderWidth: 1, borderColor: "#C9DED3", padding: 16, marginBottom: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  doneHistoryTitle: { color: "#1F4D4A", fontSize: 16, fontWeight: "800" },
  doneHistoryText: { color: "#587068", fontSize: 13, lineHeight: 19, marginTop: 3, maxWidth: 246 },
  doneHistoryArrow: { color: "#1F4D4A", fontSize: 30, fontWeight: "300", marginTop: -3 },
  donePrimaryAction: { width: "100%", maxWidth: 320, height: 56, alignSelf: "center" },
  historyList: { padding: 24, paddingBottom: 32, gap: 12, flexGrow: 1 },
  historyHeader: { gap: 12, marginBottom: 6 },
  historyEmptyCard: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 22, borderWidth: 1, borderColor: "#E2E8E4", marginTop: 12 },
  historyEmptyTitle: { color: "#1B2523", fontSize: 18, fontWeight: "800" },
  historyEmptyText: { color: "#64736D", fontSize: 14, lineHeight: 21, marginTop: 7 },
  historyCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 17, borderWidth: 1, borderColor: "#E0E7E2", gap: 8 },
  historyCardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  historyDate: { color: "#64736D", fontSize: 12, fontWeight: "600" },
  historyDuration: { color: "#1F4D4A", fontSize: 13, fontWeight: "800", backgroundColor: "#E7F0EB", borderRadius: 9, paddingHorizontal: 8, paddingVertical: 4 },
  historyTitle: { color: "#1B2523", fontSize: 17, fontWeight: "800" },
  historyMeta: { color: "#64736D", fontSize: 13, lineHeight: 20 },
  historyReplayButton: { minHeight: 48, borderRadius: 14, backgroundColor: "#1F4D4A", paddingHorizontal: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  historyReplayText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  historyReplayArrow: { color: "#FFFFFF", fontSize: 24, fontWeight: "400" },
  historyFooter: { marginTop: 8 },
});
