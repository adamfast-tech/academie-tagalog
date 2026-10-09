// Akademya Tagalog — liste des extraits audio à générer (audio/clips.json)
// Usage : node tools/clips.mjs
// À relancer seulement si le contenu du cours change. Nécessite Node.js 18+.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const store = {};
const ctx = {
  console, Math, Date, JSON, Intl, Set, Map,
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
  navigator: {}, location: { protocol: 'file:', hash: '' },
  matchMedia: () => ({ matches: false }), performance: { now: () => Date.now() },
  document: { documentElement: { getAttribute: () => null, dataset: {} }, addEventListener() {} },
};
ctx.window = ctx;
vm.createContext(ctx);
const run = f => vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: path.basename(f) });
for (const f of fs.readdirSync(path.join(SRC, 'data')).sort()) run(path.join(SRC, 'data', f));
for (const f of fs.readdirSync(path.join(SRC, 'js')).sort()) if (f < '06') run(path.join(SRC, 'js', f));

const out = vm.runInContext(`(() => {
  const clips = new Map();
  const add = (text, kind, voice) => {
    text = String(text || '').replace(/\\s+/g, ' ').trim();
    if (!text || !/[a-zñ\\u1700-\\u171f]/i.test(text)) return;
    voice = voice || VOICE_DEF;
    const id = audioId(text, voice);
    if (!clips.has(id)) clips.set(id, { id, text, voice, kind });
  };
  const frags = s => String(s).replace(/\\*\\*(.+?)\\*\\*/g, '').match(/\\*([^*]+?)\\*/g) || [];
  const guideFrags = blocks => blocks.forEach(b => {
    const [t, c] = b;
    if (t === 'p' || t === 'tip' || t === 'h') frags(c).forEach(x => add(x.slice(1, -1), 'frag'));
    if (t === 'tbl') c.forEach(row => row.forEach(cell => frags(cell).forEach(x => add(x.slice(1, -1), 'frag'))));
    if (t === 'ex') c.forEach(([tl]) => add(tl, 'guide'));
  });
  // 1. mots et 2. phrases (toutes les variantes)
  ALLW.forEach(w => w.tl.forEach(t => add(t, 'word')));
  ALLS.forEach(s => s.tl.forEach(t => add(t, 'sentence')));
  // 3. histoires, avec la voix de chaque personnage
  STORIES.forEach(st => st.lines.forEach(ln => { if (Array.isArray(ln)) add(ln[1], 'story', voiceFor(st, ln[0])); }));
  // 4. formes verbales
  Object.values(VERBS).forEach(v => v.f.forEach(f => f.split('|').forEach(x => add(x, 'verb'))));
  // 5. guides, prononciation, météo, phrases de test
  UNITS.forEach(u => guideFrags(u.guide));
  guideFrags(PRON);
  Object.values(WX_STATES).forEach(w => add(w.tl.replace('{sa}', 'sa Nice'), 'weather'));
  add('Magandang umaga po! Kumusta po kayo?', 'test'); add('Kumusta! Ako si Araw.', 'test');
  // 6. mots isolés des phrases et des histoires (tuiles, bulles de traduction)
  ALLS.forEach(s => s.tl.forEach(t => tokenize(t).forEach(k => add(k, 'token'))));
  STORIES.forEach(st => st.lines.forEach(ln => { if (Array.isArray(ln)) tokenize(ln[1]).forEach(k => add(k, 'token')); }));
  // 7. nombres : 1 à 100 et centaines d'abord, puis tous les autres jusqu'à 1000 (générés en dernier)
  for (let n = 1; n <= 1000; n++) add(tlNum(n), n <= 100 || n % 100 === 0 ? 'number' : 'number2');
  for (let n = 2000; n <= 10000; n += 1000) add(tlNum(n), 'number');
  // 8. baybayin : syllabes et mots
  BAY_ITEMS.forEach(it => add(it[1].split(' / ')[0], 'bay'));
  BAY_SETS[5].words.forEach(w => add(w, 'bay'));
  return Array.from(clips.values());
})()`, ctx);

fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'audio', 'clips.json'), JSON.stringify(out, null, 0).replace(/\},\{/g, '},\n{'));
const byKind = {};
let chars = 0;
out.forEach(c => { byKind[c.kind] = (byKind[c.kind] || 0) + 1; chars += c.text.length; });
console.log(`audio/clips.json : ${out.length} extraits, ${chars} caractères`);
console.log(byKind);
