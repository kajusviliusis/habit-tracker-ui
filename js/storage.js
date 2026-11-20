
const STORAGE_KEY = "habitTracker";

// Nauja programa pradeda nuo tuscio iprociu ir rezultatu rinkinio.
export function emptyState() {
  return {
    habits: [],
    results: {}
  };
}

// Nuskaitome anksciau issaugota busena is narsykles.
export function load() {
  // Esama rakta paliekame, kad seniau issaugoti iprociai isliktu.
  const text = localStorage.getItem(STORAGE_KEY);

  if (text === null) {
    return emptyState();
  }

  try {
    const data = JSON.parse(text);
    return data;
  } catch (error) {
    // Sugadinti duomenys neturi sustabdyti programos paleidimo.
    console.warn("Nepavyko nuskaityti duomenų, pradedama iš naujo.");
    return emptyState();
  }
}

// Po kiekvieno pakeitimo irasome visa busena tuo paciu raktu.
export function save(state) {
  const text = JSON.stringify(state);
  localStorage.setItem(STORAGE_KEY, text);
}
