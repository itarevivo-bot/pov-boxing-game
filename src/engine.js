export const DAMAGE = { hook: 3, straight: 2, uppercut: 3 };
export function createFight() { return { player: 100, opponent: 100, punches: 0, ended: false }; }
export function punch(fight, type) {
  if (fight.ended || !Object.hasOwn(DAMAGE, type)) return 0;
  const damage = Math.min(fight.opponent, DAMAGE[type]);
  fight.opponent -= damage;
  fight.punches++;
  if (!fight.opponent) fight.ended = true;
  return damage;
}
export function counter(fight) {
  if (fight.ended) return;
  fight.player = Math.max(0, fight.player - 2);
  if (!fight.player) fight.ended = true;
}
