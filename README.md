# frappe-builder-extension-sdk

The package a Builder extension author installs. It gives you the types, the Vue
helpers, and the Vite plugin that builds an extension.

This repository is a copy of `frontend/extension-sdk` in
[frappe/builder](https://github.com/frappe/builder). The SDK is not on npm yet, so this
copy exists to let you install it today. Builder owns the source. Read
[Mirror, not fork](#mirror-not-fork) before you change a file here.

## Install

```sh
npm install --save-dev github:stravo1/frappe-builder-extension-sdk
```

The package builds itself on install, so you need no extra step.

## Two halves

The SDK has a runtime half and an author half.

Builder serves the runtime half at `/builder_extension_asset/sdk/extension-sdk.js`.
Every extension frame loads that one module through an import map. Your build
never bundles it.

This package is the author half. It holds the Vite plugin, the Vue helpers, and
the types your editor reads.

## Build an extension

Point Vite at the plugin. Give it the origin that serves Builder.

```js
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import builderExtension from "frappe-builder-extension-sdk/vite";

export default defineConfig({
	plugins: [vue(), builderExtension({ builderUrl: "http://builder.localhost:8000" })],
});
```

The plugin needs a `manifest.json` beside the config, and an entry at
`src/main.js` or `src/main.ts`.

## Write against the editor

```js
import builder from "frappe-builder-extension-sdk";

builder.actions.register("say-hello", () => builder.ui.toast("hello"));
```

A Vue slot uses the `/vue` entry.

```js
import { defineSlot, useBuilderContext } from "frappe-builder-extension-sdk/vue";
```

`vue` is an optional peer dependency. Install it only if you write slots in Vue.

## Run your extension

1. Run `yarn dev` in your extension directory.
2. Open Builder at the origin you gave to `builderUrl`.
3. Choose **load development extension**, and paste the URL the terminal printed.

The editor reads `/__builder-extension` from your dev server, and adds the extension
for this session. A reload of the editor drops it.

## Install on a site

Builder has no install API yet. Until it arrives, `install_extension.py` writes the
files and inserts the record.

1. Run `yarn build` in your extension directory.
2. Change to the `sites` directory of your bench.
3. Run the script with the site name and the extension directory.

```sh
cd sites
../env/bin/python /path/to/install_extension.py builder.localhost /path/to/my-extension
```

Run it again after every build. The script hashes the files, and a new hash makes the
editor read the new entry.

To remove the extension:

```sh
../env/bin/python /path/to/install_extension.py builder.localhost /path/to/my-extension --uninstall
```

Frappe refuses to delete an extension that a `Builder Token` still names. The script
lists those tokens and asks before it deletes them. Published pages can use a token an
extension wrote, so read the list first.

The script installs `dist/` after a build. If the directory has no `dist/`, it installs
`src/`, which works for an extension of plain JavaScript.

## Agent skill

`skills/build-builder-extension/` is a skill for Claude Code and other agents. It carries the
workflow, and the whole API as a reference file. Copy it into your skills directory:

```sh
cp -R skills/build-builder-extension ~/.claude/skills/
```

Then ask the agent for a Builder extension. The agent reads
`references/extension-api.md` for the capabilities, the surfaces, and the error codes.

The skill ships inside the package, so an install puts it in `node_modules` too. Builder owns
it, and `sync.py` copies it here.

## Versions

The major version of this package is the protocol version it speaks. Version
`1.x` works with any Builder that serves protocol 1. A Builder on a later
protocol needs the matching major version.

## Mirror, not fork

`frontend/extension-sdk` in frappe/builder owns every SDK file here. Do not change one
in this repository. Change it in Builder, then copy it across:

```sh
python3 sync.py /path/to/apps/builder
```

`sync.py` copies `src`, `tests`, `skills`, `install_extension.py`, `vite.js`, `package.json`,
`tsconfig.build.json`, and `vite.config.mts`. It copies nothing else. This README and the
license belong to this repository. Edit those here.

When the SDK reaches npm, this repository stops. Point your `package.json` at the npm
version. The copy then goes stale with no effect on you.

## Tests

The SDK tests run in a Builder checkout, where the Vitest config lives:

```sh
cd apps/builder/frontend && yarn test
```

## License

MIT. Copyright (c) Frappe Technologies Pvt. Ltd. and contributors.
