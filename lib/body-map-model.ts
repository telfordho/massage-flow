import type { BodyRegion, BodySide } from "@/lib/prototype-program";

export type BodyMapSurface = "BACK" | "ARMS";

export const BACK_BODY_REGIONS: BodyRegion[] = ["SHOULDER_NECK", "UPPER_BACK", "MID_BACK", "LOWER_BACK", "UPPER_HIP"];

export function bodyMapSurfaceForRegion(region: BodyRegion): BodyMapSurface {
  return region === "FOREARM_PALM" ? "ARMS" : "BACK";
}

export function targetIncludesSide(targetSide: BodySide, requestedSide: Exclude<BodySide, "BOTH">) {
  return targetSide === "BOTH" || targetSide === requestedSide;
}
