import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPunchKeyframes } from '../src/punch-animation.js';
function knuckle(frame, glove) {
  const [x,y,angle,mirror,scale] = [...frame.transform.matchAll(/-?\d+(?:\.\d+)?/g)].map(m => Number(m[0]));
  const reach = glove.height * .72 * scale, radians = angle * Math.PI / 180;
  return { x: glove.left + glove.width / 2 + x + reach * Math.sin(radians), y: glove.top + glove.height + y - reach * Math.cos(radians), mirror };
}
for (const size of [{w:844,h:390,gw:160,gh:196,gap:105}, {w:1440,h:900,gw:274,gh:336,gap:148}, {w:390,h:844,gw:155,gh:190,gap:57}]) {
  for (const side of ['left','right']) {
    const direction = side === 'left' ? 1 : -1;
    const glove = { left: size.w/2 - direction*size.gap - size.gw/2, top: size.h*.65, width:size.gw, height:size.gh };
    const target = { x:size.w/2, faceY:size.h*.35, chinY:size.h*.44, width:size.w*.3 };
    for (const type of ['straight','hook','uppercut']) test(`${side} ${type} uses correct screen-space path at ${size.w}px`, () => {
      const frames=createPunchKeyframes({side,type,glove,target});
      const points=frames.map(f=>knuckle(f,glove));
      assert.deepEqual(points.at(-1),points[0], 'returns to guard');
      assert.equal(points[0].mirror,direction);
      const contact=points.at(-2);
      assert.ok(direction*(contact.x-points[0].x)>0,'travels inward');
      if(type==='hook') {
        assert.ok(direction*(contact.x-target.x)>0,'sweeps across opponent');
        assert.ok(direction*(points[1].x-points[0].x)>0,'never winds outward');
        assert.ok(Math.abs(points[1].y-contact.y)<glove.height*.1,'horizontal strike arc');
      } else if(type==='straight') {
        assert.ok(Math.abs(contact.x-target.x)<.001);
        assert.ok(Math.abs(contact.y-target.faceY)<.001);
        assert.ok(Math.abs((points[1].x-points[0].x)/(contact.x-points[0].x)-.45)<.001);
        assert.ok(Math.abs((points[1].y-points[0].y)/(contact.y-points[0].y)-.45)<.001);
      } else {
        assert.ok(points[1].y>points[0].y,'starts with low dip');
        assert.ok(points[2].y<points[1].y && contact.y<points[2].y,'rises from below');
        assert.ok(Math.abs(contact.y-target.chinY)<.001);
      }
    });
  }
}
