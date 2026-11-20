
import { load, save } from "./storage.js";
import { addDays, toKey, today } from "./dates.js";

const NAME_MAX = 50;
const HABIT_COLORS = ["#36b8e6", "#945be8", "#ef646b", "#18b7b0", "#df62b5", "#d99a37"];

let state = load();

function nextHabitColor() {
  for (const color of HABIT_COLORS) {
    if (!state.habits.some(habit => habit.color === color)) {
      return color;
    }
  }
  return HABIT_COLORS[state.habits.length % HABIT_COLORS.length];
}

let colorsAdded = false;
for (const habit of state.habits) {
  if (!habit.color) {
    habit.color = nextHabitColor();
    colorsAdded = true;
  }
}
if (colorsAdded) {
  save(state);
}

export function validateHabit(name, type, days) {
  const errors = {};

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    errors.name = "Įveskite pavadinimą.";
  } else if (trimmed.length > NAME_MAX) {
    errors.name = "Pavadinimas negali būti ilgesnis nei 50 simbolių.";
  }

  if (type !== "todo" && type !== "nottodo") {
    errors.type = "Pasirinkite įpročio tipą.";
  }

  if (days.length === 0) {
    errors.days = "Pasirinkite bent vieną savaitės dieną.";
  }

  return errors;
}

export function hasErrors(errors) {
  if (errors.name || errors.type || errors.days) {
    return true;
  }
  return false;
}


export function getHabits() {
  return state.habits;
}

export function getHabit(id) {
  for (let i = 0; i < state.habits.length; i++) {
    if (state.habits[i].id === id) {
      return state.habits[i];
    }
  }
  return null;
}

export function getHabitsForDate(date) {
  const dateKey = toKey(date);
  const weekday = date.getDay();
  const result = [];

  for (let i = 0; i < state.habits.length; i++) {
    const habit = state.habits[i];

    const isPlanned = habit.days.indexOf(weekday) !== -1;
    const alreadyCreated = habit.createdAt <= dateKey;

    if (isPlanned && alreadyCreated) {
      result.push(habit);
    }
  }

  return result;
}

export function addDemoData() {
  const demoHabits = [
    { id: "demo_read", name: "Skaityti", type: "todo", days: [0, 1, 2, 3, 4, 5, 6] },
    { id: "demo_exercise", name: "Sportuoti", type: "todo", days: [1, 3, 5] },
    { id: "demo_sweets", name: "Nevalgyti saldumynų", type: "nottodo", days: [0, 1, 2, 3, 4, 5, 6] }
  ];
  const start = addDays(today(), -59);
  let added = 0;

  for (const demoHabit of demoHabits) {
    if (getHabit(demoHabit.id) !== null) {
      continue;
    }

    const habit = { ...demoHabit, color: nextHabitColor(), createdAt: toKey(start) };
    state.habits.push(habit);
    state.results[habit.id] = {};

    for (let day = 0; day < 60; day++) {
      const date = addDays(start, day);
      if (habit.days.includes(date.getDay()) && day % 7 !== 0) {
        state.results[habit.id][toKey(date)] = true;
      }
    }

    added++;
  }

  if (added > 0) {
    save(state);
  }

  return added;
}


export function createHabit(name, type, days) {
  const errors = validateHabit(name, type, days);
  if (hasErrors(errors)) {
    return { ok: false, errors: errors };
  }

  const habit = {
    id: "h_" + Date.now(),
    name: name.trim(),
    type: type,
    days: days,
    color: nextHabitColor(),
    createdAt: toKey(today())
  };

  state.habits.push(habit);
  state.results[habit.id] = {};
  save(state);

  return { ok: true, habit: habit };
}


export function updateHabit(id, name, type, days) {
  const habit = getHabit(id);
  if (habit === null) {
    return { ok: false, errors: { general: "Įprotis nerastas." } };
  }

  const errors = validateHabit(name, type, days);
  if (hasErrors(errors)) {
    return { ok: false, errors: errors };
  }

  habit.name = name.trim();
  habit.type = type;
  habit.days = days;

  save(state);

  return { ok: true, habit: habit };
}



export function deleteHabit(id) {
  const remaining = [];
  for (let i = 0; i < state.habits.length; i++) {
    if (state.habits[i].id !== id) {
      remaining.push(state.habits[i]);
    }
  }
  state.habits = remaining;

  delete state.results[id];
  save(state);
}

export function isMarked(habitId, dateKey) {
  const habitResults = state.results[habitId];
  if (!habitResults) {
    return false;
  }
  return habitResults[dateKey] === true;
}

export function toggleResult(habitId, dateKey) {
  if (getHabit(habitId) === null) {
    return;
  }

  if (dateKey > toKey(today())) {
    return;
  }

  if (!state.results[habitId]) {
    state.results[habitId] = {};
  }

  if (state.results[habitId][dateKey]) {
    delete state.results[habitId][dateKey];
  } else {
    state.results[habitId][dateKey] = true;
  }

  save(state);
}
