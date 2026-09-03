# frappe-builder-extension-sdk

The package a Builder extension author installs. It gives you the types, the Vue
helpers, and the Vite plugin that builds an extension.

This repository is a copy of `frontend/extension-sdk` in
[frappe/builder](https://github.com/frappe/builder). The SDK is not on npm yet, so this
copy exists to let you install it today. Builder owns the source. Read
[Mirror, not fork](#mirror-not-fork) before you change a file here.

## Install

```sh
npm install --save-dev github:stravo1/frappe-builder-extension-sdk#v0.1.3
```

The package builds itself on install, so you need no extra step.

## Create an extension

Run the scaffolder directly from GitHub. The SDK does not need to be published
to npm:

```sh
npx github:stravo1/frappe-builder-extension-sdk#v0.1.3 create
```

It creates a TypeScript Vue extension with frappe-ui, Tailwind, a development
server, an example toolbar popover, release automation, and a Git repository.
It does not install dependencies. Run the commands it prints when it finishes.

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

Use the version 1 manifest shape. The build rejects missing and unknown fields.

```json
{
	"v": 1,
	"name": "acme/icons",
	"label": "Icon Library",
	"description": "Add an icon library to Builder.",
	"version": "1.2.0",
	"entry": "main.js",
	"icon": "icon.svg",
	"capabilities": ["context.read", "block.update"]
}
```

### One file

An extension builds to one file. The editor reads `main.js` and posts the code
into the frame, so nothing built has a URL left to fetch a second file from.

The plugin folds your CSS into the entry and inlines an asset up to 64 kB. A build
that emits anything else fails and names the file. Two things cause that:

- A dynamic `import()`. Import the module statically instead.
- An asset over 64 kB, usually a font. Drop it and use the one Builder loads.

`frappe-ui/style.css` imports Inter. Vite embeds an inlined asset once for every
reference, and six `@font-face` rules name each variable font, so that one import
adds 4.5 MB. Point it at an empty stylesheet:

```js
import path from "node:path";

export default defineConfig({
	resolve: {
		alias: [
			{
				find: /^.*fonts\/Inter\/inter\.css$/,
				replacement: path.resolve("./src/no-fonts.css"),
			},
		],
	},
});
```

The frame runs inside Builder, which loads Inter already, so your text renders
either way.

## Write against the editor

```js
import builder from "frappe-builder-extension-sdk";

builder.toolbar.register({
	name: "say-hello",
	region: "right",
	icon: "lucide-hand",
	action: () => builder.ui.toast("hello"),
});
```

A Vue slot uses the `/vue` entry. Register the adapter once, and every slot then takes a component.

```js
import { vueAdapter, useBuilderContext } from "frappe-builder-extension-sdk/vue";

builder.use(vueAdapter);
builder.popover.register({ component: () => import("./Popover.vue") });
```

`vue` is an optional peer dependency. Install it only if you write slots in Vue.

## Package a release

Builder Hub reads `manifest.json`, `README.md`, and `LICENSE` from the repository root.
Each release manifest declares its required Builder extension protocol in `v`.

Build, then create the release package:

```sh
npm run build
npx builder-extension package
```

The command validates the repository, manifest, built files, and package limits. A
package contains only `manifest.json`, `main.js`, and the optional SVG icon. The command
writes `release/acme-icons-1.2.0.builderext` and prints its size and SHA-256.

Create a GitHub release whose tag is the manifest version with a `v` prefix. For
example, manifest version `1.2.0` uses tag `v1.2.0`. Copy the workflow shipped at
`templates/github/workflows/release.yml` to `.github/workflows/release.yml`. It
supports both pushed tags and releases created on GitHub.

The first release and repository need Builder Hub review. For a later release, update
`manifest.json`, commit it, and push the exact version tag. Builder Hub detects and
validates the new GitHub release without another listing submission.

## Run your extension

1. Run `npm run dev` in your extension directory.
2. Open Builder at the origin you gave to `builderUrl`.
3. Choose **load development extension**, and paste the URL the terminal printed.

The editor reads `/__builder-extension` from your dev server, and adds the extension
for this session. A reload of the editor drops it.

## Install on a site

Builder has no install API yet. Until it arrives, `install_extension.py` writes the
files and inserts the record.

An extension belongs to the user who installed it. Nobody else on the site sees it,
and every user gets their own copy of the files at their own version.

1. Run `npm run build` in your extension directory.
2. Change to the `sites` directory of your bench.
3. Run the script with the site name and the extension directory.

```sh
cd sites
../env/bin/python /path/to/install_extension.py builder.localhost /path/to/my-extension
```

It installs for `Administrator`. Name another user with `--user`:

```sh
../env/bin/python /path/to/install_extension.py builder.localhost /path/to/my-extension \
	--user alice@example.com
```

Run it again after every build. The script hashes the files, and a new hash makes the
editor mount the new entry.

The script also reads `README.md` from your extension directory and stores it on the
installation, so the Extensions panel shows it. The file is never copied into the
package: a built extension is `main.js`, `manifest.json` and one icon, and nothing else.

The panel shows every capability your manifest asks for, and lets the user turn one
off. A capability the user turned off is refused the way one you never asked for is,
so read the error before you assume a bug.

To remove the extension for one user:

```sh
../env/bin/python /path/to/install_extension.py builder.localhost /path/to/my-extension --uninstall
```

Uninstall takes that user's copy, their grants and their stored state. It keeps every
doctype, token and client script the extension made, because those serve the whole
site. The script reports what stays, and whether anyone else still has the extension.

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

The SDK remains on `0.x` while its authoring API stabilizes. The extension
protocol is versioned separately by the manifest's `v` field.

## Mirror, not fork

`frontend/extension-sdk` in frappe/builder owns every SDK file here. Do not change one
in this repository. Change it in Builder, then copy it across:

```sh
python3 sync.py /path/to/apps/builder
```

`sync.py` copies `bin`, `create.js`, `src`, `templates`, `tests`, `skills`,
`install_extension.py`, `package.js`, `vite.js`, `package.json`,
`tsconfig.build.json`, and `vite.config.mts`. It
copies nothing else. This README and the license belong to this repository. Edit those here.

When the SDK reaches npm, this repository stops. Point your `package.json` at the npm
version. The copy then goes stale with no effect on you.

## Tests

```sh
npm install
npm test
npm run build
```

## License

MIT. Copyright (c) Frappe Technologies Pvt. Ltd. and contributors.
