from pathlib import Path

from PIL import Image


SOURCE = Path("/home/ubuntu/webdev-static-assets/massage-flow-icon.png")
TARGETS = [
    Path("/home/ubuntu/massage-flow-restored/assets/images/icon.png"),
    Path("/home/ubuntu/massage-flow-restored/assets/images/splash-icon.png"),
    Path("/home/ubuntu/massage-flow-restored/assets/images/favicon.png"),
    Path("/home/ubuntu/massage-flow-restored/assets/images/android-icon-foreground.png"),
]
MAX_BYTES = 1_000_000


def main() -> None:
    with Image.open(SOURCE) as source_image:
        image = source_image.convert("RGB")
        image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        optimized = image.quantize(colors=256, method=Image.Quantize.MEDIANCUT)

    for target in TARGETS:
        optimized.save(target, format="PNG", optimize=True)
        if target.stat().st_size >= MAX_BYTES:
            raise RuntimeError(f"{target} remains too large: {target.stat().st_size} bytes")


if __name__ == "__main__":
    main()
