// Player RIGHT HOOK -> male opponent's uploaded LEFTWARD impact pose.
export const MALE_RIGHT_HOOK_FILES = Array.from({ length: 10 }, (_, index) =>
  `characters/reactions/male-right-hook/male_right_hook_stage_${String(index + 1).padStart(2, '0')}.png`);

export function maleRightHookStage(opponent, type, side, health) {
  if (opponent !== 'male' || type !== 'hook' || side !== 'right') return null;
  return Math.min(10, Math.max(1, Math.ceil((100 - health) / 10)));
}
