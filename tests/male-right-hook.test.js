import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MALE_RIGHT_HOOK_FILES, maleRightHookStage } from '../src/male-right-hook.js';

test('male right-hook stages progress with health loss and clamp at near KO', () => {
  for (let stage = 1; stage <= 10; stage++) {
    assert.equal(maleRightHookStage('male', 'hook', 'right', 100 - stage * 10 + 5), stage);
  }
  assert.equal(maleRightHookStage('male', 'hook', 'right', 100), 1);
  assert.equal(maleRightHookStage('male', 'hook', 'right', 90), 1);
  assert.equal(maleRightHookStage('male', 'hook', 'right', 89), 2);
  assert.equal(maleRightHookStage('male', 'hook', 'right', 0), 10);
});

test('pack is never mapped to other hands, punch types, or the female opponent', () => {
  for (const opponent of ['male', 'female']) for (const side of ['left', 'right']) {
    for (const type of ['straight', 'hook', 'uppercut']) {
      if (opponent === 'male' && side === 'right' && type === 'hook') continue;
      assert.equal(maleRightHookStage(opponent, type, side, 5), null);
    }
  }
});

test('all ten original PNG filenames resolve to images with an alpha channel', () => {
  assert.equal(MALE_RIGHT_HOOK_FILES.length, 10);
  MALE_RIGHT_HOOK_FILES.forEach((file, index) => {
    assert.ok(file.endsWith(`male_right_hook_stage_${String(index + 1).padStart(2, '0')}.png`));
    const png = readFileSync(new URL(`../public/${file}`, import.meta.url));
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png.readUInt32BE(16), 1086);
    assert.equal(png.readUInt32BE(20), 1448);
    assert.equal(png[25], 6); // Original RGBA PNG; no background flattened in.
  });
});
