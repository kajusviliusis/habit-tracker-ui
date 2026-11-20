import { addDays, fromKey, MONTHS, MONTHS_OF, startOfMonth, startOfWeek, startOfYear, toKey, today } from "./dates.js";
import { getHabits, toggleResult } from "./model.js";
import { countMarkedDays, dayState, overallRate, scheduledDays, successRate } from "./stats.js";

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

// Pranesame dienos rodiniui, kai pakeiciamas savaites langelis.
export function setOnGridChange(fn) {
  onGridChange = fn;
}

// Procenta paverciame trumpu uzrasu arba bruksniu, kai dienu nera.
function formatRate(rate) {
  if (rate === "–") {
    return rate;
  }
  return Math.round(rate) + " %";
}

// Pagal pasirinkta laikotarpi randame jo pirma diena.
function getPeriodStart(date) {
  if (selectedPeriod === "week") {
    return startOfWeek(date);
  }
  if (selectedPeriod === "month") {
    return startOfMonth(date);
  }
  return startOfYear(date);
}

// Suformuojame lietuviska savaites, menesio arba metu uzrasa.
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

// Kiekvienam iprociui parodome septynis savaites dienu langelius.
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
    item.className = "week-habit";
    item.style.setProperty("--habit-color", habit.color);

    const nameWrap = document.createElement("div");
    nameWrap.className = "week-habit-name";
    const marker = document.createElement("span");
    marker.className = "habit-marker";
    marker.textContent = habit.type === "todo" ? "●" : "×";
    marker.setAttribute("aria-hidden", "true");
    const name = document.createElement("strong");
    name.textContent = habit.name;
    nameWrap.appendChild(marker);
    nameWrap.appendChild(name);
    item.appendChild(nameWrap);

    const days = document.createElement("div");
    days.className = "grid-days";

    // Siandienos nezymeta diena dar laikoma laukiancia, o ne praleista.
    for (let date = start; toKey(date) <= endKey; date = addDays(date, 1)) {
      const dateKey = toKey(date);
      let state = dayState(habit, date);
      if (dateKey === todayKey && state === "missed") {
        state = "pending";
      }
      const dateLabel = date.getFullYear() + " m. " + MONTHS_OF[date.getMonth()] + " " + date.getDate() + " d.";
      const canToggle = dateKey < todayKey && (state === "done" || state === "missed");
      // Praejusios suplanuotos dienos yra mygtukai, kitos tik informaciniai langeliai.
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

// Menesio rodinyje sukuriame kalendoriu su bendra kiekvienos dienos pazanga.
function renderMonthCalendar(habits, start, end) {
  const todayKey = toKey(today());
  const leadingDays = (start.getDay() + 6) % 7;

  // Tusci langeliai sulygiuoja pirma menesio diena su savaites diena.
  for (let index = 0; index < leadingDays; index++) {
    const blank = document.createElement("span");
    blank.className = "calendar-blank";
    blank.setAttribute("aria-hidden", "true");
    calendarDays.appendChild(blank);
  }

  for (let date = start; toKey(date) <= toKey(end); date = addDays(date, 1)) {
    const dateKey = toKey(date);
    const rate = overallRate(date, date);
    // Dienos busena parenkama pagal pazymetu iprociu dali.
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
    let resultLabel;
    if (dateKey > todayKey) {
      resultLabel = "Ateitis";
    } else if (rate === "–") {
      resultLabel = "Nesuplanuota";
    } else {
      resultLabel = formatRate(rate) + " pažymėta";
    }
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

      const indicators = document.createElement("span");
      indicators.className = "calendar-day-indicators";
      indicators.setAttribute("aria-hidden", "true");
      // Spalvoti taskai nurodo ta diena pazymetus iprocius.
      for (const habit of habits) {
        if (dayState(habit, date) === "done") {
          const indicator = document.createElement("span");
          indicator.className = "calendar-indicator";
          indicator.style.backgroundColor = habit.color;
          indicators.appendChild(indicator);
        }
      }
      cell.appendChild(indicators);
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

// Juostu rodinyje pateikiame kiekvieno iprocio procenta ir dienu skaiciu.
function renderBars(habits, start, end) {
  for (const habit of habits) {
    const item = document.createElement("li");
    item.className = "progress-card";
    item.style.setProperty("--habit-color", habit.color);

    const marker = document.createElement("span");
    marker.className = "habit-marker";
    marker.textContent = habit.type === "todo" ? "●" : "×";
    marker.setAttribute("aria-hidden", "true");

    const info = document.createElement("div");
    info.className = "progress-card-info";
    const name = document.createElement("strong");
    name.textContent = habit.name;
    info.appendChild(name);

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

// Atnaujiname valdiklius ir pasirinkto laikotarpio pazangos turini.
export function renderProgress() {
  const habits = getHabits();
  const currentDate = today();
  // Langeliai turi prasme tik savaites ir menesio rodiniuose.
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

  // Aktyvius pasirinkimus pazymime ir vaizdu, ir aria-pressed atributu.
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

  // Kalendorinio laikotarpio ribas naudojame visiems toliau esantiems skaiciavimams.
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

  // Visas laikotarpis prasideda nuo seniausio iprocio sukurimo dienos.
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
      renderMonthCalendar(habits, start, end);
    }
  } else {
    renderBars(habits, start, end);
  }

  const rate = overallRate(start, end);
  overallRateLabel.textContent = formatRate(rate);
  overallProgress.value = rate === "–" ? 0 : rate;
}

// Rodykles perkelia i gretima savaite, menesi arba metus.
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

// Laikotarpio ir rodinio mygtukai is naujo piesia pazanga.
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

btnPrevPeriod.addEventListener("click", function () {
  changePeriod(-1);
});

btnNextPeriod.addEventListener("click", function () {
  changePeriod(1);
});
