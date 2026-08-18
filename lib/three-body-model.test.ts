import { describe, expect, it } from "vitest";

import { threeBodyDefaultRotation, threeBodyTargetIncludesSide, threeBodyViewForRegion } from "./three-body-model";

describe("3D body visual model", () => {
  it("uses the back view for approved back-surface regions", () => {
    expect(threeBodyViewForRegion("SHOULDER_NECK")).toBe("BACK");
    expect(threeBodyViewForRegion("UPPER_BACK")).toBe("BACK");
    expect(threeBodyViewForRegion("MID_BACK")).toBe("BACK");
    expect(threeBodyViewForRegion("LOWER_BACK")).toBe("BACK");
    expect(threeBodyViewForRegion("UPPER_HIP")).toBe("BACK");
    expect(threeBodyDefaultRotation("UPPER_BACK")).toBe(0);
  });

  it("uses the front arm view for forearm and palm", () => {
    expect(threeBodyViewForRegion("FOREARM_PALM")).toBe("FRONT");
    expect(threeBodyDefaultRotation("FOREARM_PALM")).toBe(Math.PI);
  });

  it("keeps bilateral and one-sided highlights constrained to approved sides", () => {
    expect(threeBodyTargetIncludesSide("BOTH", "LEFT")).toBe(true);
    expect(threeBodyTargetIncludesSide("BOTH", "RIGHT")).toBe(true);
    expect(threeBodyTargetIncludesSide("LEFT", "LEFT")).toBe(true);
    expect(threeBodyTargetIncludesSide("LEFT", "RIGHT")).toBe(false);
    expect(threeBodyTargetIncludesSide("RIGHT", "RIGHT")).toBe(true);
    expect(threeBodyTargetIncludesSide("RIGHT", "LEFT")).toBe(false);
  });
});
