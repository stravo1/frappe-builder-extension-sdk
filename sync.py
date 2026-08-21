"""Refresh this mirror from a Builder checkout.

`frontend/extension-sdk` in frappe/builder owns the SDK source. This repo is a
copy, so that an extension author can install the SDK before it is on npm. Never
edit the SDK files here: change them in Builder, then run this.

    python3 sync.py /path/to/apps/builder

Everything else in this repo — the install script, this script, the README, the
license — is not copied, and is safe to edit here.
"""

import filecmp
import pathlib
import shutil
import sys

# What Builder owns. Each name is copied over whatever is here.
COPIED = ("src", "tests", "vite.js", "package.json", "tsconfig.build.json", "vite.config.mts")

# Mirror-owned, because it documents a git install that Builder's own copy does not.
UPSTREAM_README = "frontend/extension-sdk/README.md"

HERE = pathlib.Path(__file__).parent


def source_directory(checkout: str) -> pathlib.Path:
	directory = pathlib.Path(checkout).resolve() / "frontend/extension-sdk"
	if not (directory / "package.json").is_file():
		raise SystemExit(f"no SDK at {directory}. Point this at an apps/builder checkout")
	return directory


def is_changed(source: pathlib.Path, target: pathlib.Path) -> bool:
	if not target.exists():
		return True
	if source.is_dir():
		comparison = filecmp.dircmp(source, target)
		return bool(comparison.left_only or comparison.right_only or comparison.diff_files)
	return not filecmp.cmp(source, target, shallow=False)


def copy(source: pathlib.Path, target: pathlib.Path):
	if source.is_dir():
		shutil.rmtree(target, ignore_errors=True)
		shutil.copytree(source, target)
	else:
		shutil.copy2(source, target)


def main(checkout: str):
	source = source_directory(checkout)
	changed = [name for name in COPIED if is_changed(source / name, HERE / name)]
	for name in changed:
		copy(source / name, HERE / name)

	print(f"synced from {source}")
	print(f"  {', '.join(changed)}" if changed else "  already up to date")
	print(f"\nREADME.md is not copied. Read {UPSTREAM_README} for changes worth carrying across.")
	if changed:
		print("Build and commit:\n  yarn build && git add -A && git commit")


if __name__ == "__main__":
	if len(sys.argv) != 2:
		sys.exit("usage: sync.py <path to apps/builder>")
	main(sys.argv[1])
