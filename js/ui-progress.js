import { fromKey, startOfMonth, startOfWeek, startOfYear, today } from "./dates.js";
import { getHabits } from "./model.js";
import { currentStreak, overallRate, successRate } from "./stats.js";

const overallRateLabel = document.getElementById("overall-rate");
const progressEmpty = document.getElementById("progress-empty");
const progressList = document.getElementById("progress-list");
const periodButtons = document.querySelectorAll(".period-btn");

let selectedPeriod = "all";

function formatRate(rate) {
  return rate === "–" ? rate : Math.round(rate) + " %";
}

export function renderProgress() {
  const habits = getHabits();
  const end = today();
  progressList.innerHTML = "";
  progressEmpty.hidden = habits.length !== 0;

  for (const button of periodButtons) {
    const active = button.getAttribute("data-period") === selectedPeriod;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active);
  }

  if (habits.length === 0) {
    overallRateLabel.textContent = "–";
    return;
  }

  let start;
  if (selectedPeriod === "week") {
    start = startOfWeek(end);
  } else if (selectedPeriod === "month") {
    start = startOfMonth(end);
  } else if (selectedPeriod === "year") {
    start = startOfYear(end);
  } else {
    let firstKey = habits[0].createdAt;
    for (const habit of habits) {
      if (habit.createdAt < firstKey) {
        firstKey = habit.createdAt;
      }
    }
    start = fromKey(firstKey);
  }

  for (const habit of habits) {
    const item = document.createElement("li");
    item.className = "habit-card progress-card " + habit.type;

    const name = document.createElement("strong");
    name.textContent = habit.name;

    const rate = successRate(habit, start, end);
    const details = document.createElement("span");
    details.textContent = "Pažanga: " + formatRate(rate) + " · Streak: " + currentStreak(habit) + " d.";

    item.appendChild(name);
    item.appendChild(details);
    progressList.appendChild(item);
  }

  overallRateLabel.textContent = formatRate(overallRate(start, end));
}

for (const button of periodButtons) {
  button.addEventListener("click", function () {
    selectedPeriod = button.getAttribute("data-period");
    renderProgress();
  });
}
