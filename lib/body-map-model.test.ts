import { describe, expect, it } from "vitest";

import { BACK_BODY_REGIONS, bodyMapSurfaceForRegion, targetIncludesSide } from "./body-map-model";

describe("interactive body-map model", () => {
  it("maps every approved back-surface region to the back visual", () => {
    expect(BACK_BODY_REGIONS).toEqual(["SHOULDER_NECK", "UPPER_BACK", "MID_BACK", "LOWER_BACK", "UPPER_HIP"]);
    expect(BACK_BODY_REGIONS.map(bodyMapSurfaceForRegion)).toEqual(["BACK", "BACK", "BACK", "BACK", "BACK"]);
  });

  it("maps forearm and palm to its dedicated arm-and-palm visual", () => {
    expect(bodyMapSurfaceForRegion("FOREARM_PALM")).toBe("ARMS");
  });

  it("keeps bilateral selection visible on both approved sides", () => {
    expect(targetIncludesSide("BOTH", "LEFT")).toBe(true);
    expect(targetIncludesSide("BOTH", "RIGHT")).toBe(true);
  });

  it("keeps one-sided selections limited to their chosen side", () => {
    expect(targetIncludesSide("LEFT", "LEFT")).toBe(true);
    expect(targetIncludesSide("LEFT", "RIGHT")).toBe(false);
    expect(targetIncludesSide("RIGHT", "RIGHT")).toBe(true);
    expect(targetIncludesSide("RIGHT", "LEFT")).toBe(false);
  });
});
