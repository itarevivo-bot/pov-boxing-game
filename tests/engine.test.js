import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFight, punch, counter, DAMAGE } from '../src/engine.js';
test('punch damage stays low with modest differences', () => {
  assert.deepEqual(DAMAGE, { hook: 3, straight: 2, uppercut: 3 });
  for (const type of Object.keys(DAMAGE)) {
    const fight = createFight();
    for (let i = 0; i < 20; i++) punch(fight, type);
    assert.ok(fight.opponent >= 40);
    assert.equal(fight.ended, false);
  }
});
test('each punch type takes many hits to produce a knockout', () => {
  for (const type of Object.keys(DAMAGE)) {
    const fight = createFight(), hits = Math.ceil(100 / DAMAGE[type]);
    for (let i = 0; i < hits - 1; i++) punch(fight, type);
    assert.ok(fight.opponent > 0);
    assert.equal(fight.ended, false);
    punch(fight, type);
    assert.equal(fight.opponent, 0);
    assert.equal(fight.ended, true);
    const before = { ...fight };
    counter(fight); punch(fight, 'hook');
    assert.deepEqual(fight, before);
  }
});
test('counters remove small amounts and end combat only at zero health', () => {
  const fight = createFight(); counter(fight);
  assert.equal(fight.player, 98);
  for (let i = 0; i < 48; i++) counter(fight);
  assert.equal(fight.player, 2); assert.equal(fight.ended, false);
  counter(fight);
  assert.equal(fight.player, 0); assert.equal(fight.ended, true);
});
test('fight state contains no time limit and resets both health values', () => {
  const fight = createFight();
  assert.deepEqual(fight, { player: 100, opponent: 100, punches: 0, ended: false });
  punch(fight, 'hook'); counter(fight);
  assert.deepEqual(createFight(), { player: 100, opponent: 100, punches: 0, ended: false });
});
