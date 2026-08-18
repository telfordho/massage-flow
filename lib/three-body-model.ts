import type { BodyRegion, BodySide } from "@/lib/prototype-program";

export type ThreeBodyView = "BACK" | "FRONT";

export const THREE_BODY_BACK_REGIONS: BodyRegion[] = ["SHOULDER_NECK", "UPPER_BACK", "MID_BACK", "LOWER_BACK", "UPPER_HIP"];

export function threeBodyViewForRegion(region: BodyRegion): ThreeBodyView {
  return region === "FOREARM_PALM" ? "FRONT" : "BACK";
}

export function threeBodyDefaultRotation(region: BodyRegion) {
  return threeBodyViewForRegion(region) === "BACK" ? 0 : Math.PI;
}

export function threeBodyTargetIncludesSide(targetSide: BodySide, requestedSide: Exclude<BodySide, "BOTH">) {
  return targetSide === "BOTH" || targetSide === requestedSide;
}
