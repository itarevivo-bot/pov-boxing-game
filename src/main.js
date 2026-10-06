import { createFight, punch, counter, tick } from './engine.js';
const $ = (selector) => document.querySelector(selector);
let fight = createFight(), started = false, lastPunch = 0, audio, sound = false, generation = 0;
const animations = new Map();
let selectedOpponent = null, enteredRing = false;
const opponentMasters = {
  male: `${import.meta.env.BASE_URL}characters/male_boxer_master_transparent.png`,
  female: `${import.meta.env.BASE_URL}characters/female_boxer_master_transparent.png`,
};
for (const [opponent, source] of Object.entries(opponentMasters)) {
  const image = document.createElement('img');
  image.src = source;
  image.alt = '';
  image.draggable = false;
  $(`#${opponent}-portrait`).append(image);
}
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
function showOpponentSelection() {
  selectedOpponent = null;
  enteredRing = false;
  $('.game').hidden = true;
  $('#selection').hidden = false;
  $('#start-fight').hidden = true;
  choices.forEach(choice => {
    choice.setAttribute('aria-pressed', 'false');
    choice.querySelector('.choice-status').textContent = 'SELECT OPPONENT';
  });
  $('#selection-message').textContent = 'Choose an opponent to continue.';
  reset();
}
// A browser history restoration can retain the live DOM and JavaScript state.
// Always require a new selection when the page is opened again this way.
window.addEventListener('pageshow', event => {
  if (event.persisted) showOpponentSelection();
});
$('#start-fight').addEventListener('click', () => {
  if (!selectedOpponent || enteredRing) return;
  $('#fighter').src = opponentMasters[selectedOpponent];
  $('#fighter').alt = `${selectedOpponent === 'male' ? 'Male' : 'Female'} boxer master opponent`;
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
showOpponentSelection();
