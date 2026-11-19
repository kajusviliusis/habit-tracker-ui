import { addDays, fromKey, toKey, today } from "./dates.js";

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
