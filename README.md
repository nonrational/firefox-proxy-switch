# Proxy Switch

A minimal Firefox extension. Click the toolbar button to route all Firefox traffic through a SOCKS5 proxy on `localhost:9999`; click again to restore your previous proxy setting. The switch icon shows grey and off, or green and on, to match.

<img width="307" height="71" alt="image" src="https://github.com/user-attachments/assets/a80f0a29-503c-452e-b288-3a2211a85afc" />


## Install

1. Open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on…**, and pick `manifest.json` from this directory.
2. One-time step: open `about:addons`, click **Proxy Switch**, and set **Run in Private Windows** to **Allow**. Firefox requires this for any extension that changes the global proxy setting, because that setting applies to private windows too. Without it the button shows a red **!** badge and the hover title carries the error.

The add-on is removed when Firefox exits, so repeat step 1 after each restart. Firefox reverts settings an extension controls when the extension is removed, so the proxy is off again on next start.

## Verify

After clicking the button, open `about:preferences`, scroll to **Network Settings**, and click **Settings…**. You should see **Manual proxy configuration** with SOCKS Host `localhost`, Port `9999`, **SOCKS v5**, and **Proxy DNS when using SOCKS v5** checked. Click the button again and the dialog shows whatever you had before.

## Permissions

`proxy` only.

## Lint

```sh
npx web-ext lint
```

Node 22 is pinned in `.tool-versions` because web-ext crashes intermittently with a bus error under node 25 on macOS.
