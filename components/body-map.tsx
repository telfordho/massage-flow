import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { BACK_BODY_REGIONS, bodyMapSurfaceForRegion, targetIncludesSide, type BodyMapSurface } from "@/lib/body-map-model";
import { REGION_DETAILS, type BodyRegion, type BodySide, type RegionTarget } from "@/lib/prototype-program";

type BodyMapMode = "SUMMARY" | "REGION_SELECTION" | "SIDE_SELECTION" | "GUIDANCE";

type BodyMapProps = {
  mode: BodyMapMode;
  targets: RegionTarget[];
  activeTarget?: RegionTarget;
  emphasis?: boolean;
  onToggleRegion?: (region: BodyRegion) => void;
  onSelectSide?: (side: BodySide) => void;
};

const ACTIVE = "#1F4D4A";
const EMPHASIS = "#D77A61";
const IDLE = "#DCE9E3";
const OUTLINE = "#AAB8B1";

function selectedTargetFor(targets: RegionTarget[], region: BodyRegion) {
  return targets.find((target) => target.region === region);
}

function MapZone({
  d,
  region,
  side,
  targets,
  activeTarget,
  mode,
  emphasis,
  onToggleRegion,
  onSelectSide,
}: {
  d: string;
  region: BodyRegion;
  side: Exclude<BodySide, "BOTH">;
  targets: RegionTarget[];
  activeTarget?: RegionTarget;
  mode: BodyMapMode;
  emphasis: boolean;
  onToggleRegion?: (region: BodyRegion) => void;
  onSelectSide?: (side: BodySide) => void;
}) {
  const target = selectedTargetFor(targets, region);
  const isActiveTarget = activeTarget?.region === region;
  const selected = Boolean(target && targetIncludesSide(target.side, side));
  const interactive = mode === "REGION_SELECTION" || (mode === "SIDE_SELECTION" && isActiveTarget);
  const onPress = mode === "REGION_SELECTION"
    ? () => onToggleRegion?.(region)
    : mode === "SIDE_SELECTION" && isActiveTarget
      ? () => onSelectSide?.(side)
      : undefined;

  return (
    <Path
      d={d}
      fill={selected ? (emphasis ? EMPHASIS : ACTIVE) : IDLE}
      opacity={selected ? 0.96 : 0.48}
      onPress={onPress}
      accessible={interactive}
      accessibilityLabel={interactive ? `${REGION_DETAILS[region].label}${side === "LEFT" ? "左側" : "右側"}` : undefined}
    />
  );
}

function BackSurface({ props }: { props: BodyMapProps }) {
  const { targets, activeTarget, mode, emphasis = false, onToggleRegion, onSelectSide } = props;
  return (
    <Svg width={214} height={266} viewBox="0 0 206 250">
      <Path
        d="M82 20 C66 22 62 42 64 60 L45 76 C35 84 38 106 50 110 L63 108 L69 201 C70 220 83 232 103 232 C123 232 136 220 137 201 L143 108 L156 110 C168 106 171 84 161 76 L142 60 C144 42 140 22 124 20 C116 13 90 13 82 20 Z"
        fill="#EEEDE7"
        stroke={OUTLINE}
        strokeWidth={2}
      />
      <Circle cx={103} cy={30} r={18} fill="#EEEDE7" stroke={OUTLINE} strokeWidth={2} />
      <Path d="M103 56 L103 192" stroke="#C4CEC8" strokeWidth={2} strokeDasharray="4 5" />
      <MapZone d="M82 51 C75 54 71 61 69 69 L82 74 C85 66 90 61 97 58 Z" region="SHOULDER_NECK" side="LEFT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={emphasis} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
      <MapZone d="M124 51 C131 54 135 61 137 69 L124 74 C121 66 116 61 109 58 Z" region="SHOULDER_NECK" side="RIGHT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={emphasis} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
      <MapZone d="M67 72 C78 64 93 68 100 82 L94 108 C82 101 71 96 61 91 Z" region="UPPER_BACK" side="LEFT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={emphasis} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
      <MapZone d="M139 72 C128 64 113 68 106 82 L112 108 C124 101 135 96 145 91 Z" region="UPPER_BACK" side="RIGHT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={emphasis} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
      <MapZone d="M71 112 C82 104 92 109 98 119 L96 148 L76 143 Z" region="MID_BACK" side="LEFT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={emphasis} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
      <MapZone d="M135 112 C124 104 114 109 108 119 L110 148 L130 143 Z" region="MID_BACK" side="RIGHT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={emphasis} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
      <MapZone d="M77 151 L96 154 L96 183 L80 180 Z" region="LOWER_BACK" side="LEFT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={emphasis} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
      <MapZone d="M129 151 L110 154 L110 183 L126 180 Z" region="LOWER_BACK" side="RIGHT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={emphasis} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
      <MapZone d="M79 184 C85 180 92 181 96 188 L95 205 L80 201 Z" region="UPPER_HIP" side="LEFT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={emphasis} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
      <MapZone d="M127 184 C121 180 114 181 110 188 L111 205 L126 201 Z" region="UPPER_HIP" side="RIGHT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={emphasis} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
    </Svg>
  );
}

