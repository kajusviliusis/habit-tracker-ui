import { addDays, fromKey, MONTHS, MONTHS_OF, startOfMonth, startOfWeek, startOfYear, toKey, today } from "./dates.js";
import { getHabits } from "./model.js";
import { currentStreak, overallRate, successRate } from "./stats.js";

const overallRateLabel = document.getElementById("overall-rate");
const progressEmpty = document.getElementById("progress-empty");
const progressList = document.getElementById("progress-list");
const periodButtons = document.querySelectorAll(".period-btn");
const periodNavigation = document.getElementById("period-navigation");
const periodLabel = document.getElementById("period-label");
const btnPrevPeriod = document.getElementById("btn-prev-period");
const btnNextPeriod = document.getElementById("btn-next-period");

let selectedPeriod = "all";
let periodDate = today();

function formatRate(rate) {
  return rate === "–" ? rate : Math.round(rate) + " %";
}

function getPeriodStart(date) {
  if (selectedPeriod === "week") {
    return startOfWeek(date);
  }
  if (selectedPeriod === "month") {
    return startOfMonth(date);
  }
  return startOfYear(date);
}

function formatPeriod(start, end) {
  if (selectedPeriod === "week") {
    return start.getFullYear() + " m. " + MONTHS_OF[start.getMonth()] + " " + start.getDate() + " d. – " +
      end.getFullYear() + " m. " + MONTHS_OF[end.getMonth()] + " " + end.getDate() + " d.";
  }
  if (selectedPeriod === "month") {
    return start.getFullYear() + " m. " + MONTHS[start.getMonth()];
  }
  return start.getFullYear() + " m.";
}

export function renderProgress() {
  const habits = getHabits();
  const currentDate = today();
  progressList.innerHTML = "";
  progressEmpty.hidden = habits.length !== 0;

  for (const button of periodButtons) {
    const active = button.getAttribute("data-period") === selectedPeriod;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active);
  }

  periodNavigation.hidden = selectedPeriod === "all";
  let start = currentDate;
  let end = currentDate;

  if (selectedPeriod !== "all") {
    start = getPeriodStart(periodDate);
    if (selectedPeriod === "week") {
      end = addDays(start, 6);
    } else if (selectedPeriod === "month") {
      end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    } else {
      end = new Date(start.getFullYear(), 11, 31);
    }
    periodLabel.textContent = formatPeriod(start, end);
    btnNextPeriod.disabled = toKey(start) >= toKey(getPeriodStart(currentDate));
  }

  if (habits.length === 0) {
    overallRateLabel.textContent = "–";
    return;
  }

  if (selectedPeriod === "all") {
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
    periodDate = today();
    renderProgress();
  });
}

function changePeriod(amount) {
  if (selectedPeriod === "week") {
    periodDate = addDays(periodDate, amount * 7);
  } else if (selectedPeriod === "month") {
    periodDate = new Date(periodDate.getFullYear(), periodDate.getMonth() + amount, 1);
  } else if (selectedPeriod === "year") {
    periodDate = new Date(periodDate.getFullYear() + amount, 0, 1);
  }
  renderProgress();
}

btnPrevPeriod.addEventListener("click", function () {
  changePeriod(-1);
});

btnNextPeriod.addEventListener("click", function () {
  changePeriod(1);
});
