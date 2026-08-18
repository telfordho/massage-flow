import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { targetIncludesSide } from "@/lib/body-map-model";
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

const ACTIVE = "#1F6B5D";
const EMPHASIS = "#D77A61";
const OUTLINE = "#99AAA3";
const BODY_FILL = "#FCFCF8";

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
      fill={selected ? (emphasis ? EMPHASIS : ACTIVE) : "transparent"}
      fillOpacity={selected ? 0.8 : 0}
      stroke={selected ? ACTIVE : "transparent"}
      strokeWidth={selected ? 1.1 : 0}
      onPress={onPress}
      accessible={interactive}
      accessibilityLabel={interactive ? `${REGION_DETAILS[region].label}${side === "LEFT" ? "左側" : "右側"}` : undefined}
    />
  );
}

function DetailedBackBody({ props }: { props: BodyMapProps }) {
  const { targets, activeTarget, mode, emphasis = false, onToggleRegion, onSelectSide } = props;
  const zoneProps = { targets, activeTarget, mode, emphasis, onToggleRegion, onSelectSide };

  return (
    <Svg width={286} height={496} viewBox="0 0 280 480">
      <Circle cx={140} cy={42} r={27} fill={BODY_FILL} stroke={OUTLINE} strokeWidth={1.4} />
      <Path d="M114 66 C113 77 108 84 96 89 C82 95 72 105 67 120 L56 180 C53 196 59 207 70 211 L82 205 L88 157 L92 235 C93 260 98 283 102 303 L104 343 L113 457 C114 469 126 472 133 461 L140 366 L147 461 C154 472 166 469 167 457 L176 343 L178 303 C182 283 187 260 188 235 L192 157 L198 205 L210 211 C221 207 227 196 224 180 L213 120 C208 105 198 95 184 89 C172 84 167 77 166 66 Z" fill={BODY_FILL} stroke={OUTLINE} strokeWidth={1.4} strokeLinejoin="round" />
      <Path d="M96 89 C85 96 81 111 83 126 L94 148 L92 235" fill="none" stroke="#D2DDD7" strokeWidth={1} />
      <Path d="M184 89 C195 96 199 111 197 126 L186 148 L188 235" fill="none" stroke="#D2DDD7" strokeWidth={1} />
      <Path d="M140 69 L140 345" stroke="#B8C7C0" strokeWidth={1.4} strokeDasharray="5 6" />
      <Path d="M111 304 C120 295 132 294 140 304 C148 294 160 295 169 304" fill="none" stroke="#D2DDD7" strokeWidth={1} />
      <Path d="M104 343 C114 335 127 335 140 347 C153 335 166 335 176 343" fill="none" stroke="#D2DDD7" strokeWidth={1} />

      <MapZone d="M115 70 C105 76 100 83 98 99 C88 98 78 104 74 115 C83 120 92 121 101 116 C111 111 119 102 122 88 L122 73 Z" region="SHOULDER_NECK" side="LEFT" {...zoneProps} />
      <MapZone d="M165 70 C175 76 180 83 182 99 C192 98 202 104 206 115 C197 120 188 121 179 116 C169 111 161 102 158 88 L158 73 Z" region="SHOULDER_NECK" side="RIGHT" {...zoneProps} />
      <MapZone d="M98 110 C112 104 126 109 138 124 L138 181 C122 178 109 169 99 154 C91 140 89 123 98 110 Z" region="UPPER_BACK" side="LEFT" {...zoneProps} />
      <MapZone d="M182 110 C168 104 154 109 142 124 L142 181 C158 178 171 169 181 154 C189 140 191 123 182 110 Z" region="UPPER_BACK" side="RIGHT" {...zoneProps} />
      <MapZone d="M102 178 C114 174 127 179 138 192 L138 243 C126 242 114 236 106 225 C100 214 98 191 102 178 Z" region="MID_BACK" side="LEFT" {...zoneProps} />
      <MapZone d="M178 178 C166 174 153 179 142 192 L142 243 C154 242 166 236 174 225 C180 214 182 191 178 178 Z" region="MID_BACK" side="RIGHT" {...zoneProps} />
      <MapZone d="M106 240 C117 237 128 242 138 253 L138 294 C128 295 118 291 111 283 C106 272 104 251 106 240 Z" region="LOWER_BACK" side="LEFT" {...zoneProps} />
      <MapZone d="M174 240 C163 237 152 242 142 253 L142 294 C152 295 162 291 169 283 C174 272 176 251 174 240 Z" region="LOWER_BACK" side="RIGHT" {...zoneProps} />
      <MapZone d="M110 290 C120 286 132 290 138 303 L138 332 C128 336 117 333 109 325 C106 315 106 300 110 290 Z" region="UPPER_HIP" side="LEFT" {...zoneProps} />
      <MapZone d="M170 290 C160 286 148 290 142 303 L142 332 C152 336 163 333 171 325 C174 315 174 300 170 290 Z" region="UPPER_HIP" side="RIGHT" {...zoneProps} />
      <MapZone d="M76 149 L58 181 C55 194 60 204 70 207 L81 201 L87 159 Z M81 201 L72 220 L66 240 C64 250 71 258 79 253 L89 233 L93 207 Z" region="FOREARM_PALM" side="LEFT" {...zoneProps} />
      <MapZone d="M204 149 L222 181 C225 194 220 204 210 207 L199 201 L193 159 Z M199 201 L208 220 L214 240 C216 250 209 258 201 253 L191 233 L187 207 Z" region="FOREARM_PALM" side="RIGHT" {...zoneProps} />
    </Svg>
  );
}

export function BodyMap({ mode, targets, activeTarget, emphasis = false, onToggleRegion, onSelectSide }: BodyMapProps) {
  const caption = useMemo(() => {
    if (mode === "REGION_SELECTION") return "點按人體背面的概括部位；前臂與手掌可直接點按手臂位置";
    if (mode === "SIDE_SELECTION") return "點按人體圖的左側或右側；再按「雙側」可同時安排兩邊";
    if (mode === "GUIDANCE") return activeTarget ? `${REGION_DETAILS[activeTarget.region].shortLabel} · ${activeTarget.side === "LEFT" ? "左側" : activeTarget.side === "RIGHT" ? "右側" : "雙側"}` : "目前段落位置";
    return "已選概括部位與左右側摘要";
  }, [activeTarget, mode]);

  const props: BodyMapProps = { mode, targets, activeTarget, emphasis, onToggleRegion, onSelectSide };
  return (
    <View style={styles.wrap} accessible accessibilityLabel={caption}>
      <View style={styles.mapFrame}><DetailedBackBody props={props} /></View>
      <View style={styles.captionRow}><View style={[styles.captionDot, emphasis && styles.captionDotEmphasis]} /><Text style={styles.caption}>{caption}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 11 },
  mapFrame: { width: "100%", minHeight: 514, alignItems: "center", justifyContent: "center", backgroundColor: "#FCFCF8", borderRadius: 28, borderWidth: 1, borderColor: "#DFE7E1", paddingVertical: 8 },
  captionRow: { flexDirection: "row", alignItems: "center", gap: 7, justifyContent: "center", paddingHorizontal: 12 },
  captionDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: ACTIVE },
  captionDotEmphasis: { backgroundColor: EMPHASIS },
  caption: { color: "#536760", fontSize: 12, lineHeight: 18, textAlign: "center" },
});
