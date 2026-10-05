import { test } from 'node:test';
import assert from 'node:assert/strict';
import {createFight, punch, counter, tick, DAMAGE} from '../src/engine.js';
test('all six punch choices damage the opponent', () => { for (const side of ['left','right']) for (const type of Object.keys(DAMAGE)) { const fight = createFight(); assert.equal(punch(fight,type), DAMAGE[type], `${side} ${type}`); assert.equal(fight.opponent, 100-DAMAGE[type]); assert.equal(fight.punches,1); } });
test('knockout clamps health and stops combat', () => { const fight = createFight(); for(let i=0;i<10;i++) punch(fight,'uppercut'); assert.equal(fight.opponent,0); assert.equal(fight.ended,true); const before = {...fight}; counter(fight); tick(fight); punch(fight,'hook'); assert.deepEqual(fight,before); });
test('counter attacks can end the fight', () => { const fight=createFight(); for(let i=0;i<15;i++) counter(fight); assert.equal(fight.player,0); assert.equal(fight.ended,true); });
test('round ends at zero and reset creates independent state', () => { const fight=createFight(); for(let i=0;i<130;i++) tick(fight); assert.equal(fight.seconds,0); assert.equal(fight.ended,true); assert.deepEqual(createFight(),{player:100,opponent:100,seconds:120,punches:0,ended:false}); });
