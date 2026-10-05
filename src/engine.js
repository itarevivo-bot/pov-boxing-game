export const DAMAGE = { hook: 12, straight: 8, uppercut: 15 };
export function createFight() { return { player: 100, opponent: 100, seconds: 120, punches: 0, ended: false }; }
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
  fight.player = Math.max(0, fight.player - 7);
  if (!fight.player) fight.ended = true;
}
export function tick(fight) {
  if (fight.ended) return;
  fight.seconds = Math.max(0, fight.seconds - 1);
  if (!fight.seconds) fight.ended = true;
}
