# Massage Flow — Web 3D Preview Fix v1.14

## Issue

The first 3D foundation intentionally rendered the vector `BodyMap` on the web platform. The mobile preview runs through that web path, so it correctly displayed the fallback but did not show the requested 3D mannequin.

## Fix

The web platform now uses the standard React Three Fiber web `Canvas` with the same stylised Three.js mannequin, approved region overlays, laterality, rotation, zoom controls, and viewpoint reset as the native path. The vector `BodyMap` now appears only when WebGL is unavailable.

The shared `region + side` safety contract remains unchanged. This is a presentation-path correction; it does not introduce a new selectable region, change a massage action, or relax any boundary.

## Verification

Type checking, 31 unit tests, lint, and the Expo web bundle pass. The user should reload the mobile preview and proceed to the region-selection screen to view the 3D mannequin.
