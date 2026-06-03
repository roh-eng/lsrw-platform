/**
 * LSRW content validator — zero-dependency, runs with plain `node`.
 *
 *   npm test         (or)   node tests/validate-content.mjs
 *
 * Guards the question banks against the class of bugs that can ship silently
 * because the app never crashes on bad content:
 *   • every multiple-choice `correct` answer must be selectable
 *       - Reading: correct ∈ options
 *       - Listening: correct index within options range
 *   • Speaking "Sentence Building" — the scrambled words must be able to form
 *     the target sentence (multiset of words === multiset of correct words)
 *   • Writing "Passage Reconstruction" — jumbled text must contain exactly the
 *     words of the original passage
 *   • Reading comprehension answers should be grounded in their passage (warn)
 *
 * Hard failures exit non-zero so this can gate a commit / CI step.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, 'js', p), 'utf8');

let failures = 0, warnings = 0;
const fail = (m) => { failures++; console.log('  ✗ FAIL  ' + m); };
const warn = (m) => { warnings++; console.log('  ⚠ WARN  ' + m); };
const ok   = (m) => console.log('  ✓ ' + m);

/* string-aware balanced-bracket extractor for a `const NAME = {…}` / `[…]` literal */
function extractLiteral(src, marker) {
  const at = src.indexOf(marker);
  if (at < 0) return null;
  let i = src.indexOf('=', at) + 1;
  while (i < src.length && /\s/.test(src[i])) i++;
  const open = src[i], close = open === '{' ? '}' : ']';
  let depth = 0, inStr = null, esc = false; const start = i;
  for (; i < src.length; i++) {
    const c = src[i];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === inStr) inStr = null; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === open) depth++;
    else if (c === close && --depth === 0) return src.slice(start, i + 1);
  }
  return null;
}
function evalLiteral(src, marker, label) {
  const lit = extractLiteral(src, marker);
  if (!lit) { fail(`could not locate ${label}`); return null; }
  try { return (0, eval)('(' + lit + ')'); }
  catch (e) { fail(`could not parse ${label}: ${e.message}`); return null; }
}
const multiset = (s) => s.toLowerCase().replace(/[^a-z ]/g, '').split(/\s+/).filter(Boolean).sort().join(' ');

console.log('\nListening');
{
  const src = read('modules/listening.js');
  const responseBank = evalLiteral(src, 'const responseBank', 'listening.responseBank') || [];
  const passageBank  = evalLiteral(src, 'const passageBank',  'listening.passageBank')  || [];
  let n = 0;
  responseBank.forEach((q, i) => { n++; if (!(q.correct >= 0 && q.correct < q.options.length)) fail(`responseBank[${i}] correct index out of range`); });
  passageBank.forEach((p, pi) => p.questions.forEach((q, qi) => { n++; if (!(q.correct >= 0 && q.correct < q.options.length)) fail(`passageBank[${pi}].q[${qi}] correct index out of range`); }));
  ok(`${n} MCQs have a selectable answer`);
}

console.log('Reading');
{
  const src = read('modules/reading.js');
  const db = evalLiteral(src, 'const databanks', 'reading.databanks') || {};
  let n = 0;
  const stop = new Set(['the','a','an','of','to','and','or','in','on','for','is','are','be','it','its','with','that','this','can','not','over','time','they']);
  (db.reading_comprehension || []).forEach((p, pi) => {
    const passage = p.paragraph.toLowerCase();
    p.questions.forEach((q, qi) => {
      n++;
      if (!q.options.includes(q.correct)) fail(`reading_comprehension[${pi}].q[${qi}] correct "${q.correct}" not in options`);
      const words = q.correct.toLowerCase().replace(/[^a-z ]/g, '').split(/\s+/).filter(w => w.length > 3 && !stop.has(w));
      const present = words.filter(w => passage.includes(w));
      if (words.length && present.length / words.length < 0.5)
        warn(`reading_comprehension[${pi}].q[${qi}] answer weakly grounded in passage ("${q.q}")`);
    });
  });
  (db.sentence_completion || []).forEach((q, i) => { n++; if (!q.options.includes(q.correct)) fail(`sentence_completion[${i}] correct "${q.correct}" not in options`); });
  ok(`${n} MCQs have a selectable answer`);
}

console.log('Speaking');
{
  const src = read('modules/speaking.js');
  const db = evalLiteral(src, 'const databanks', 'speaking.databanks') || {};
  let n = 0;
  (db.sentence_building || []).forEach((q, i) => {
    n++;
    if (multiset(q.words.join(' ')) !== multiset(q.correct))
      fail(`sentence_building[${i}] scrambled words cannot form the target sentence`);
  });
  ok(`${n} Sentence-Building items are solvable from their given words`);
}

console.log('Writing');
{
  const src = read('modules/writing.js');
  const db = evalLiteral(src, 'const submodulesData', 'writing.submodulesData') || {};
  let n = 0;
  (db.reconstruction?.questions || []).forEach((q, i) => {
    n++;
    if (multiset(q.original) !== multiset(q.jumbled))
      fail(`reconstruction[${i}] jumbled text words do not match the original`);
  });
  ok(`${n} Reconstruction items have matching jumbled/original word sets`);
}

console.log(`\n${failures === 0 ? '✓ PASS' : '✗ FAIL'} — ${failures} hard failure(s), ${warnings} warning(s)\n`);
process.exit(failures === 0 ? 0 : 1);
