import { addDays, fromKey, MONTHS, MONTHS_OF, startOfMonth, startOfWeek, startOfYear, toKey, today } from "./dates.js";
import { getHabits, toggleResult } from "./model.js";
import { countMarkedDays, currentStreak, dayState, overallRate, scheduledDays, successRate } from "./stats.js";

const overallRateLabel = document.getElementById("overall-rate");
const overallProgress = document.getElementById("overall-progress");
const progressEmpty = document.getElementById("progress-empty");
const progressList = document.getElementById("progress-list");
const progressGrid = document.getElementById("progress-grid");
const gridList = document.getElementById("grid-list");
const gridLegend = document.getElementById("grid-legend");
const weekHead = document.getElementById("week-head");
const monthCalendar = document.getElementById("month-calendar");
const calendarDays = document.getElementById("calendar-days");
const progressBars = document.getElementById("progress-bars");
const viewSwitch = document.getElementById("view-switch");
const viewButtons = document.querySelectorAll(".progress-view-btn");
const periodButtons = document.querySelectorAll(".period-btn");
const progressNavigation = document.getElementById("progress-navigation");
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
    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
      return start.getFullYear() + " m. " + MONTHS_OF[start.getMonth()] + " " + start.getDate() + "–" + end.getDate() + " d.";
    }
    return start.getFullYear() + " m. " + MONTHS_OF[start.getMonth()] + " " + start.getDate() + " d. – " +
      end.getFullYear() + " m. " + MONTHS_OF[end.getMonth()] + " " + end.getDate() + " d.";
  }
  if (selectedPeriod === "month") {
    return start.getFullYear() + " m. " + MONTHS[start.getMonth()];
  }
  return start.getFullYear() + " m.";
}

function renderWeekGrid(habits, start, end) {
  const endKey = toKey(end);
  const todayKey = toKey(today());
  const stateLabels = {
    done: "Pažymėta",
    missed: "Praleista",
    pending: "Laukiama",
    "not-scheduled": "Nesuplanuota",
    future: "Ateitis"
  };

  for (const habit of habits) {
    const item = document.createElement("li");
    item.className = "week-habit " + habit.type;

    const nameWrap = document.createElement("div");
    nameWrap.className = "week-habit-name";
    const marker = document.createElement("span");
    marker.className = "habit-marker";
    marker.setAttribute("aria-hidden", "true");
    const name = document.createElement("strong");
    name.textContent = habit.name;
    nameWrap.appendChild(marker);
    nameWrap.appendChild(name);
    item.appendChild(nameWrap);

    const days = document.createElement("div");
    days.className = "grid-days";

    for (let date = start; toKey(date) <= endKey; date = addDays(date, 1)) {
      const dateKey = toKey(date);
      let state = dayState(habit, date);
      if (dateKey === todayKey && state === "missed") {
        state = "pending";
      }
      const dateLabel = date.getFullYear() + " m. " + MONTHS_OF[date.getMonth()] + " " + date.getDate() + " d.";
      const canToggle = dateKey < todayKey && (state === "done" || state === "missed");
      const cell = document.createElement(canToggle ? "button" : "span");
      cell.className = "progress-cell is-" + state;
      cell.title = dateLabel + " – " + stateLabels[state];
      if (canToggle) {
        const cellId = "grid-" + habit.id + "-" + dateKey;
        cell.id = cellId;
        cell.type = "button";
        cell.setAttribute("aria-pressed", state === "done");
        cell.setAttribute("aria-label", habit.name + ", " + dateLabel + ": " + stateLabels[state] + ". " +
          (state === "done" ? "Atšaukti žymėjimą" : "Pažymėti"));
        cell.addEventListener("click", function () {
          toggleResult(habit.id, dateKey);
          renderProgress();
          const updatedCell = document.getElementById(cellId);
          if (updatedCell) {
            updatedCell.focus();
          }
          onGridChange();
        });
      } else {
        cell.setAttribute("role", "img");
        cell.setAttribute("aria-label", habit.name + ", " + dateLabel + ": " + stateLabels[state]);
      }
      days.appendChild(cell);
    }

    item.appendChild(days);
    const count = document.createElement("span");
    count.className = "week-habit-count";
    count.textContent = countMarkedDays(habit, start, end) + "/" + scheduledDays(habit, start, end);
    item.appendChild(count);
    gridList.appendChild(item);
  }
}

