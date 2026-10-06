// These files belong exclusively to the male boxer receiving a player LEFT HOOK.
export const MALE_LEFT_HOOK_FILES = Array.from({ length: 10 }, (_, index) =>
  `characters/reactions/male-left-hook/male_hook_left_stage_${String(index + 1).padStart(2, '0')}.png`);

export function maleLeftHookStage(opponent, type, side, health) {
  if (opponent !== 'male' || type !== 'hook' || side !== 'left') return null;
  return Math.min(10, Math.max(1, Math.ceil((100 - health) / 10)));
}
