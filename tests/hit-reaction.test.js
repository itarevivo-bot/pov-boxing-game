import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reactionPoses, RECOVERY_MS } from '../src/hit-reaction.js';
test('hit recovery is short and returns to a neutral pose', () => {
  assert.ok(RECOVERY_MS >= 200 && RECOVERY_MS <= 400);
  for (const side of ['left','right']) for (const type of ['straight','hook','uppercut']) {
    const pose = reactionPoses(type,side);
    assert.notEqual(pose.head,pose.neutral);
    assert.notEqual(pose.body,pose.neutral);
    assert.equal(pose.neutral,'translate(0px, 0px) rotate(0deg) scale(1, 1)');
  }
});
test('hook reactions mirror head and torso force', () => {
  const left = reactionPoses('hook','left'), right = reactionPoses('hook','right');
  assert.ok(left.head.includes('translate(22px') && right.head.includes('translate(-22px'));
  assert.ok(left.head.includes('rotate(5.5deg)') && right.head.includes('rotate(-5.5deg)'));
  assert.ok(left.body.includes('translate(8px') && right.body.includes('translate(-8px'));
});
test('uppercuts lift the chin and torso while straights recoil backward', () => {
  for(const side of ['left','right']) {
    const uppercut= reactionPoses('uppercut',side), straight=reactionPoses('straight',side);
    assert.ok(uppercut.head.includes('-24px') && uppercut.body.includes('-11px'));
    assert.ok(straight.head.includes('scale(.965, .98)') && straight.body.includes('scale(.994, .988)'));
  }
});
