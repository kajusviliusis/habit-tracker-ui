
import { load, save } from "./storage.js";
import { toKey, today } from "./dates.js";

const NAME_MAX = 50;

let state = load();

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