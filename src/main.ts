import './style.css';
import { BASE_WORDS } from './words';

const appElement = document.querySelector<HTMLElement>('#app');
if (!appElement) throw new Error('Missing app root');
const app = appElement;

const letters = ['A', 'B', 'C', 'D', 'E'];
const storedSize = Number(localStorage.getItem('crossclues:size'));
let size: 4 | 5 = storedSize === 5 ? 5 : 4;
let deal = Number(localStorage.getItem('crossclues:deal')) || 1;

function seededRandom(seed: number) {
  return () => {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
    value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function wordsForDeal(count: number) {
  const random = seededRandom(deal);
  const pool = [...BASE_WORDS];
  for (let index = pool.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [pool[index], pool[swap]] = [pool[swap], pool[index]];
  }
  return pool.slice(0, count);
}

function sparkle(index: number) {
  return index % 3 === 0 ? '<i class="sparkle sparkle-a">✦</i>' : index % 3 === 1 ? '<i class="sparkle sparkle-b">✧</i>' : '';
}

function header(value: string, word: string, edge: 'top' | 'right' | 'bottom' | 'left', index: number) {
  return `<div class="header-card ${edge}" data-edge="${edge}" data-coordinate="${value}" data-word="${word}">
    <div class="header-content"><span>${word}</span></div>${sparkle(index)}
  </div>`;
}

function sizeButton(value: 4 | 5, rotation: number) {
  const dots = Array.from({ length: value * value }, () => '<i></i>').join('');
  return `<button class="round-button size-button ${value === size ? 'selected' : ''}" data-size="${value}" style="--counter-rotation:${rotation}deg" aria-label="${value} by ${value} board" aria-pressed="${value === size}"><span class="mini-grid grid-${value}">${dots}</span><b>${value}</b></button>`;
}

function shuffleButton(rotation: number) {
  return `<button class="round-button shuffle-button" data-shuffle style="--counter-rotation:${rotation}deg" aria-label="Deal new words"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M9 14h7c9 0 10 20 19 20h4m-6-6 6 6-6 6M9 34h7c4 0 6-4 8-9m5-11c2-1 3 0 6 0h4m-6-6 6 6-6 6"/></svg></button>`;
}

function controls(rotation: number) {
  return `<div class="controls" style="--rotation:${rotation}deg">${sizeButton(4, -rotation)}${sizeButton(5, -rotation)}${shuffleButton(-rotation)}</div>`;
}

function render() {
  const cols = letters.slice(0, size);
  const rows = Array.from({ length: size }, (_, index) => String(index + 1));
  const dealtWords = wordsForDeal(size * 2);
  const columnWords = dealtWords.slice(0, size);
  const rowWords = dealtWords.slice(size);
  const cells = rows.flatMap((row, r) => cols.map((col, c) =>
    `<div class="clue-card" role="gridcell" data-cell="${col}${row}" style="--r:${r};--c:${c}"><span>${col}<small>${row}</small></span><span class="reverse">${col}<small>${row}</small></span>${sparkle(r * size + c)}</div>`
  )).join('');

  app.innerHTML = `
    <section class="tabletop" data-board-size="${size}" data-deal="${deal}">
      <div class="corner corner-nw">${controls(0)}</div>
      <div class="corner corner-se">${controls(180)}</div>
      <div class="board" style="--size:${size}">
        <div class="headers headers-top">${cols.map((value, i) => header(value, columnWords[i], 'top', i)).join('')}</div>
        ${size === 4 ? `<div class="headers headers-right">${rows.map((value, i) => header(value, rowWords[i], 'right', i)).join('')}</div>` : ''}
        ${size === 4 ? `<div class="headers headers-bottom">${cols.map((value, i) => header(value, columnWords[i], 'bottom', i)).join('')}</div>` : ''}
        <div class="headers headers-left">${rows.map((value, i) => header(value, rowWords[i], 'left', i)).join('')}</div>
        <div class="grid" role="grid" aria-label="${size} by ${size} Cross Clues board">${cells}</div>
      </div>
    </section>`;

  app.querySelectorAll<HTMLButtonElement>('[data-size]').forEach(button => {
    button.addEventListener('click', () => {
      const next = Number(button.dataset.size) as 4 | 5;
      if (next !== size) {
        size = next;
        localStorage.setItem('crossclues:size', String(size));
        render();
      }
    });
  });
  app.querySelectorAll<HTMLButtonElement>('[data-shuffle]').forEach(button => {
    button.addEventListener('click', () => {
      deal += 1;
      localStorage.setItem('crossclues:deal', String(deal));
      render();
    });
  });
}

render();
