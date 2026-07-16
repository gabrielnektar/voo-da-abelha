// Bumping this key resets everyone's record back to zero on their next
// visit — there's no server-side leaderboard to reset directly, since the
// record lives only in each player's own browser localStorage. Old values
// under the previous key are simply abandoned, not deleted.
const STORAGE_KEY = "voo-da-abelha:recorde:v2";

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
