# Massage Flow — 3D Rendering Decision v1.13

## Decision

The first rotatable and zoomable body visual will use **Three.js + React Three Fiber v9 + Expo GL**. The project already uses React 19; React Three Fiber’s official installation guide pairs v9 with React 19 and documents the native renderer at `@react-three/fiber/native`. The renderer uses `expo-gl` and `expo-asset` for its native WebGL bindings. [1]

The first visual is a **stylised 3D body mannequin built from procedural meshes**, not a licensed anatomical or medical model. This provides a real perspective camera, rotation and zoom without introducing an unreviewed anatomical asset or altering the approved region/safety rules.

| Requirement | First implementation decision |
|---|---|
| 3D rendering | React Three Fiber native canvas backed by Expo GL. |
| Rotation and zoom | Portrait-safe drag / pinch-style control state, plus visible rotate and zoom controls. |
| Region display | The scene receives the existing approved `region + side` values only. |
| Safety | Only approved broad-surface overlays exist. Excluded boundaries have no interactive 3D target. |
| Compatibility | Retain the current vector body-map component as a safe fallback if 3D initialization is unavailable. |
| Future GLB assets | Extend Metro asset extensions only when an approved, licensed `.glb` asset is introduced. [1] |

## Validation requirement

Expo GL creates an OpenGL ES context when `GLView` mounts, and its drawing buffer is presented within the view. [2] React Three Fiber’s documentation warns that iOS simulator OpenGL ES support can be unreliable; stable WebGL validation therefore requires a physical iOS device in addition to normal regression coverage. [1]

## References

[1]: https://r3f.docs.pmnd.rs/getting-started/installation "React Three Fiber — Installation"

[2]: https://docs.expo.dev/versions/latest/sdk/gl-view/ "Expo — GLView"
