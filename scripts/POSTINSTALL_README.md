Postinstall patch for OpenPlayerJS ads.js

Purpose

- Ensure the Google IMA SDK does not render its built-in skip / video UI by patching OpenPlayerJS's `dist/esm/media/ads.js` to set `AdsRenderingSettings` flags.

Location

- Script: `scripts/postinstall-patch-openplayerjs.js`
- Hook: root `postinstall` script in `package.json`

Behavior

- Runs automatically after `pnpm install`.
- Idempotent: it checks for markers and will not re-apply the patch if present.
- Creates a backup of the original file as `<ads.js>.genuin-patch.bak` when it first patches.

Manual usage

- Run manually if needed:

```bash
node scripts/postinstall-patch-openplayerjs.js
```

Revert

- Restore the backup created by the script, for example:

```bash
cp path/to/ads.js.genuin-patch.bak path/to/ads.js
```

Notes

- This is a local workaround. We recommend opening an upstream PR against `openplayerjs` to allow configuring `AdsRenderingSettings` at AdsManager creation.
- If `openplayerjs` is upgraded, re-run `pnpm install` to apply the patch again; verify the patch applied by checking `adsRenderingSettings.uiElements` or the backup file existence.
