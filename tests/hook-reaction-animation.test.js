import test from 'node:test';
import assert from 'node:assert/strict';
import { HOOK_RECOVERY_MS, hookReactionKeyframes } from '../src/hook-reaction-animation.js';

test('hook phases occupy a readable 450–600ms window and recover to guard', () => {
  assert.ok(HOOK_RECOVERY_MS >= 450 && HOOK_RECOVERY_MS <= 600);
  for (const side of ['left', 'right']) {
    const { guard, reaction } = hookReactionKeyframes(side);
    assert.equal(guard[0].opacity, 1);
    assert.equal(guard.at(-1).opacity, 1);
    assert.equal(reaction[0].opacity, 0);
    assert.equal(reaction.at(-1).opacity, 0);
    assert.equal(reaction.at(-1).transform, reaction[0].transform);
    assert.deepEqual(reaction.map(frame => frame.offset), [0, .22, .42, .58, 1]);
  }
});

test('left and right hooks have mirrored inward impact and recoil directions', () => {
  const left = hookReactionKeyframes('left').reaction;
  const right = hookReactionKeyframes('right').reaction;
  const values = frame => frame.transform.match(/-?\d+(?:\.\d+)?/g).map(Number);
  for (let i = 0; i < left.length; i++) {
    const [lx, ly, lr] = values(left[i]);
    const [rx, ry, rr] = values(right[i]);
    assert.equal(lx + rx, 0);
    assert.equal(ly, ry);
    assert.equal(lr + rr, 0);
  }
  assert.ok(values(left[2])[0] > values(left[1])[0]);
  assert.ok(values(right[2])[0] < values(right[1])[0]);
  assert.throws(() => hookReactionKeyframes('invalid'), RangeError);
});
