# Proxy Switch design

## Purpose

A minimal Firefox extension that toggles routing all browser traffic through a SOCKS5 proxy on `localhost:9999`. One toolbar button whose icon shows the state, no popup, no options page.

## Approach

Use `browser.proxy.settings` (Firefox's global proxy setting) rather than a `proxy.onRequest` listener. The global setting covers all traffic literally, shows up in Firefox's own Network Settings dialog, needs no host permissions, and `clear()` restores whatever proxy configuration the user had before. The one cost is that `proxy.settings.set()` throws unless the extension is allowed to run in private windows, so the user flips "Run in Private Windows" to Allow once in `about:addons`.

The per-request listener was rejected because it needs an `<all_urls>` host permission, never applies to private windows, and holds the on/off state in the extension instead of in Firefox.

## Files

- `manifest.json`. Manifest V3. Permissions: `proxy` only. A toolbar `action`, a `background.scripts` event page, and a fixed `browser_specific_settings.gecko.id` so the private-window grant, which Firefox stores per add-on ID, survives reloads from `about:debugging`. `data_collection_permissions` declares `none`, which is accurate and clears the lint warning AMO would otherwise raise. `strict_min_version` is 142.0: `web-ext lint` requires a minimum version whenever the `proxy` permission is present, and 142 is the first release (desktop and Android) that understands every key in the manifest, so lint reports no warnings.
- `background.js`. Toggle and icon logic.
- `README.md`. Load steps, the one-time private-window grant, and how to confirm it works.
- `icons/off.svg` and `icons/on.svg`. A toggle-switch glyph: grey with the knob left when off, green with the knob right when on. The manifest uses the off icon as the action default and the on icon for the add-ons listing.

## Behavior

- **Toggle.** On click, read the current setting with `proxy.settings.get`. If it is already `proxyType: "manual"` with `socks` set to `localhost:9999`, call `clear()`. Otherwise call `set()` with `{ proxyType: "manual", socks: "localhost:9999", socksVersion: 5, proxyDNS: true }`. `proxyDNS` keeps DNS lookups inside the tunnel.
- **Icon.** After each toggle and whenever the background script loads, re-read the setting and swap the action icon between the on and off switch glyphs, clearing any error badge. Reading the real setting instead of a remembered flag keeps the icon truthful if the user changes the proxy by hand.
- **Ordering.** A click wakes the event page, which re-runs the whole script before delivering the click, so the load-time render and the click's toggle run through one promise queue instead of racing for the icon.
- **Errors.** If `set()` or `clear()` throws (the expected case is the missing private-window grant), or resolves `false` because Firefox did not apply the change (another extension controls the proxy), show a red `!` badge and put the error message in the button's hover title. No other error handling.

## Install and verify

- Temporary install via `about:debugging` → This Firefox → Load Temporary Add-on → `manifest.json`. The add-on is gone after a Firefox restart; Firefox reverts settings an extension controls when it is removed, so the proxy is off again on next start.
- Automated check: `npx web-ext lint` on the directory.
- Manual check: click, confirm `about:preferences` Network Settings shows Manual with SOCKS Host `localhost` port `9999`, SOCKS v5, Proxy DNS on; click again, confirm the previous setting is back.