function renderMonthCalendar(start, end) {
  const todayKey = toKey(today());
  const leadingDays = (start.getDay() + 6) % 7;

  for (let index = 0; index < leadingDays; index++) {
    const blank = document.createElement("span");
    blank.className = "calendar-blank";
    blank.setAttribute("aria-hidden", "true");
    calendarDays.appendChild(blank);
  }

  for (let date = start; toKey(date) <= toKey(end); date = addDays(date, 1)) {
    const dateKey = toKey(date);
    const rate = overallRate(date, date);
    let state = "partial";
    if (dateKey > todayKey) {
      state = "future";
    } else if (rate === "–") {
      state = "not-scheduled";
    } else if (rate === 100) {
      state = "done";
    } else if (dateKey === todayKey && rate === 0) {
      state = "pending";
    } else if (rate === 0) {
      state = "missed";
    }

    const cell = document.createElement("div");
    cell.className = "calendar-day is-" + state;
    cell.setAttribute("role", "img");
    const dateLabel = date.getFullYear() + " m. " + MONTHS_OF[date.getMonth()] + " " + date.getDate() + " d.";
    const resultLabel = dateKey > todayKey ? "Ateitis" : rate === "–" ? "Nesuplanuota" : formatRate(rate) + " pažymėta";
    cell.setAttribute("aria-label", dateLabel + ": " + resultLabel);

    const number = document.createElement("span");
    number.className = "calendar-day-number";
    number.textContent = date.getDate();
    cell.appendChild(number);

    if (dateKey <= todayKey && rate !== "–") {
      const percentage = document.createElement("span");
      percentage.className = "calendar-day-rate";
      percentage.textContent = Math.round(rate) + "%";
      cell.appendChild(percentage);
    }

    calendarDays.appendChild(cell);
  }

  const trailingDays = 6 - ((end.getDay() + 6) % 7);
  for (let index = 0; index < trailingDays; index++) {
    const blank = document.createElement("span");
    blank.className = "calendar-blank";
    blank.setAttribute("aria-hidden", "true");
    calendarDays.appendChild(blank);
  }
}

function renderBars(habits, start, end) {
  for (const habit of habits) {
    const item = document.createElement("li");
    item.className = "progress-card " + habit.type;

    const marker = document.createElement("span");
    marker.className = "habit-marker";
    marker.setAttribute("aria-hidden", "true");

    const info = document.createElement("div");
    info.className = "progress-card-info";
    const name = document.createElement("strong");
    name.textContent = habit.name;
    const streak = document.createElement("small");
    streak.textContent = "Streak: " + currentStreak(habit) + " d.";
    info.appendChild(name);
    info.appendChild(streak);

    const rate = successRate(habit, start, end);
    const bar = document.createElement("progress");
    bar.className = "progress-bar";
    bar.max = 100;
    bar.value = rate === "–" ? 0 : rate;
    bar.setAttribute("aria-label", habit.name + ": " + (rate === "–" ? "nėra suplanuotų dienų" : formatRate(rate)));

    const total = document.createElement("div");
    total.className = "progress-card-total";
    const count = document.createElement("span");
    count.textContent = countMarkedDays(habit, start, end) + "/" + scheduledDays(habit, start, end);
    const percentage = document.createElement("small");
    percentage.textContent = formatRate(rate);
    total.appendChild(count);
    total.appendChild(percentage);

    item.appendChild(marker);
    item.appendChild(info);
    item.appendChild(bar);
    item.appendChild(total);
    progressList.appendChild(item);
  }
}

export function renderProgress() {
  const habits = getHabits();
  const currentDate = today();
  const gridAvailable = selectedPeriod === "week" || selectedPeriod === "month";
  if (!gridAvailable) {
    selectedView = "bars";
  }

  progressList.innerHTML = "";
  gridList.innerHTML = "";
  calendarDays.innerHTML = "";
  viewSwitch.hidden = !gridAvailable;
  progressNavigation.hidden = selectedPeriod === "all";
  progressEmpty.hidden = habits.length !== 0;
  progressGrid.hidden = selectedView !== "grid" || habits.length === 0;
  progressBars.hidden = selectedView !== "bars" || habits.length === 0;
  gridLegend.hidden = selectedPeriod !== "week";
  weekHead.hidden = selectedPeriod !== "week";
  gridList.hidden = selectedPeriod !== "week";
  monthCalendar.hidden = selectedPeriod !== "month";

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
    overallProgress.value = 0;
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

  if (selectedView === "grid") {
    if (selectedPeriod === "week") {
      renderWeekGrid(habits, start, end);
    } else {
      renderMonthCalendar(start, end);
    }
  } else {
    renderBars(habits, start, end);
  }

  const rate = overallRate(start, end);
  overallRateLabel.textContent = formatRate(rate);
  overallProgress.value = rate === "–" ? 0 : rate;
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
    if (selectedPeriod !== "week" && selectedPeriod !== "month") {
      return;
    }
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