function ArmSurface({ props }: { props: BodyMapProps }) {
  const { targets, activeTarget, mode, emphasis = false, onToggleRegion, onSelectSide } = props;
  return (
    <Svg width={214} height={266} viewBox="0 0 206 250">
      <Path d="M55 30 C43 44 42 67 49 84 L67 143 L84 138 L73 74 C70 56 68 40 55 30 Z" fill="#EEEDE7" stroke={OUTLINE} strokeWidth={2} />
      <Path d="M151 30 C163 44 164 67 157 84 L139 143 L122 138 L133 74 C136 56 138 40 151 30 Z" fill="#EEEDE7" stroke={OUTLINE} strokeWidth={2} />
      <Path d="M67 143 C59 157 61 180 72 195 L81 216 C86 226 99 226 101 215 L98 179 L84 138 Z" fill="#EEEDE7" stroke={OUTLINE} strokeWidth={2} />
      <Path d="M139 143 C147 157 145 180 134 195 L125 216 C120 226 107 226 105 215 L108 179 L122 138 Z" fill="#EEEDE7" stroke={OUTLINE} strokeWidth={2} />
      <MapZone d="M53 41 C48 55 50 71 55 84 L71 137 L82 133 L71 72 C69 57 65 45 53 41 Z" region="FOREARM_PALM" side="LEFT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={emphasis} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
      <MapZone d="M153 41 C158 55 156 71 151 84 L135 137 L124 133 L135 72 C137 57 141 45 153 41 Z" region="FOREARM_PALM" side="RIGHT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={emphasis} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
      <MapZone d="M71 147 C66 161 69 178 77 190 L84 208 C87 214 93 214 94 208 L91 179 L82 141 Z" region="FOREARM_PALM" side="LEFT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={emphasis} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
      <MapZone d="M135 147 C140 161 137 178 129 190 L122 208 C119 214 113 214 112 208 L115 179 L124 141 Z" region="FOREARM_PALM" side="RIGHT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={emphasis} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
    </Svg>
  );
}

export function BodyMap({ mode, targets, activeTarget, emphasis = false, onToggleRegion, onSelectSide }: BodyMapProps) {
  const initialSurface: BodyMapSurface = activeTarget ? bodyMapSurfaceForRegion(activeTarget.region) : "BACK";
  const [surface, setSurface] = useState<BodyMapSurface>(initialSurface);
  const hasArmTarget = targets.some((target) => target.region === "FOREARM_PALM");
  const hasBackTarget = targets.some((target) => BACK_BODY_REGIONS.includes(target.region));
  const showSurfaceSwitch = mode !== "GUIDANCE" && (mode === "REGION_SELECTION" || (hasArmTarget && hasBackTarget));

  useEffect(() => {
    if ((mode === "SIDE_SELECTION" || mode === "GUIDANCE") && activeTarget) {
      setSurface(bodyMapSurfaceForRegion(activeTarget.region));
    }
  }, [activeTarget, mode]);

  const caption = useMemo(() => {
    if (mode === "REGION_SELECTION") return surface === "BACK" ? "點按背面已標示的概括部位" : "點按前臂與手掌表面";
    if (mode === "SIDE_SELECTION") return "點按身體圖的左側或右側，再按「雙側」可同時安排兩邊";
    if (mode === "GUIDANCE") return activeTarget ? `${REGION_DETAILS[activeTarget.region].shortLabel} · ${activeTarget.side === "LEFT" ? "左側" : activeTarget.side === "RIGHT" ? "右側" : "雙側"}` : "目前段落位置";
    return "已選概括部位與左右側摘要";
  }, [activeTarget, mode, surface]);

  const props: BodyMapProps = { mode, targets, activeTarget, emphasis, onToggleRegion, onSelectSide };
  return (
    <View style={styles.wrap} accessible accessibilityLabel={caption}>
      {showSurfaceSwitch && (
        <View style={styles.surfaceSwitch}>
          <Pressable onPress={() => setSurface("BACK")} style={({ pressed }) => [styles.surfaceButton, surface === "BACK" && styles.surfaceButtonSelected, pressed && styles.surfaceButtonPressed]}>
            <Text style={[styles.surfaceButtonText, surface === "BACK" && styles.surfaceButtonTextSelected]}>背面</Text>
          </Pressable>
          <Pressable onPress={() => setSurface("ARMS")} style={({ pressed }) => [styles.surfaceButton, surface === "ARMS" && styles.surfaceButtonSelected, pressed && styles.surfaceButtonPressed]}>
            <Text style={[styles.surfaceButtonText, surface === "ARMS" && styles.surfaceButtonTextSelected]}>前臂手掌</Text>
          </Pressable>
        </View>
      )}
      <View style={styles.mapFrame}>{surface === "BACK" ? <BackSurface props={props} /> : <ArmSurface props={props} />}</View>
      <View style={styles.captionRow}><View style={[styles.captionDot, emphasis && styles.captionDotEmphasis]} /><Text style={styles.caption}>{caption}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 8 },
  surfaceSwitch: { flexDirection: "row", gap: 8, alignSelf: "stretch", justifyContent: "center" },
  surfaceButton: { minHeight: 38, paddingHorizontal: 14, borderRadius: 19, justifyContent: "center", backgroundColor: "#EFF3F0", borderWidth: 1, borderColor: "#D8E2DC" },
  surfaceButtonSelected: { backgroundColor: "#1F4D4A", borderColor: "#1F4D4A" },
  surfaceButtonPressed: { opacity: 0.76 },
  surfaceButtonText: { color: "#486058", fontSize: 13, fontWeight: "700" },
  surfaceButtonTextSelected: { color: "#FFFFFF" },
  mapFrame: { width: "100%", minHeight: 266, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAF8", borderRadius: 20, borderWidth: 1, borderColor: "#E0E7E2" },
  captionRow: { flexDirection: "row", alignItems: "center", gap: 7, justifyContent: "center", paddingHorizontal: 12 },
  captionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: ACTIVE },
  captionDotEmphasis: { backgroundColor: EMPHASIS },
  caption: { color: "#536760", fontSize: 12, lineHeight: 18, textAlign: "center" },
});
