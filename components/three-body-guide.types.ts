import type { BodyRegion, BodySide, RegionTarget } from "@/lib/prototype-program";

export type ThreeBodyGuideMode = "SUMMARY" | "REGION_SELECTION" | "SIDE_SELECTION" | "GUIDANCE";

export type ThreeBodyGuideProps = {
  mode: ThreeBodyGuideMode;
  targets: RegionTarget[];
  activeTarget?: RegionTarget;
  emphasis?: boolean;
  onToggleRegion?: (region: BodyRegion) => void;
  onSelectSide?: (side: BodySide) => void;
};
