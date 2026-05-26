const targetMonth = 7;
const targetDay = 12;
const now = new Date();
const isAnniversaryToday =
  now.getMonth() === targetMonth && now.getDate() === targetDay;
let target = new Date(now.getFullYear(), targetMonth, targetDay, 0, 0, 0);

if (now > target && !isAnniversaryToday) {
  target = new Date(now.getFullYear() + 1, targetMonth, targetDay, 0, 0, 0);
}

const parts = {
  days: document.querySelector("#days"),
  hours: document.querySelector("#hours"),
  minutes: document.querySelector("#minutes"),
  seconds: document.querySelector("#seconds"),
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  const diff = Math.max(target.getTime() - Date.now(), 0);
  const seconds = Math.floor(diff / 1000) % 60;
  const minutes = Math.floor(diff / (1000 * 60)) % 60;
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  parts.days.textContent = pad(days);
  parts.hours.textContent = pad(hours);
  parts.minutes.textContent = pad(minutes);
  parts.seconds.textContent = pad(seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);

const releaseSections = document.querySelectorAll("[data-unlock-date]");
const releaseCards = document.querySelectorAll("[data-release-card]");
const releaseDateFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "long",
});

function getReleaseClock() {
  const params = new URLSearchParams(window.location.search);
  const preview = params.get("preview");

  if (preview === "all") {
    return new Date("2026-08-13T12:00:00");
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(preview || "")) {
    return new Date(`${preview}T12:00:00`);
  }

  return new Date();
}

function parseUnlockDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysUntil(unlockDate, currentDate) {
  const dayLength = 1000 * 60 * 60 * 24;
  return Math.max(
    Math.ceil((startOfDay(unlockDate) - startOfDay(currentDate)) / dayLength),
    0
  );
}

function lockSection(section, unlockDate, currentDate) {
  const remaining = daysUntil(unlockDate, currentDate);
  const dateText = releaseDateFormatter.format(unlockDate);
  const waitText = remaining === 1 ? "Falta 1 dia" : `Faltan ${remaining} dias`;

  section.classList.add("is-locked");
  section.innerHTML = `
    <article class="lock-card">
      <p class="lock-card__kicker">${section.dataset.lockKicker}</p>
      <span class="lock-card__date">Se desbloquea el ${dateText}</span>
      <h2>${section.dataset.lockTitle}</h2>
      <p>${section.dataset.lockHint}</p>
      <p>${waitText} para ver este capitulo.</p>
    </article>
  `;
}

function applyReleaseSchedule() {
  const currentDate = getReleaseClock();
  const unlockedCards = new Set();

  for (const section of releaseSections) {
    const unlockDate = parseUnlockDate(section.dataset.unlockDate);
    const isUnlocked = startOfDay(currentDate) >= startOfDay(unlockDate);
    const cardName = section.dataset.unlockCard;

    if (isUnlocked) {
      unlockedCards.add(cardName);
      section.classList.add("is-unlocked");
    } else {
      lockSection(section, unlockDate, currentDate);
    }
  }

  for (const card of releaseCards) {
    const cardName = card.dataset.releaseCard;
    card.dataset.state = unlockedCards.has(cardName) ? "unlocked" : "locked";
  }
}

applyReleaseSchedule();

const modal = document.querySelector(".teaser-modal");
const triggers = document.querySelectorAll(".trailer-trigger");
const closeButton = document.querySelector(".modal-close");

function restartTrailer() {
  const player = modal.querySelector(".teaser-player");
  const teaserVideo = modal.querySelector("video");
  player.style.animation = "none";
  for (const frame of modal.querySelectorAll(".reel-frame")) {
    frame.style.animation = "none";
  }

  if (teaserVideo) {
    teaserVideo.pause();
    teaserVideo.currentTime = 0;
  }

  requestAnimationFrame(() => {
    player.style.animation = "";
    for (const frame of modal.querySelectorAll(".reel-frame")) {
      frame.style.animation = "";
    }

    if (teaserVideo) {
      teaserVideo.play().catch(() => {});
    }
  });
}

function openTrailer() {
  if (typeof modal.showModal === "function") {
    modal.showModal();
  } else {
    modal.setAttribute("open", "");
  }

  restartTrailer();
}

function closeTrailer() {
  const teaserVideo = modal.querySelector("video");
  if (teaserVideo) {
    teaserVideo.pause();
  }

  if (typeof modal.close === "function") {
    modal.close();
  } else {
    modal.removeAttribute("open");
  }
}

for (const trigger of triggers) {
  trigger.addEventListener("click", openTrailer);
}

closeButton.addEventListener("click", closeTrailer);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeTrailer();
  }
});
