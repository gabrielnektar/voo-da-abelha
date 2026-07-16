const STORAGE_KEY = "voo-da-abelha:recorde";

export function getRecord() {
  const stored = Number(localStorage.getItem(STORAGE_KEY));
  return Number.isFinite(stored) ? stored : 0;
}

export function updateRecord(score) {
  const current = getRecord();

  if (score <= current) {
    return current;
  }

  localStorage.setItem(STORAGE_KEY, String(score));
  return score;
}
