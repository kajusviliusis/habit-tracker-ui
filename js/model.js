
import { load, save } from "./storage.js";
import { toKey, today } from "./dates.js";

const NAME_MAX = 50;

export function validateHabit(name, type, days) {
  const errors = {};

  const trimmed = name.trim(); // "  Bėgioti  " -> "Bėgioti"

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