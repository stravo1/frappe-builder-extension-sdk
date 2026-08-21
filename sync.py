"""Refresh this mirror from a Builder checkout.

frappe/builder owns the SDK source and the API reference. This repository is a copy,
so that an extension author can install the SDK before it is on npm. Never edit a
copied file here. Change it in Builder, then run this.

    python3 sync.py /path/to/apps/builder

Everything the table below does not name — the install script, this script, the
README, the skill itself, the license — belongs to this repository. Edit those here.
"""

import filecmp
import pathlib
import shutil
import sys

# What Builder owns: its path in the checkout, and where it lands here.
COPIED = {
	"frontend/extension-sdk/src": "src",
	"frontend/extension-sdk/tests": "tests",
	"frontend/extension-sdk/vite.js": "vite.js",
	"frontend/extension-sdk/package.json": "package.json",
	"frontend/extension-sdk/tsconfig.build.json": "tsconfig.build.json",
	"frontend/extension-sdk/vite.config.mts": "vite.config.mts",
	"docs/extensions/agent/README.md": "skills/build-builder-extension/references/extension-api.md",
}

# Not copied, because it documents a git install that Builder's own copy does not.
UPSTREAM_README = "frontend/extension-sdk/README.md"

HERE = pathlib.Path(__file__).parent


def checkout_directory(path: str) -> pathlib.Path:
	directory = pathlib.Path(path).resolve()
	if not (directory / "frontend/extension-sdk/package.json").is_file():
		raise SystemExit(f"no SDK at {directory}. Point this at an apps/builder checkout")
	return directory


def is_changed(source: pathlib.Path, target: pathlib.Path) -> bool:
	if not source.exists():
		raise SystemExit(f"{source} is missing. This mirror expects it")
	if not target.exists():
		return True
	if source.is_dir():
		comparison = filecmp.dircmp(source, target)
		return bool(comparison.left_only or comparison.right_only or comparison.diff_files)
	return not filecmp.cmp(source, target, shallow=False)


def copy(source: pathlib.Path, target: pathlib.Path):
	target.parent.mkdir(parents=True, exist_ok=True)
	if source.is_dir():
		shutil.rmtree(target, ignore_errors=True)
		shutil.copytree(source, target)
	else:
		shutil.copy2(source, target)


def main(path: str):
	checkout = checkout_directory(path)
	changed = [name for name in COPIED if is_changed(checkout / name, HERE / COPIED[name])]
	for name in changed:
		copy(checkout / name, HERE / COPIED[name])

	print(f"synced from {checkout}")
	for name in changed:
		print(f"  {name} -> {COPIED[name]}")
	if not changed:
		print("  already up to date")

	print(f"\nREADME.md is not copied. Read {UPSTREAM_README} for changes worth carrying across.")
	if changed:
		print("Build and commit:\n  yarn build && git add -A && git commit")


if __name__ == "__main__":
	if len(sys.argv) != 2:
		sys.exit("usage: sync.py <path to apps/builder>")
	main(sys.argv[1])
