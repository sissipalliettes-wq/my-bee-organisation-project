import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const markup = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const source = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');

test('renders a roulette button beside the Task Bar heading', () => {
  assert.match(markup, /<h1 id="task-bar-title">Task Bar<\/h1>/);
  assert.match(markup, /class="roulette-button"/);
  assert.match(markup, /🎡 Pick task/);
});

test('roulette selects from the written tasks and shows the plank for seven seconds', () => {
  assert.match(source, /Math\.floor\(Math\.random\(\) \* tasks\.length\)/);
  assert.match(source, /setBeePlankVisible\(true, winner\)/);
  assert.match(source, /}, 7000\)/);
  assert.match(markup, /good luck !/);
});

test('bee plank and roulette wheel have presentation styles', () => {
  assert.match(styles, /\.task-plank/);
  assert.match(styles, /\.roulette-wheel/);
  assert.match(styles, /@keyframes spinWheel/);
});
