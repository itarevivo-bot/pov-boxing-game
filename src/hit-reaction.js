import { HOOK_RECOVERY_MS, hookReactionKeyframes } from './hook-reaction-animation.js';
import { MALE_HOOK_STAGES, HOOK_MAPPING, createInjuryState, advanceInjury } from './injury-state.js';
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
  let opponent = null;
  let masterSource = null;
  let injury = createInjuryState();
  const guard = fighter.querySelector('.opponent-guard');
  const hookFrames = { left: [], right: [] };
  const idleImages = { left: [], right: [] };
  // Keep one stable guard beneath localized, eye-aligned injury patches.
  // Impact direction never determines which screen cheek retains injury.
  const ns = 'http://www.w3.org/2000/svg';
  const definitions = fighter.querySelector('defs');
  const blur = document.createElementNS(ns, 'filter');
  blur.id = 'injury-cheek-feather';
  blur.innerHTML = '<feGaussianBlur stdDeviation="8"/>';
  definitions.append(blur);
  const cheekImages = {};
  for (const side of ['left', 'right']) {
    const mask = document.createElementNS(ns, 'mask');
    mask.id = `injury-${side}-cheek`;
    mask.setAttribute('maskUnits', 'userSpaceOnUse');
    mask.setAttribute('x', '0'); mask.setAttribute('y', '0');
    mask.setAttribute('width', '1086'); mask.setAttribute('height', '1448');
    const path = HOOK_MAPPING[side].screenCheek === 'left'
      ? 'M357 247Q388 218 439 237Q461 273 451 336Q425 371 389 348Q357 316 357 247Z'
      : 'M491 233Q547 214 585 243Q607 286 587 329Q554 360 514 339Q492 297 491 233Z';
    mask.innerHTML = `<path d="${path}" fill="white" filter="url(#injury-cheek-feather)"/>`;
    definitions.append(mask);
    const image = document.createElementNS(ns, 'image');
    image.dataset.injuryCheek = side;
    image.setAttribute('mask', `url(#injury-${side}-cheek)`);
    image.setAttribute('preserveAspectRatio', 'xMidYMin meet');
    image.style.display = 'none';
    fighter.querySelector('.opponent-head').insertBefore(image, fighter.querySelector('.reaction-eyes'));
    cheekImages[side] = image;
  }
  function applyBothCheeks() {
    fighter.dataset.leftDamage = injury.LeftDamage;
    fighter.dataset.rightDamage = injury.RightDamage;
    for (const side of ['left', 'right']) {
      const level = side === 'left' ? injury.LeftDamage : injury.RightDamage;
      const image = cheekImages[side];
      // Each counter controls only its own eye/cheek; neither replaces the face.
      image.style.display = level > 0 ? '' : 'none';
      if (!level) continue;
      const asset = MALE_HOOK_STAGES[side][level - 1];
      image.setAttribute('href', `${import.meta.env.BASE_URL}${asset.idle}`);
      image.dataset.stage = level;
      image.dataset.damageSide = HOOK_MAPPING[side].damageSide;
      image.dataset.screenCheek = HOOK_MAPPING[side].screenCheek;
      for (const [name, value] of Object.entries(asset.faceLayout)) image.setAttribute(name, value);
    }
  }
  function applyIdle(source, layout = { x: 0, y: 0, width: 1086, height: 1448 }) {
    guard.querySelectorAll('image:not([data-injury-cheek])').forEach(image => {
      image.setAttribute('href', source);
      for (const [name, value] of Object.entries(layout)) image.setAttribute(name, value);
    });
    fighter.dataset.injuryStage = String(injury.stage);
    fighter.dataset.injurySide = injury.side ?? '';
    applyBothCheeks();
  }
  function preloadMaleHooks() {
    for (const side of ['left', 'right']) preloadHook(side);
  }
  function preloadHook(side) {
    if (hookFrames[side].length) return;
    const pack = fighter.querySelector(`.male-${side}-hook-frames`);
    hookFrames[side] = MALE_HOOK_STAGES[side].map(({ reaction, idle }, index) => {
      // Warm the paired neutral artwork before it is needed for recovery.
      const neutral = document.createElement('img');
      neutral.src = `${import.meta.env.BASE_URL}${idle}`;
      idleImages[side].push(neutral);
      const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      image.setAttribute('width', '1086');
      image.setAttribute('height', '1448');
      image.setAttribute('preserveAspectRatio', 'xMidYMin meet');
      image.setAttribute('href', `${import.meta.env.BASE_URL}${reaction}`);
      image.dataset.stage = index + 1;
      pack.append(image);
      return image;
    });
  }
  function stop() { running.forEach(animation => animation.cancel()); running = []; }
  function resetInjury() {
    stop();
    injury = createInjuryState();
    if (masterSource) applyIdle(masterSource);
  }
  function setOpponent(source, selectedOpponent) {
    stop();
    opponent = selectedOpponent;
    masterSource = source;
    injury = createInjuryState();
    if (opponent === 'male') preloadMaleHooks();
    const face = faces[opponent];
    applyIdle(source);
    fighter.querySelectorAll('[data-head-mask]').forEach(path => path.setAttribute('d', face.head));
    fighter.querySelector('.reaction-eyes').innerHTML = `<path d="${face.eyes}" fill="${face.skin}"/><path d="${face.lashes}" fill="none" stroke="#58372b" stroke-width="2" stroke-linecap="round"/>`;
    fighter.querySelector('.reaction-tension').innerHTML = `<path d="${face.tension}" fill="none" stroke="#5a3029" stroke-width="2.5" stroke-linecap="round"/>`;
  }
  function play(type, side, health = 100) {
    stop();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const poses = reactionPoses(type, side);
    const options = { duration: reduced ? 160 : RECOVERY_MS, easing: 'linear' };
    const nextInjury = advanceInjury(injury, opponent, type, side, health);
    if (nextInjury !== injury) {
      injury = nextInjury;
      const stage = injury.stage;
      // Recovery, counters, and non-hook hits all reuse this damaged guard.
      // Recover onto a single neutral guard plus both independently retained injuries.
      applyIdle(masterSource);
      // Artwork supplies the received-head direction; subtle motion adds snap,
      // peak recoil and recovery without flipping either directional asset set.
      const frames = hookReactionKeyframes(side, HOOK_MAPPING[side].reactionDirection);
      const hookOptions = { duration: HOOK_RECOVERY_MS, easing: 'linear' };
      running.push(guard.animate(frames.guard, hookOptions));
      const frame = hookFrames[side][stage - 1];
      frame.style.transformBox = 'fill-box';
      frame.style.transformOrigin = '50% 65%';
      running.push(frame.animate(frames.reaction, hookOptions));
      return;
    }
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
  return { setOpponent, play, stop, resetInjury, preloadMaleHooks };
}
