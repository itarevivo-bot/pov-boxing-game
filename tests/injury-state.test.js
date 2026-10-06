import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MALE_HOOK_STAGES, createInjuryState, advanceInjury } from '../src/injury-state.js';

test('hook injury remains at the highest reached grade and survives other hits', () => {
  let state = advanceInjury(createInjuryState(), 'male', 'hook', 'right', 65);
  assert.deepEqual(state, { stage: 4, side: 'right' });
  assert.equal(advanceInjury(state, 'male', 'straight', 'left', 63), state);
  assert.equal(advanceInjury(state, 'male', 'uppercut', 'right', 60), state);
  state = advanceInjury(state, 'male', 'hook', 'left', 95);
  assert.deepEqual(state, { stage: 4, side: 'left' });
  state = advanceInjury(state, 'male', 'hook', 'right', 15);
  assert.equal(state.stage, 9);
  assert.equal(advanceInjury(state, 'male', 'hook', 'left', 5).stage, 10);
});

test('fresh fights clear injury and the female opponent does not use male assets', () => {
  const state = createInjuryState();
  assert.deepEqual(state, { stage: 0, side: null });
  assert.equal(advanceInjury(state, 'female', 'hook', 'right', 1), state);
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
