import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MALE_LEFT_HOOK_FILES, maleLeftHookStage } from '../src/male-left-hook.js';

test('male left-hook stages progress with health loss and clamp at near KO', () => {
  for (let stage = 1; stage <= 10; stage++) {
    assert.equal(maleLeftHookStage('male', 'hook', 'left', 100 - stage * 10 + 5), stage);
  }
  assert.equal(maleLeftHookStage('male', 'hook', 'left', 100), 1);
  assert.equal(maleLeftHookStage('male', 'hook', 'left', 90), 1);
  assert.equal(maleLeftHookStage('male', 'hook', 'left', 89), 2);
  assert.equal(maleLeftHookStage('male', 'hook', 'left', 0), 10);
});

test('pack is never mapped to other hands, punch types, or the female opponent', () => {
  for (const opponent of ['male', 'female']) for (const side of ['left', 'right']) {
    for (const type of ['straight', 'hook', 'uppercut']) {
      if (opponent === 'male' && side === 'left' && type === 'hook') continue;
      assert.equal(maleLeftHookStage(opponent, type, side, 5), null);
    }
  }
});

test('all ten original PNG filenames resolve to images with an alpha channel', () => {
  assert.equal(MALE_LEFT_HOOK_FILES.length, 10);
  MALE_LEFT_HOOK_FILES.forEach((file, index) => {
    assert.ok(file.endsWith(`male_hook_left_stage_${String(index + 1).padStart(2, '0')}.png`));
    const png = readFileSync(new URL(`../public/${file}`, import.meta.url));
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png.readUInt32BE(16), 1086);
    assert.equal(png.readUInt32BE(20), 1448);
    assert.equal(png[25], 6); // Original RGBA PNG; no background flattened in.
  });
});
