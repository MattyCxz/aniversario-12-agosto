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
