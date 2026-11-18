
const STORAGE_KEY = "habitTracker";

export function emptyState() {
  return {
    habits: [],
    results: {}
  };
}

export function load() {
  const text = localStorage.getItem(STORAGE_KEY);

  if (text === null) {
    return emptyState();
  }

  try {
    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.warn("Nepavyko nuskaityti duomenų, pradedama iš naujo.");
    return emptyState();
  }
}

export function save(state) {
  const text = JSON.stringify(state);
  localStorage.setItem(STORAGE_KEY, text);
}