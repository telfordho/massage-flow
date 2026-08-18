/* eslint-disable react/no-unknown-property */
import { Canvas } from "@react-three/fiber/native";
import { useEffect, useMemo, useRef, useState } from "react";
import { PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import * as THREE from "three";

import { REGION_DETAILS, type BodyRegion, type BodySide, type RegionTarget } from "@/lib/prototype-program";
import { threeBodyDefaultRotation, threeBodyTargetIncludesSide } from "@/lib/three-body-model";

import type { ThreeBodyGuideProps } from "./three-body-guide.types";

const ACTIVE = "#1F4D4A";
const EMPHASIS = "#D77A61";
const BODY = "#EEEDE7";
type Side = Exclude<BodySide, "BOTH">;

function targetForRegion(targets: RegionTarget[], region: BodyRegion) {
  return targets.find((target) => target.region === region);
}

function SurfacePatch({
  region, side, targets, activeTarget, mode, emphasis, onToggleRegion, onSelectSide,
}: {
  region: BodyRegion; side: Side; targets: RegionTarget[]; activeTarget?: RegionTarget;
  mode: ThreeBodyGuideProps["mode"]; emphasis: boolean; onToggleRegion?: (region: BodyRegion) => void;
  onSelectSide?: (side: BodySide) => void;
}) {
  const selectedTarget = targetForRegion(targets, region);
  const selected = Boolean(selectedTarget && threeBodyTargetIncludesSide(selectedTarget.side, side));
  const isCurrent = activeTarget?.region === region && threeBodyTargetIncludesSide(activeTarget.side, side);
  const color = selected ? (emphasis && isCurrent ? EMPHASIS : ACTIVE) : "#B8CDC2";
  const click = mode === "REGION_SELECTION"
    ? () => onToggleRegion?.(region)
    : mode === "SIDE_SELECTION" && activeTarget?.region === region
      ? () => onSelectSide?.(side)
      : undefined;
  const opacity = selected ? 0.9 : 0;

  if (region === "FOREARM_PALM") {
    return (
      <>
        <mesh renderOrder={2} position={[side === "LEFT" ? -0.9 : 0.9, 0.15, -0.02]} rotation={[0, 0, side === "LEFT" ? -0.2 : 0.2]} scale={[1.05, 1.05, 1.05]} onClick={click}>
          <capsuleGeometry args={[0.145, 0.47, 10, 18]} />
          <meshStandardMaterial color={color} depthWrite={false} transparent opacity={opacity} roughness={0.58} />
        </mesh>
        <mesh renderOrder={2} position={[side === "LEFT" ? -0.9 : 0.9, 0.67, -0.02]} rotation={[0, 0, side === "LEFT" ? -0.2 : 0.2]} scale={[1.05, 1.05, 1.05]} onClick={click}>
          <capsuleGeometry args={[0.145, 0.35, 10, 18]} />
          <meshStandardMaterial color={color} depthWrite={false} transparent opacity={opacity} roughness={0.58} />
        </mesh>
        <mesh renderOrder={2} position={[side === "LEFT" ? -1.06 : 1.06, -0.37, -0.02]} onClick={click}>
          <sphereGeometry args={[0.24, 20, 20]} />
          <meshStandardMaterial color={color} depthWrite={false} transparent opacity={opacity} roughness={0.58} />
        </mesh>
      </>
    );
  }

  const phi = region === "SHOULDER_NECK" ? [0.49, 0.22]
    : region === "UPPER_BACK" ? [0.72, 0.37]
      : region === "MID_BACK" ? [1.1, 0.38]
        : region === "LOWER_BACK" ? [1.49, 0.31]
          : [1.82, 0.26];
  const thetaStart = side === "LEFT" ? 0.58 : 1.94;
  return (
    <>
      <mesh renderOrder={2} position={[0, 0.2, 0]} scale={[0.748, 1.358, 0.426]} onClick={click}>
        <sphereGeometry args={[1, 32, 24, thetaStart, 1.18, phi[0], phi[1]]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} depthWrite={false} transparent opacity={opacity} roughness={0.58} />
      </mesh>
      {region === "SHOULDER_NECK" ? (
        <mesh renderOrder={2} position={[side === "LEFT" ? -0.65 : 0.65, 1.2, -0.02]} rotation={[0, 0, side === "LEFT" ? -0.8 : 0.8]} onClick={click}>
          <capsuleGeometry args={[0.17, 0.3, 10, 18]} />
          <meshStandardMaterial color={color} depthWrite={false} transparent opacity={opacity} roughness={0.58} />
        </mesh>
      ) : null}
    </>
  );
}

function Mannequin({
  targets, activeTarget, mode, emphasis, rotation, zoom, onToggleRegion, onSelectSide,
}: ThreeBodyGuideProps & { rotation: number; zoom: number }) {
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: BODY, roughness: 0.8 }), []);
  return (
    <group rotation={[0, rotation, 0]} scale={[zoom, zoom, zoom]}>
      <mesh position={[0, 0.2, 0]} scale={[0.74, 1.35, 0.42]} material={material}><sphereGeometry args={[1, 32, 24]} /></mesh>
      <mesh position={[0, 1.78, 0]} scale={[0.38, 0.47, 0.36]} material={material}><sphereGeometry args={[1, 28, 20]} /></mesh>
      <mesh position={[-0.65, 1.2, -0.02]} rotation={[0, 0, -0.8]} material={material}><capsuleGeometry args={[0.17, 0.3, 10, 18]} /></mesh>
      <mesh position={[0.65, 1.2, -0.02]} rotation={[0, 0, 0.8]} material={material}><capsuleGeometry args={[0.17, 0.3, 10, 18]} /></mesh>
      <mesh position={[-0.9, 0.56, -0.02]} rotation={[0, 0, -0.2]} material={material}><capsuleGeometry args={[0.14, 1.25, 10, 18]} /></mesh>
      <mesh position={[0.9, 0.56, -0.02]} rotation={[0, 0, 0.2]} material={material}><capsuleGeometry args={[0.14, 1.25, 10, 18]} /></mesh>
      <mesh position={[-1.06, -0.37, -0.02]} material={material}><sphereGeometry args={[0.24, 20, 20]} /></mesh>
      <mesh position={[1.06, -0.37, -0.02]} material={material}><sphereGeometry args={[0.24, 20, 20]} /></mesh>
      <mesh position={[-0.31, -1.45, 0]} material={material}><capsuleGeometry args={[0.23, 1.65, 12, 20]} /></mesh>
      <mesh position={[0.31, -1.45, 0]} material={material}><capsuleGeometry args={[0.23, 1.65, 12, 20]} /></mesh>
      <SurfacePatch region="SHOULDER_NECK" side="LEFT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={Boolean(emphasis)} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
      <SurfacePatch region="SHOULDER_NECK" side="RIGHT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={Boolean(emphasis)} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
      <SurfacePatch region="UPPER_BACK" side="LEFT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={Boolean(emphasis)} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
      <SurfacePatch region="UPPER_BACK" side="RIGHT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={Boolean(emphasis)} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
      <SurfacePatch region="MID_BACK" side="LEFT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={Boolean(emphasis)} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
      <SurfacePatch region="MID_BACK" side="RIGHT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={Boolean(emphasis)} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
      <SurfacePatch region="LOWER_BACK" side="LEFT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={Boolean(emphasis)} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
      <SurfacePatch region="LOWER_BACK" side="RIGHT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={Boolean(emphasis)} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
      <SurfacePatch region="UPPER_HIP" side="LEFT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={Boolean(emphasis)} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
      <SurfacePatch region="UPPER_HIP" side="RIGHT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={Boolean(emphasis)} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
      <SurfacePatch region="FOREARM_PALM" side="LEFT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={Boolean(emphasis)} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
      <SurfacePatch region="FOREARM_PALM" side="RIGHT" targets={targets} activeTarget={activeTarget} mode={mode} emphasis={Boolean(emphasis)} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} />
    </group>
  );
}

