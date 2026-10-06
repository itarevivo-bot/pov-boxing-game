export const RECOVERY_MS = 320;
const faces = {
  male: {
    head: 'M270 0H690V200L640 255L621 345Q594 428 507 445Q445 435 403 388L369 325L342 265L309 200Z',
    skin: '#b78269',
    eyes: 'M397 264Q420 254 446 261L443 272Q419 278 398 271Z M501 253Q523 242 548 249L544 261Q522 269 504 261Z',
    lashes: 'M399 269Q420 275 442 266M505 258Q524 264 544 254',
    tension: 'M391 287Q396 297 403 300M551 276Q552 288 545 295M449 339Q446 350 451 355M508 332Q518 342 517 350M461 367Q481 373 504 361',
  },
  female: {
    head: 'M265 0H740V235L680 315L650 376Q610 451 534 460Q465 443 420 388L383 320L350 260L307 220Z',
    skin: '#ca947b',
    eyes: 'M431 274Q455 262 478 267L477 278Q455 290 433 282Z M535 251Q557 242 580 247L577 259Q557 268 538 262Z',
    lashes: 'M435 279Q455 285 475 274M539 257Q558 262 577 252',
    tension: 'M425 298Q427 307 438 312M586 279Q588 293 579 301M474 343Q469 351 475 361M539 335Q550 347 547 357M487 373Q515 382 543 364',
  },
};
export function reactionPoses(type, side) {
  const direction = side === 'left' ? 1 : -1;
  const neutral = 'translate(0px, 0px) rotate(0deg) scale(1, 1)';
  let head, body;
  if (type === 'hook') {
    head = `translate(${direction * 22}px, 3px) rotate(${direction * 5.5}deg) scale(1, 1)`;
    body = `translate(${direction * 8}px, 2px) rotate(${direction * 1.1}deg) scale(1, 1)`;
  } else if (type === 'uppercut') {
    head = `translate(0px, -24px) rotate(${-direction * .6}deg) scale(1, .985)`;
    body = `translate(0px, -11px) rotate(${-direction * .35}deg) scale(1, .995)`;
  } else {
    head = `translate(${direction * 2}px, 7px) rotate(${-direction * .7}deg) scale(.965, .98)`;
    body = `translate(0px, 8px) rotate(${-direction * .25}deg) scale(.994, .988)`;
  }
  return { neutral, head, body };
}
export function createHitReactions(fighter) {
  let running = [];
  function stop() { running.forEach(animation => animation.cancel()); running = []; }
  function setOpponent(source, opponent) {
    stop();
    const face = faces[opponent];
    fighter.querySelectorAll('image').forEach(image => image.setAttribute('href', source));
    fighter.querySelectorAll('[data-head-mask]').forEach(path => path.setAttribute('d', face.head));
    fighter.querySelector('.reaction-eyes').innerHTML = `<path d="${face.eyes}" fill="${face.skin}"/><path d="${face.lashes}" fill="none" stroke="#58372b" stroke-width="2" stroke-linecap="round"/>`;
    fighter.querySelector('.reaction-tension').innerHTML = `<path d="${face.tension}" fill="none" stroke="#5a3029" stroke-width="2.5" stroke-linecap="round"/>`;
  }
  function play(type, side) {
    stop();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const poses = reactionPoses(type, side);
    const options = { duration: reduced ? 160 : RECOVERY_MS, easing: 'linear' };
    // Fast absorption, brief settling, then a longer eased recovery to guard.
    const motion = impact => [
      { transform: poses.neutral, offset: 0, easing: 'cubic-bezier(.15,.65,.3,1)' },
      { transform: impact, offset: .2 },
      { transform: impact, offset: .32, easing: 'cubic-bezier(.2,.2,.2,1)' },
      { transform: poses.neutral, offset: 1 },
    ];
    running.push(fighter.querySelector('.opponent-head').animate(motion(poses.head), options));
    running.push(fighter.querySelector('.opponent-body').animate(motion(poses.body), options));
    running.push(fighter.querySelector('.reaction-eyes').animate([
      { opacity: 0 }, { opacity: .9, offset: .15 }, { opacity: .8, offset: .28 }, { opacity: 0, offset: .62 }, { opacity: 0 },
    ], options));
    running.push(fighter.querySelector('.reaction-tension').animate([
      { opacity: 0 }, { opacity: .24, offset: .2 }, { opacity: .16, offset: .45 }, { opacity: 0 },
    ], options));
  }
  return { setOpponent, play, stop };
}
