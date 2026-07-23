"""Run a single pix2tex prediction for a formula image."""

from pathlib import Path
import sys

from PIL import Image
from pix2tex.cli import LatexOCR


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python scripts/run_latex_ocr.py <formula-image>", file=sys.stderr)
        return 2

    image_path = Path(sys.argv[1])
    if not image_path.is_file():
        print(f"Formula image not found: {image_path}", file=sys.stderr)
        return 2

    model = LatexOCR()
    with Image.open(image_path) as image:
        print(model(image))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