export function ThreeBodyGuide({ mode, targets, activeTarget, emphasis = false, onToggleRegion, onSelectSide }: ThreeBodyGuideProps) {
  const regionForView = activeTarget?.region ?? targets[0]?.region ?? "UPPER_BACK";
  const [rotation, setRotation] = useState(() => threeBodyDefaultRotation(regionForView));
  const [zoom, setZoom] = useState(1);
  const rotationStart = useRef(rotation);
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 3,
    onPanResponderGrant: () => { rotationStart.current = rotation; },
    onPanResponderMove: (_, gesture) => setRotation(rotationStart.current + gesture.dx / 125),
  }), [rotation]);

  useEffect(() => {
    if (mode === "SIDE_SELECTION" || mode === "GUIDANCE") setRotation(threeBodyDefaultRotation(regionForView));
  }, [mode, regionForView]);

  const caption = mode === "GUIDANCE"
    ? `${REGION_DETAILS[regionForView].shortLabel} · ${activeTarget?.side === "LEFT" ? "左側" : activeTarget?.side === "RIGHT" ? "右側" : "雙側"}`
    : "直接點按模型表面的選區；橫向拖動可旋轉 3D 人體。";

  return (
    <View style={styles.wrap} accessible accessibilityLabel={caption}>
      <View style={styles.canvasFrame} {...panResponder.panHandlers}>
        <Canvas style={styles.canvas} camera={{ position: [0, 0, 6], fov: 35 }}>
          <color attach="background" args={["#F8FAF8"]} />
          <ambientLight intensity={1.1} />
          <directionalLight position={[3, 4, 4]} intensity={1.4} />
          <directionalLight position={[-3, 1, 2]} intensity={0.45} />
          <Mannequin mode={mode} targets={targets} activeTarget={activeTarget} emphasis={emphasis} onToggleRegion={onToggleRegion} onSelectSide={onSelectSide} rotation={rotation} zoom={zoom} />
        </Canvas>
      </View>
      <View style={styles.controls}>
        <Pressable accessibilityRole="button" accessibilityLabel="縮小 3D 人體" onPress={() => setZoom((value) => Math.max(0.78, value - 0.1))} style={({ pressed }) => [styles.controlButton, pressed && styles.controlPressed]}><Text style={styles.controlText}>縮小</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="重設 3D 人體視角" onPress={() => { setRotation(threeBodyDefaultRotation(regionForView)); setZoom(1); }} style={({ pressed }) => [styles.resetButton, pressed && styles.controlPressed]}><Text style={styles.resetText}>重設視角</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="放大 3D 人體" onPress={() => setZoom((value) => Math.min(1.28, value + 0.1))} style={({ pressed }) => [styles.controlButton, pressed && styles.controlPressed]}><Text style={styles.controlText}>放大</Text></Pressable>
      </View>
      <View style={styles.captionRow}><View style={[styles.captionDot, emphasis && styles.captionDotEmphasis]} /><Text style={styles.caption}>{caption}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 8 },
  canvasFrame: { width: "100%", height: 300, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "#E0E7E2", backgroundColor: "#F8FAF8" },
  canvas: { flex: 1 },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  controlButton: { minHeight: 38, paddingHorizontal: 13, justifyContent: "center", borderRadius: 19, backgroundColor: "#EFF3F0", borderWidth: 1, borderColor: "#D8E2DC" },
  resetButton: { minHeight: 38, paddingHorizontal: 14, justifyContent: "center", borderRadius: 19, backgroundColor: "#1F4D4A" },
  controlPressed: { opacity: 0.72 },
  controlText: { color: "#486058", fontSize: 13, fontWeight: "700" },
  resetText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  captionRow: { flexDirection: "row", alignItems: "center", gap: 7, justifyContent: "center", paddingHorizontal: 12 },
  captionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: ACTIVE },
  captionDotEmphasis: { backgroundColor: EMPHASIS },
  caption: { color: "#536760", fontSize: 12, lineHeight: 18, textAlign: "center" },
});
