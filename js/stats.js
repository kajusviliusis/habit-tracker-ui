import { addDays, fromKey, toKey, today } from "./dates.js";
import { isMarked } from "./model.js";

export function scheduledDays(habit, start, end) {
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

export function successRate(habit, start, end) {
  const total = scheduledDays(habit, start, end);
  if (total === 0) {
    return "–";
  }

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

  return marked / total * 100;
}
