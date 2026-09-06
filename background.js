const SOCKS = "localhost:9999";
const PROXY = { proxyType: "manual", socks: SOCKS, socksVersion: 5, proxyDNS: true };
const settings = browser.proxy.settings;

async function isOn() {
  const { value } = await settings.get({});
  return value.proxyType === "manual" && value.socks === SOCKS;
}

async function render() {
  const on = await isOn();
  await browser.action.setIcon({ path: on ? "icons/on.svg" : "icons/off.svg" });
  await browser.action.setBadgeText({ text: "" });
  await browser.action.setTitle({ title: `SOCKS5 ${SOCKS}: ${on ? "on" : "off"}` });
}

async function fail(err) {
  await browser.action.setBadgeBackgroundColor({ color: "#c62828" });
  await browser.action.setBadgeText({ text: "!" });
  await browser.action.setTitle({ title: `Proxy Switch error: ${err?.message ?? err}` });
}

async function toggle() {
  const changed = (await isOn()) ? await settings.clear({}) : await settings.set({ value: PROXY });
  if (!changed) {
    throw new Error("Firefox did not apply the change; another extension may control the proxy");
  }
  await render();
}

// A click wakes the event page, which re-runs this whole script before
// delivering the click, so the load-time render and the toggle would
// otherwise race for the icon. One queue keeps them in order.
let queue = Promise.resolve();
function enqueue(task) {
  queue = queue.then(task).catch(fail);
}

browser.action.onClicked.addListener(() => enqueue(toggle));
enqueue(render);
