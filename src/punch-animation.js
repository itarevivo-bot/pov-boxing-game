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
    const setup = { x: guard.x + (end.x - guard.x) * .12, y: end.y + glove.height * .18 };
    const span = end.x - setup.x;
    const control1 = { x: setup.x + span * .1, y: end.y - glove.height * .25 };
    const control2 = { x: end.x - span * .3, y: end.y - glove.height * .2 };
    function arc(t) {
      const u = 1 - t;
      return {
        x: u ** 3 * setup.x + 3 * u ** 2 * t * control1.x + 3 * u * t ** 2 * control2.x + t ** 3 * end.x,
        y: u ** 3 * setup.y + 3 * u ** 2 * t * control1.y + 3 * u * t ** 2 * control2.y + t ** 3 * end.y,
      };
    }
    travel = [pose(setup, direction * 35, .97, .1)];
    for (const t of [.2, .4, .6, .8, 1]) {
      travel.push(pose(arc(t), direction * (35 + 45 * t), .97 - .09 * t, .1 + (contact - .1) * t));
    }
    travel.push(pose(arc(.65), direction * 60, .94, .62), pose(setup, direction * 35, .98, .8));
  } else if (type === 'uppercut') {
    const low = { x: guard.x, y: Math.max(guard.y, target.chinY + glove.height * .55) + glove.height * .22 };
    const end = { x: target.x, y: target.chinY };
    travel = [
      pose(low, direction * -50, 1, .12),
      pose({ x: low.x + (end.x - low.x) * .28, y: low.y + (end.y - low.y) * .4 }, direction * -35, .9, .25),
      pose(end, direction * -20, .78, contact),
      pose({ x: low.x + (end.x - low.x) * .55, y: low.y + (end.y - low.y) * .5 }, direction * -15, .88, .66),
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
