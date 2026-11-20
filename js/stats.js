import { addDays, fromKey, toKey, today } from "./dates.js";
import { getHabits, isMarked } from "./model.js";

// Suskaiciuojame suplanuotas dienas pasirinktame laikotarpyje.
export function scheduledDays(habit, start, end) {
  // Dienos iki iprocio sukurimo ir po siandienos i statistika nepatenka.
  const startKey = toKey(start);
  const endKey = toKey(end);
  const todayKey = toKey(today());
  const firstKey = startKey > habit.createdAt ? startKey : habit.createdAt;
  const lastKey = endKey < todayKey ? endKey : todayKey;

  if (firstKey > lastKey) {
    return 0;
  }

  let count = 0;
  for (let date = fromKey(firstKey); toKey(date) <= lastKey; date = addDays(date, 1)) {
    if (habit.days.includes(date.getDay())) {
      count++;
    }
  }

  return count;
}

// Suskaiciuojame, kiek suplanuotu dienu buvo pazymeta.
export function countMarkedDays(habit, start, end) {
  // Naudojame tas pacias laikotarpio ribas kaip suplanuotu dienu skaiciavime.
  const startKey = toKey(start);
  const endKey = toKey(end);
  const todayKey = toKey(today());
  const firstKey = startKey > habit.createdAt ? startKey : habit.createdAt;
  const lastKey = endKey < todayKey ? endKey : todayKey;

  let marked = 0;
  for (let date = fromKey(firstKey); toKey(date) <= lastKey; date = addDays(date, 1)) {
    if (habit.days.includes(date.getDay()) && isMarked(habit.id, toKey(date))) {
      marked++;
    }
  }

  return marked;
}

// Vieno iprocio sekme yra pazymetu ir suplanuotu dienu santykis.
export function successRate(habit, start, end) {
  const total = scheduledDays(habit, start, end);
  if (total === 0) {
    return "–";
  }

  return countMarkedDays(habit, start, end) / total * 100;
}

// Bendra pazanga skaiciuojama is visu iprociu dienu sumos.
export function overallRate(start, end) {
  const habits = getHabits();
  let total = 0;
  let marked = 0;

  for (const habit of habits) {
    total += scheduledDays(habit, start, end);
    marked += countMarkedDays(habit, start, end);
  }

  if (total === 0) {
    return "–";
  }

  return marked / total * 100;
}

// Nustatome langelio busena pagal data, tvarkarasti ir pazymeta rezultata.
export function dayState(habit, date) {
  const dateKey = toKey(date);
  if (dateKey > toKey(today())) {
    return "future";
  }
  if (dateKey < habit.createdAt || !habit.days.includes(date.getDay())) {
    return "not-scheduled";
  }
  if (isMarked(habit.id, dateKey)) {
    return "done";
  }
  return "missed";
}

// Skaiciuojame is eiles pazymetas suplanuotas dienas atgal nuo siandienos.
export function currentStreak(habit) {
  const todayKey = toKey(today());
  let streak = 0;

  for (let date = today(); toKey(date) >= habit.createdAt; date = addDays(date, -1)) {
    // Nesuplanuotos dienos sekos nenutraukia.
    if (!habit.days.includes(date.getDay())) {
      continue;
    }

    const dateKey = toKey(date);
    if (isMarked(habit.id, dateKey)) {
      streak++;
    } else if (dateKey !== todayKey) {
      // Siandien dar galima pazymeti; ankstesne nezymeta diena seka nutraukia.
      break;
    }
  }

  return streak;
}
