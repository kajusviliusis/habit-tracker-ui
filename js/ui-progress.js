import { addDays, fromKey, MONTHS, MONTHS_OF, startOfMonth, startOfWeek, startOfYear, toKey, today } from "./dates.js";
import { getHabits, toggleResult } from "./model.js";
import { countMarkedDays, currentStreak, dayState, overallRate, scheduledDays, successRate } from "./stats.js";

const overallRateLabel = document.getElementById("overall-rate");
const progressEmpty = document.getElementById("progress-empty");
const progressList = document.getElementById("progress-list");
const progressGrid = document.getElementById("progress-grid");
const gridList = document.getElementById("grid-list");
const progressBars = document.getElementById("progress-bars");
const viewButtons = document.querySelectorAll(".progress-view-btn");
const periodButtons = document.querySelectorAll(".period-btn");
const periodNavigation = document.getElementById("period-navigation");
const periodLabel = document.getElementById("period-label");
const btnPrevPeriod = document.getElementById("btn-prev-period");
const btnNextPeriod = document.getElementById("btn-next-period");

let selectedPeriod = "all";
let selectedView = "bars";
let periodDate = today();
let onGridChange = function () {};

export function setOnGridChange(fn) {
  onGridChange = fn;
}

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

function renderGrid(habits, start, end) {
  const startKey = toKey(start);
  const endKey = toKey(end);
  const todayKey = toKey(today());
  const stateLabels = {
    done: "Pažymėta",
    missed: "Praleista",
    "not-scheduled": "Nesuplanuota",
    future: "Ateitis"
  };

  for (const habit of habits) {
    const item = document.createElement("li");
    item.className = "habit-card grid-habit " + habit.type;

    const name = document.createElement("strong");
    name.textContent = habit.name;
    item.appendChild(name);

    const days = document.createElement("div");
    days.className = "grid-days";

    for (let date = start; toKey(date) <= endKey; date = addDays(date, 1)) {
      const dateKey = toKey(date);
      const state = dayState(habit, date);
      const dateLabel = date.getFullYear() + " m. " + MONTHS_OF[date.getMonth()] + " " + date.getDate() + " d.";
      const canToggle = dateKey < todayKey && (state === "done" || state === "missed");
      const cell = document.createElement(canToggle ? "button" : "span");
      cell.className = "progress-cell is-" + state;
      cell.title = dateLabel + " – " + stateLabels[state];
      if (canToggle) {
        cell.type = "button";
        cell.setAttribute("aria-pressed", state === "done");
        cell.setAttribute("aria-label", habit.name + ", " + dateLabel + ": " + stateLabels[state] + ". " +
          (state === "done" ? "Atšaukti žymėjimą" : "Pažymėti"));
        cell.addEventListener("click", function () {
          toggleResult(habit.id, dateKey);
          renderProgress();
          onGridChange();
        });
      } else {
        cell.setAttribute("role", "img");
        cell.setAttribute("aria-label", habit.name + ", " + dateLabel + ": " + stateLabels[state]);
      }
      if (dateKey === startKey) {
        cell.style.gridColumn = String((date.getDay() + 6) % 7 + 1);
      }
      days.appendChild(cell);
    }

    item.appendChild(days);
    gridList.appendChild(item);
  }
}

export function renderProgress() {
  const habits = getHabits();
  const currentDate = today();
  progressList.innerHTML = "";
  gridList.innerHTML = "";
  progressEmpty.hidden = habits.length !== 0;
  progressGrid.hidden = selectedView !== "grid" || habits.length === 0;
  progressBars.hidden = selectedView !== "bars" || habits.length === 0;

  for (const button of viewButtons) {
    const active = button.getAttribute("data-view") === selectedView;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active);
  }

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

    const header = document.createElement("div");
    header.className = "progress-card-header";

    const name = document.createElement("strong");
    name.textContent = habit.name;

    const rate = successRate(habit, start, end);
    const rateLabel = document.createElement("span");
    rateLabel.textContent = "Pažanga: " + formatRate(rate);
    header.appendChild(name);
    header.appendChild(rateLabel);

    const bar = document.createElement("progress");
    bar.className = "progress-bar";
    bar.max = 100;
    bar.value = rate === "–" ? 0 : rate;
    bar.setAttribute("aria-label", habit.name + ": " + formatRate(rate));

    const marked = countMarkedDays(habit, start, end);
    const total = scheduledDays(habit, start, end);
    const details = document.createElement("div");
    details.className = "progress-card-details";
    details.textContent = marked + "/" + total + " d. · Streak: " + currentStreak(habit) + " d.";

    item.appendChild(header);
    item.appendChild(bar);
    item.appendChild(details);
    progressList.appendChild(item);
  }

  if (selectedView === "grid") {
    renderGrid(habits, start, end);
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

for (const button of viewButtons) {
  button.addEventListener("click", function () {
    selectedView = button.getAttribute("data-view");
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
