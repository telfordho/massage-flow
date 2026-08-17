# Massage Flow — Duration Editing Correction v1.7

## Issue corrected

The controlled Preview editor previously redistributed time across several main segments when one segment changed. The overall duration stayed correct, but the resulting shifts were hard to predict.

## Fixed-order rule

The tapped main segment is the only segment that changes directly. Its requested adjustment is compensated in display order by the next eligible main segment. If that segment reaches the permitted 30–180 second range, the remaining adjustment proceeds to the following segment in the same order. Warm-up, cool-down, total duration, and approved-action boundaries remain unchanged.

## Verification

Regression tests confirm fixed next-segment compensation and repeated adjustment behaviour under the 180-second limit.
