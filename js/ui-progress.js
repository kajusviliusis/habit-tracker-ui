import { fromKey, today } from "./dates.js";
import { getHabits } from "./model.js";
import { currentStreak, overallRate, successRate } from "./stats.js";

const overallRateLabel = document.getElementById("overall-rate");
const progressEmpty = document.getElementById("progress-empty");
const progressList = document.getElementById("progress-list");

function formatRate(rate) {
  return rate === "–" ? rate : Math.round(rate) + " %";
}

export function renderProgress() {
  const habits = getHabits();
  const end = today();
  progressList.innerHTML = "";
  progressEmpty.hidden = habits.length !== 0;

  if (habits.length === 0) {
    overallRateLabel.textContent = "–";
    return;
  }

  let firstKey = habits[0].createdAt;
  for (const habit of habits) {
    if (habit.createdAt < firstKey) {
      firstKey = habit.createdAt;
    }

    const item = document.createElement("li");
    item.className = "habit-card progress-card " + habit.type;

    const name = document.createElement("strong");
    name.textContent = habit.name;

    const rate = successRate(habit, fromKey(habit.createdAt), end);
    const details = document.createElement("span");
    details.textContent = "Sėkmė: " + formatRate(rate) + " · Seka: " + currentStreak(habit) + " d.";

    item.appendChild(name);
    item.appendChild(details);
    progressList.appendChild(item);
  }

  overallRateLabel.textContent = formatRate(overallRate(fromKey(firstKey), end));
}
