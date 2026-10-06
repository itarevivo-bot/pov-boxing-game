// Animation preparation is separate from asset selection. Never mirror artwork.
export const HOOK_RECOVERY_MS = 525;

export function hookReactionKeyframes(side, screenDirection = side === 'left' ? 'right' : 'left') {
  if (side !== 'left' && side !== 'right') throw new RangeError('Unknown hook hand');
  if (!['left', 'right'].includes(screenDirection)) throw new RangeError('Unknown reaction direction');
  const direction = screenDirection === 'right' ? 1 : -1;
  const pose = (x, y, angle) => `translate(${direction * x}px, ${y}px) rotate(${direction * angle}deg)`;
  return {
    guard: [
      { opacity: 1, offset: 0 },
      { opacity: 0, offset: .22 },
      { opacity: 0, offset: .58, easing: 'cubic-bezier(.2,.2,.2,1)' },
      { opacity: 1, offset: 1 },
    ],
    reaction: [
      { opacity: 0, transform: pose(0, 0, 0), offset: 0, easing: 'cubic-bezier(.15,.65,.3,1)' },
      { opacity: 1, transform: pose(10, 1, .7), offset: .22 },
      { opacity: 1, transform: pose(18, 2, 1.2), offset: .42 },
      { opacity: 1, transform: pose(15, 1, .9), offset: .58, easing: 'cubic-bezier(.2,.2,.2,1)' },
      { opacity: 0, transform: pose(0, 0, 0), offset: 1 },
    ],
  };
}
