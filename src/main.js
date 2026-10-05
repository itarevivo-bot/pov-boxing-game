import { createFight, punch, counter, tick } from './engine.js';
const $ = (selector) => document.querySelector(selector);
let fight = createFight(), started = false, lastPunch = 0, audio, sound = false, generation = 0;
const animations = new Map();
let selectedOpponent = null, enteredRing = false;
const maleFighter = $('#fighter').innerHTML;
// Temporary variants use the same stance and proportions until final art is designed.
const femaleFighter = maleFighter.replace('<g stroke="#231c17"', '<path d="M236 51Q281 45 267 112L250 140L245 75Z" fill="#151816"/><g stroke="#231c17"') + '<path d="M158 207L173 215Q200 231 230 215L246 207L249 253L241 335Q203 348 161 335L151 253Z" fill="#222b23" stroke="#141c15" stroke-width="3"/><path d="M162 329Q203 342 241 329" fill="none" stroke="#b5f17d" stroke-width="6"/>';
function portrait(markup, variant) {
  return `<svg viewBox="70 20 260 340" aria-hidden="true">${markup.replaceAll('id="', `id="${variant}-`).replaceAll('url(#', `url(#${variant}-`)}</svg>`;
}
$('#male-portrait').innerHTML = portrait(maleFighter, 'male');
$('#female-portrait').innerHTML = portrait(femaleFighter, 'female');
const choices = [...document.querySelectorAll('[data-opponent]')];
choices.forEach(choice => choice.addEventListener('click', () => {
  selectedOpponent = choice.dataset.opponent;
  choices.forEach(item => {
    const selected = item === choice;
    item.setAttribute('aria-pressed', String(selected));
    item.querySelector('.choice-status').textContent = selected ? 'SELECTED' : 'SELECT OPPONENT';
  });
  $('#selection-message').textContent = `${selectedOpponent === 'male' ? 'Male' : 'Female'} boxer selected. Ready when you are.`;
  $('#start-fight').hidden = false;
}));
$('#start-fight').addEventListener('click', () => {
  if (!selectedOpponent || enteredRing) return;
  $('#fighter').innerHTML = selectedOpponent === 'female' ? femaleFighter : maleFighter;
  $('.opponent-health small').textContent = `${selectedOpponent.toUpperCase()} BOXER`;
  enteredRing = true;
  $('#selection').hidden = true;
  $('.game').hidden = false;
  reset();
  buttons[0].focus();
});
$('#right-glove').innerHTML = $('#left-glove').innerHTML.replaceAll('id="gl"', 'id="gr"').replaceAll('url(#gl)', 'url(#gr)');
const buttons = [...document.querySelectorAll('[data-punch]')];
function tone(frequency, duration = .09) {
  if (!sound) return;
  audio ??= new (window.AudioContext || window.webkitAudioContext)();
  audio.resume();
  const oscillator = audio.createOscillator(), gain = audio.createGain();
  oscillator.type = 'triangle'; oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(35, audio.currentTime + duration);
  gain.gain.setValueAtTime(.2, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + duration);
  oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + duration);
}
function animateClass(element, className) { element.classList.remove(className); void element.offsetWidth; element.classList.add(className); }
function render() {
  for (const target of ['player', 'opponent']) { $(`#${target}-bar`).style.width = `${fight[target]}%`; $(`#${target}-value`).textContent = fight[target]; }
  $('#timer').textContent = `${String(Math.floor(fight.seconds / 60)).padStart(2,'0')}:${String(fight.seconds % 60).padStart(2,'0')}`;
  if (fight.ended) {
    const win = fight.opponent === 0 || (fight.player > 0 && fight.player > fight.opponent);
    $('#result-title').textContent = fight.opponent === 0 ? 'KNOCKOUT.' : fight.player === 0 ? 'DOWN, BUT NOT OUT.' : win ? 'YOU WIN.' : fight.player === fight.opponent ? 'DRAW.' : 'ROUND LOST.';
    $('#result-description').textContent = `${fight.punches} punches thrown. ${win ? 'The ring is yours.' : 'Reset your stance. Go again.'}`;
    $('#result').hidden = false; buttons.forEach(b => b.disabled = true); $('#again').focus();
    $('#announcement').textContent = $('#result-title').textContent;
  }
}
function throwPunch(button) {
  const now = performance.now();
  if (!enteredRing || fight.ended || now - lastPunch < 280) return;
  lastPunch = now; started = true;
  const side = button.dataset.side, type = button.dataset.punch;
  const glove = $(`#${side}-glove`), right = side === 'right', mirror = right ? 'scaleX(-1) ' : '';
  const rest = `${mirror}rotate(16deg)`;
  const strike = type === 'hook' ? `${mirror}translate(${right ? '-65px' : '65px'}, -105px) rotate(-38deg) scale(1.15)` : type === 'uppercut' ? `${mirror}translate(${right ? '40px' : '-40px'}, -175px) rotate(30deg) scale(.92)` : `${mirror}translate(${right ? '40px' : '-40px'}, -150px) rotate(-12deg) scale(.72)`;
  animations.get(side)?.cancel();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  animations.set(side, glove.animate([{ transform: rest }, { transform: strike, offset: .45 }, { transform: rest }], { duration: reduced ? 120 : 320, easing: 'ease-in-out' }));
  button.classList.add('active'); const current = generation;
  setTimeout(() => { button.classList.remove('active'); if (current !== generation || fight.ended) return; const damage = punch(fight, type); $('#fighter').classList.remove('hit-left','hit-right','attack'); animateClass($('#fighter'), `hit-${side}`); animateClass($('#impact'),'flash'); $('#hit-text').textContent = `${type === 'uppercut' ? 'UPPERCUT' : type === 'hook' ? 'HOOK' : 'CLEAN HIT'} −${damage}`; animateClass($('#hit-text'),'show'); tone(110); render(); }, reduced ? 50 : 130);
}
buttons.forEach(button => button.addEventListener('pointerdown', event => { if (event.button !== 0) return; event.preventDefault(); throwPunch(button); }));
buttons.forEach(button => button.addEventListener('click', event => { if (event.detail === 0) throwPunch(button); }));
const keys = ['a','s','d','j','k','l'];
document.addEventListener('keydown', event => { if (!enteredRing || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return; const index = keys.indexOf(event.key.toLowerCase()); if (index !== -1) { event.preventDefault(); throwPunch(buttons[index]); } if (event.key === 'Escape' && fight.ended) reset(); });
function reset() { generation++; animations.forEach(a => a.cancel()); animations.clear(); fight = createFight(); started = false; lastPunch = -1000; $('#result').hidden = true; buttons.forEach(b => { b.disabled = false; b.classList.remove('active'); }); $('#fighter').classList.remove('attack','hit-left','hit-right'); $('#impact').classList.remove('flash'); $('#hit-text').classList.remove('show'); $('.game').classList.remove('damage'); render(); $('#announcement').textContent = 'New fight ready'; }
$('#restart').addEventListener('click', reset); $('#again').addEventListener('click', () => { reset(); buttons[0].focus(); });
$('#sound').addEventListener('click', () => { sound = !sound; $('#sound').setAttribute('aria-pressed', String(sound)); $('#sound').setAttribute('aria-label', sound ? 'Mute sound' : 'Enable sound'); if (sound) tone(220); });
setInterval(() => { if (!started || fight.ended || document.hidden) return; tick(fight); render(); }, 1000);
setInterval(() => { if (!started || fight.ended || document.hidden) return; animateClass($('#fighter'),'attack'); const current = generation; setTimeout(() => { if (current !== generation || fight.ended) return; counter(fight); animateClass($('.game'),'damage'); tone(65,.14); render(); }, 250); }, 3500);
render();
