// Translation is applied in screen space before mirroring the right glove.
// This keeps left/right travel independent of the glove artwork's orientation.
export function createPunchKeyframes({ side, type, glove, target }) {
  const direction = side === 'left' ? 1 : -1;
  const guardAngle = direction * 16;
  const reach = glove.height * .72;
  const centerX = glove.left + glove.width / 2;
  const originY = glove.top + glove.height;
  const radians = angle => angle * Math.PI / 180;
  const guard = {
    x: centerX + reach * Math.sin(radians(guardAngle)),
    y: originY - reach * Math.cos(radians(guardAngle)),
  };
  function pose(point, angle, scale, offset) {
    const x = point.x - centerX - reach * scale * Math.sin(radians(angle));
    const y = point.y - originY + reach * scale * Math.cos(radians(angle));
    return {
      offset,
      transform: `translate(${x.toFixed(6)}px, ${y.toFixed(6)}px) rotate(${angle}deg) scaleX(${direction}) scale(${scale})`,
    };
  }
  const rest = pose(guard, guardAngle, 1, 0);
  // Contact remains at 130ms in the existing 320ms animation.
  const contact = 130 / 320;
  let travel;
  if (type === 'hook') {
    const end = { x: target.x + direction * target.width * .14, y: target.faceY };
    travel = [
      pose({ x: guard.x + (end.x - guard.x) * .25, y: end.y + glove.height * .06 }, direction * -25, .94, .17),
      pose(end, direction * -65, .88, contact),
    ];
  } else if (type === 'uppercut') {
    const low = { x: guard.x, y: guard.y + glove.height * .18 };
    const end = { x: target.x, y: target.chinY };
    travel = [
      pose(low, direction * 25, 1, .12),
      pose({ x: low.x + (end.x - low.x) * .35, y: low.y + (end.y - low.y) * .4 }, direction * 12, .9, .25),
      pose(end, 0, .78, contact),
    ];
  } else {
    const end = { x: target.x, y: target.faceY };
    travel = [
      pose({ x: guard.x + (end.x - guard.x) * .45, y: guard.y + (end.y - guard.y) * .45 }, direction * 8, .87, .18),
      pose(end, 0, .72, contact),
    ];
  }
  return [rest, ...travel, { ...rest, offset: 1 }];
}
