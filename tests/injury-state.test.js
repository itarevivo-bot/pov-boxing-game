import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MALE_HOOK_STAGES, createInjuryState, advanceInjury } from '../src/injury-state.js';

test('left and right hook counts accumulate independently, capped at ten', () => {
  let state = createInjuryState();
  state = advanceInjury(state, 'male', 'hook', 'left');
  state = advanceInjury(state, 'male', 'hook', 'left');
  state = advanceInjury(state, 'male', 'hook', 'right');
  assert.equal(state.LeftDamage, 2);
  assert.equal(state.RightDamage, 1);
  for (let i = 0; i < 20; i++) state = advanceInjury(state, 'male', 'hook', 'right');
  assert.equal(state.LeftDamage, 2);
  assert.equal(state.RightDamage, 10);
  assert.equal(advanceInjury(state, 'male', 'straight', 'left'), state);
  assert.equal(advanceInjury(state, 'male', 'uppercut', 'right'), state);
  assert.equal(advanceInjury(state, 'female', 'hook', 'left'), state);
  assert.equal(createInjuryState().LeftDamage, 0);
  assert.equal(createInjuryState().RightDamage, 0);
});

test('both hook packs have ten explicit reaction/idle pairs with PNG transparency', () => {
  for (const side of ['left', 'right']) {
    assert.equal(MALE_HOOK_STAGES[side].length, 10);
    for (const { stage, reaction, idle } of MALE_HOOK_STAGES[side]) {
      const digits = String(stage).padStart(2, '0');
      assert.ok(reaction.endsWith(`stage_${digits}.png`));
      assert.ok(idle.endsWith(`stage_${digits}.png`));
      for (const file of [reaction, idle]) {
        const png = readFileSync(new URL(`../public/${file}`, import.meta.url));
        assert.equal(png.subarray(1, 4).toString(), 'PNG');
        assert.equal(png[25], 6);
      }
    }
  }
});
