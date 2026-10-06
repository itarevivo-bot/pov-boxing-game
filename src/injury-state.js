import { IDLE_REGISTRATION } from './idle-registration.js';
import { MALE_LEFT_HOOK_FILES } from './male-left-hook.js';
import { MALE_RIGHT_HOOK_FILES } from './male-right-hook.js';

// Each received-hook reaction has its own neutral pose at the same injury grade.
export const MALE_HOOK_STAGES = Object.fromEntries(['left', 'right'].map(side => [side,
  (side === 'left' ? MALE_LEFT_HOOK_FILES : MALE_RIGHT_HOOK_FILES).map((reaction, index) => ({
    stage: index + 1,
    idleLayout: IDLE_REGISTRATION[side][index],
    reaction,
    idle: `characters/reactions/male-${side}-hook/idle/male_idle_${side}_damage_10_stage_${String(index + 1).padStart(2, '0')}.png`,
  })),
]));

export function createInjuryState() { return { LeftDamage: 0, RightDamage: 0, stage: 0, side: null }; }

export function advanceInjury(state, opponent, type, side) {
  if (opponent !== 'male' || type !== 'hook' || !['left', 'right'].includes(side)) return state;
  const key = side === 'left' ? 'LeftDamage' : 'RightDamage';
  const stage = Math.min(10, state[key] + 1);
  return { ...state, [key]: stage, stage, side };
}
