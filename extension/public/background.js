const STORAGE_KEY = "twitch_watchlist";
const API_BASE_URLS = ["https://test.phangwilly.com/twitch", "http://localhost:3000"];
const ALARM_NAME = "refresh-live-badge";
const ALARM_MINUTES = 1;

async function getWatchlistLogins() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  const list = Array.isArray(data[STORAGE_KEY]) ? data[STORAGE_KEY] : [];
  return list
    .map((item) => (typeof item?.login === "string" ? item.login.trim() : ""))
    .filter(Boolean);
}

async function fetchLiveCount(logins) {
  if (logins.length === 0) return 0;
  let lastError;
  for (const baseUrl of API_BASE_URLS) {
    try {
      const response = await fetch(`${baseUrl}/api/twitch/streams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logins }),
      });

      if (!response.ok) {
        throw new Error(`Streams API failed (${response.status})`);
      }

      const payload = await response.json();
      const count =
        typeof payload?.liveCount === "number"
          ? payload.liveCount
          : Array.isArray(payload?.live)
            ? payload.live.length
            : 0;

      return count;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function setBadge(count) {
  await chrome.action.setBadgeBackgroundColor({ color: "#7c3aed" });
  await chrome.action.setBadgeTextColor({ color: "#ffffff" });
  await chrome.action.setBadgeText({
    text: count > 0 ? String(Math.min(count, 99)) : "",
  });
}

async function refreshBadge() {
  try {
    const logins = await getWatchlistLogins();
    const liveCount = await fetchLiveCount(logins);
    await setBadge(liveCount);
  } catch {
    await chrome.action.setBadgeText({ text: "" });
  }
}

function ensureAlarm() {
  chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: ALARM_MINUTES,
  });
}

chrome.runtime.onInstalled.addListener(() => {
  ensureAlarm();
  void refreshBadge();
});

chrome.runtime.onStartup.addListener(() => {
  ensureAlarm();
  void refreshBadge();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    void refreshBadge();
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes[STORAGE_KEY]) {
    void refreshBadge();
  }
});

