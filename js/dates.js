// Paverciame vietine kalendorine data i rakta YYYY-MM-DD.
export function toKey(date) {
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  // UTC konvertavimas gali pakeisti diena, todel naudojame vietines datos dalis.
  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }

  return year + "-" + month + "-" + day;
}

// Is datos rakto sukuriame vietines laiko juostos Date objekta.
export function fromKey(key) {
  const parts = key.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  return new Date(year, month, day);
}

// Graziname siandienos data be valandu, kad lygintume tik dienas.
export function today() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// Pridedame dienas, leisdami Date objektui tvarkyti menesiu ribas.
export function addDays(date, n) {
  // setDate taip pat teisingai pereina per vasario 29 diena.
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() + n);
  return result;
}

// Randame pirmadieni, nuo kurio prasideda pasirinktos dienos savaite.
export function startOfWeek(date) {
  // JavaScript sekmadieni numeruoja 0, todel jam reikia sesiu dienu poslinkio.
  const dayOfWeek = date.getDay();
  let daysSinceMonday;

  if (dayOfWeek === 0) {
    daysSinceMonday = 6;
  } else {
    daysSinceMonday = dayOfWeek - 1;
  }

  return addDays(date, -daysSinceMonday);
}

// Randame pirma menesio diena.
export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// Randame pirma metu diena.
export function startOfYear(date) {
  return new Date(date.getFullYear(), 0, 1);
}

export const WEEKDAYS_SHORT = ["S", "Pr", "An", "Tr", "Kt", "Pn", "Š"];
export const WEEKDAYS_LONG = [
  "Sekmadienis", "Pirmadienis", "Antradienis", "Trečiadienis",
  "Ketvirtadienis", "Penktadienis", "Šeštadienis"
];

export const MONTHS = [
  "sausis", "vasaris", "kovas", "balandis", "gegužė", "birželis",
  "liepa", "rugpjūtis", "rugsėjis", "spalis", "lapkritis", "gruodis"
];

export const MONTHS_OF = [
  "sausio", "vasario", "kovo", "balandžio", "gegužės", "birželio",
  "liepos", "rugpjūčio", "rugsėjo", "spalio", "lapkričio", "gruodžio"
];

// Sudarome ilga lietuviska datos uzrasa dienos sarasui.
export function formatLong(date) {
  return WEEKDAYS_LONG[date.getDay()] + ", " + MONTHS_OF[date.getMonth()] + " " + date.getDate() + " d.";
}
