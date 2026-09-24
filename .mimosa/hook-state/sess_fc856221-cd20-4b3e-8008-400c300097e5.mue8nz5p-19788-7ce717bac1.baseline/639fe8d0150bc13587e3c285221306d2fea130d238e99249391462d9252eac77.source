export const shuffleItems = <T extends { id: string }>(items: T[]): T[] => {
  if (items.length < 2) return items;

  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }

  const orderChanged = next.some((item, index) => item.id !== items[index]?.id);
  if (orderChanged) return next;

  return [next[1], next[0], ...next.slice(2)];
};

const stableHash = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

export const getDeterministicShuffledItems = <T extends { id: string }>(items: T[], seed: string): T[] => {
  if (items.length < 2) return items;

  return [...items].sort((a, b) => {
    const aHash = stableHash(`${seed}:${a.id}`);
    const bHash = stableHash(`${seed}:${b.id}`);
    if (aHash === bHash) return a.id.localeCompare(b.id);
    return aHash - bHash;
  });
};
