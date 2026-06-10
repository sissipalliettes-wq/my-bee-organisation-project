const STORAGE_KEY = "beeOrganisationStreak";
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const today = new Date();
const dayIndex = (today.getDay() + 6) % 7;

function getWeekKey(date) {
  const weekDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  weekDate.setUTCDate(weekDate.getUTCDate() + 4 - (weekDate.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(weekDate.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((weekDate - yearStart) / 86400000 + 1) / 7);

  return `${weekDate.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

function createDefaultState() {
  return {
    weekKey: getWeekKey(today),
    loggedDays: [],
    freezes: 0,
    lastFreezeClaimWeek: null,
  };
}

function loadState() {
  const fallback = createDefaultState();

  try {
    const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!savedState) {
      return fallback;
    }

    return {
      ...fallback,
      ...savedState,
      weekKey: fallback.weekKey,
      loggedDays: savedState.weekKey === fallback.weekKey && Array.isArray(savedState.loggedDays)
        ? savedState.loggedDays
        : [],
      freezes: Number.isFinite(savedState.freezes) ? savedState.freezes : 0,
    };
  } catch {
    return fallback;
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function markTodayLogged(state) {
  if (!state.loggedDays.includes(dayIndex)) {
    state.loggedDays.push(dayIndex);
    state.loggedDays.sort((a, b) => a - b);
  }

  return state;
}

function renderJars(state) {
  const jarRows = document.querySelectorAll("#honey-jar-row");
  const filledCount = state.loggedDays.length;
  const streakCount = document.querySelector("#streak-count");

  if (streakCount) {
    streakCount.textContent = `${filledCount} / 7 jars filled`;
  }

  jarRows.forEach((row) => {
    row.innerHTML = "";

    DAY_LABELS.forEach((label, index) => {
      const jar = document.createElement("span");
      const isFilled = state.loggedDays.includes(index);

      jar.className = `honey-jar${isFilled ? " is-filled" : ""}`;
      jar.setAttribute("role", "img");
      jar.setAttribute("aria-label", `${label}: ${isFilled ? "filled with honey" : "empty grey honey jar"}`);
      jar.innerHTML = `<span class="honey-jar__day">${label}</span>`;
      row.appendChild(jar);
    });
  });
}

function renderFreezeReward(state) {
  const freezeCount = document.querySelector("#freeze-count");
  const weeklyStatus = document.querySelector("#weekly-status");
  const claimButton = document.querySelector("#claim-freeze");

  if (!claimButton || !freezeCount || !weeklyStatus) {
    return;
  }

  const isClaimedThisWeek = state.lastFreezeClaimWeek === state.weekKey;

  freezeCount.textContent = state.freezes;
  weeklyStatus.textContent = isClaimedThisWeek ? "Claimed" : "Ready";
  claimButton.classList.toggle("is-claimed", isClaimedThisWeek);
  claimButton.disabled = isClaimedThisWeek;
  claimButton.querySelector(".beehive-button__label").textContent = isClaimedThisWeek
    ? "Hive opened"
    : "Open hive";

}

function bindFreezeReward(state) {
  const claimButton = document.querySelector("#claim-freeze");

  if (!claimButton) {
    return;
  }

  claimButton.addEventListener("click", () => {
    if (state.lastFreezeClaimWeek === state.weekKey) {
      return;
    }

    state.freezes += 1;
    state.lastFreezeClaimWeek = state.weekKey;
    saveState(state);
    claimButton.classList.add("is-open");
    renderFreezeReward(state);
  });
}

const state = markTodayLogged(loadState());
saveState(state);
renderJars(state);
renderFreezeReward(state);
bindFreezeReward(state);
