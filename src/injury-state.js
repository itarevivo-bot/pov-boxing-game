import { MALE_LEFT_HOOK_FILES, maleLeftHookStage } from './male-left-hook.js';
import { MALE_RIGHT_HOOK_FILES, maleRightHookStage } from './male-right-hook.js';

// Each received-hook reaction has its own neutral pose at the same injury grade.
export const MALE_HOOK_STAGES = Object.fromEntries(['left', 'right'].map(side => [side,
  (side === 'left' ? MALE_LEFT_HOOK_FILES : MALE_RIGHT_HOOK_FILES).map((reaction, index) => ({
    stage: index + 1,
    reaction,
    idle: `characters/reactions/male-${side}-hook/idle/male_${side}_hook_idle_stage_${String(index + 1).padStart(2, '0')}.png`,
  })),
]));

export function createInjuryState() { return { stage: 0, side: null }; }

export function advanceInjury(state, opponent, type, side, health) {
  const receivedStage = maleLeftHookStage(opponent, type, side, health)
    ?? maleRightHookStage(opponent, type, side, health);
  if (receivedStage === null) return state;
  return { stage: Math.max(state.stage, receivedStage), side };
}
