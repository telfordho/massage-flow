import { BodyMap } from "@/components/body-map";

import type { ThreeBodyGuideProps } from "./three-body-guide.types";

/** Web fallback: keeps the identical approved-region interaction when a native GL canvas is unavailable. */
export function ThreeBodyGuide(props: ThreeBodyGuideProps) {
  return <BodyMap {...props} />;
}
