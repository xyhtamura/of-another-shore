// namefile — a name handled as a file. Spec: SPEC-name-as-file.md.
// The engine (run) has no DOM in it; the page code is at the bottom.

import LEXICON from './namefile.data.js';

const STEP_MS = 2600;            // reading pace, one step
const STEP_LIMIT = 32;           // rows after the first
const MAX_BRANCHES = 3;
const MAX_LEN = 60;              // operations that lengthen a segment stop here
const SEARCH_MAX_LEN = 40;
const SEARCH_TIMEOUT_MS = 4000;
const EARLIEST_END = 8;          // the last branch is not lost before this step
const SEGS = ['island', 'house', 'name'];

export function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];
const utf8 = new TextEncoder();

// Mechanical operations. Each is a pure function of the string and its
// parameters, so a test can recompute any row.
export const mech = {
  copy(s, { style }) {
    if (style === 0) {
      const m = s.match(/^(.*) - Copy(?: \((\d+)\))?$/s);
      return m ? `${m[1]} - Copy (${m[2] ? +m[2] + 1 : 2})` : `${s} - Copy`;
    }
    const m = s.match(/^(.*) \((\d+)\)$/s);
    return m ? `${m[1]} (${+m[2] + 1})` : `${s} (2)`;
  },
  mojibake(s, { as }) {
    return new TextDecoder(as).decode(utf8.encode(s));
  },
  // 8.3 short name: spaces and dots dropped, non-ASCII to "_", upper case,
  // first six characters, "~1".
  truncate(s) {
    const base = [...s.replace(/[ .]/g, '')]
      .map(c => (c.codePointAt(0) < 128 ? c : '_')).join('').toUpperCase();
    return base.slice(0, 6) + '~1';
  },
  form(_s, { surname, given, middle }) {
    return `${surname}, ${given}${middle ? ' ' + middle : ''}`.toUpperCase();
  },
  flip(s, { byte, bit }) {
    const b = utf8.encode(s);
    b[byte] ^= 1 << bit;
    return new TextDecoder('utf-8', { fatal: false }).decode(b);
  }
};

function scriptOf(v, variants) {
  const hit = variants.find(x => x.text === v);
  if (hit) return hit.script;
  return /^[\u0000-ɏ]*$/.test(v) ? 'latin' : 'other';
}

export function missing(lex) {
  const out = [];
  if (!lex?.name?.variants?.length) out.push('name.variants');
  if (!lex?.house?.variants?.length) out.push('house.variants');
  if (!lex?.island?.claims?.length) out.push('island.claims');
  return out;
}

const pathOf = b => '/' + SEGS.map(k => b.seg[k].v).join('/');

// Every operation open to branch b at this step, as { op, seg, w, apply }.
function options(b, st, ctx) {
  const { lex } = ctx;
  const W = lex.weights || {}, SW = lex.segments || {};
  const out = [];
  const add = (op, seg, apply) => {
    if (W[op] > 0) out.push({ op, seg, w: seg ? (SW[seg] ?? 1) : 1, apply });
  };
  const authored = (after, detail, date, owner) =>
    ({ kind: 'authored', after, detail, date: date || null, owner });

  for (const seg of SEGS) {
    const s = b.seg[seg], v = s.v, L = lex[seg];

    if (!s.conflict) {
      if (seg !== 'island') {
        const cur = scriptOf(v, L.variants);
        const same = L.variants.filter(x => x.text !== v && x.script === cur);
        const other = L.variants.filter(x => x.text !== v && x.script !== cur);
        if (same.length) add('rename', seg, r => authored(pick(same, r).text));
        if (other.length) add('transliterate', seg, r => {
          const x = pick(other, r); return authored(x.text, x.script);
        });
      }
      const heard = (L.mishearings || []).filter(x => x.text !== v);
      if (heard.length) add('mishear', seg, r => {
        const x = pick(heard, r); return authored(x.text, x.by, x.date);
      });
      const hops = (L.translations || []).filter(x => x.from === v);
      if (hops.length) add('translate', seg, r => {
        const x = pick(hops, r); return authored(x.to, x.lang);
      });
      if (seg === 'island') {
        const claims = L.claims.filter(c => c.claimant !== b.owner);
        if (claims.length) add('chown', seg, r => {
          const c = pick(claims, r); return authored(c.name, '', c.date, c.claimant);
        });
      }
    }

    const done = (op, params, detail) =>
      ({ kind: 'mechanical', after: mech[op](v, params), params, detail });
    if (v.length <= MAX_LEN) {
      add('copy', seg, r => done('copy', { style: r() < 0.6 ? 0 : 1 }, ''));
      if (/[^\u0000-\u007f]/.test(v)) add('mojibake', seg, r => {
        const as = r() < 0.5 ? 'windows-1252' : 'shift_jis';
        return done('mojibake', { as }, as);
      });
      add('flip', seg, r => {
        const byte = Math.floor(r() * utf8.encode(v).length), bit = Math.floor(r() * 8);
        return done('flip', { byte, bit }, `bit ${bit} of byte ${byte}`);
      });
    }
    if (v.length > 8 || /[^!-~]/.test(v)) add('truncate', seg, () => done('truncate', {}, '8.3'));
    if (seg === 'name' && L.parts?.surname && L.parts?.given) {
      const after = mech.form(v, L.parts);
      if (after !== v) add('form', seg, () => ({ kind: 'mechanical', after, params: L.parts, detail: '' }));
    }

    // search: the string is sent to Wikipedia and replaced by what comes back.
    // Offered whether or not there is a network, so a replay from held
    // results weighs the same choices as the run that fetched them.
    // Not on a conflicted segment: a result would replace both sides, and
    // the engine does not resolve a conflict.
    if (v.length <= SEARCH_MAX_LEN && !s.conflict) add('search', seg, async r => {
      const roll = r();                      // drawn whether or not a capture is replayed
      let got = ctx.captures[st.step];
      if (got === undefined) {
        try { got = ctx.search ? await ctx.search(v, roll) : false; } catch { got = false; }
        ctx.captures[st.step] = got;
      }
      if (!got) return { kind: 'fetched', after: v, detail: got === false ? 'no answer' : '0 results' };
      return { kind: 'fetched', after: got[0], detail: got[1] };
    });
  }

  const live = st.branches.filter(x => !x.lost && !x.merged);
  if (live.length < MAX_BRANCHES) add('fork', null, () => ({ structural: 'fork' }));
  if (live.length > 1) add('merge', null, r => ({ structural: 'merge', with: pick(live.filter(x => x !== b), r) }));
  if (live.length > 1 || st.step >= EARLIEST_END) add('lose', null, () => ({ structural: 'lose' }));
  const lost = st.branches.filter(x => x.lost);
  if (lost.length) add('restore', null, r => ({ structural: 'restore', which: pick(lost, r) }));
  return out;
}

// Runs one lineage. Calls onRow for each row and awaits wait(step) between
// rows; wait returning false stops the run. Returns the rows.
export async function run({ lex, seed, forks = [], captures = {}, search = null,
  onRow = () => {}, wait = async () => true, limit = STEP_LIMIT }) {
  let rng = mulberry32(seed);
  const ctx = { lex, captures, search };
  const st = { step: 0, branches: [] };
  const rows = [];
  const emit = async row => { rows.push(row); await onRow(row, st); };
  const base = (b, op, extra) => ({
    step: st.step, branch: b.id, depth: b.depth, op, detail: '', kind: 'authored',
    seg: null, path: pathOf(b), owner: b.owner, date: null, struck: false, ...extra
  });

  const claim = pick(lex.island.claims, rng);
  const root = {
    id: 1, depth: 0, owner: claim.claimant, lost: false, merged: false,
    seg: {
      island: { v: claim.name, conflict: false },
      house: { v: pick(lex.house.variants, rng).text, conflict: false },
      name: { v: pick(lex.name.variants, rng).text, conflict: false }
    }
  };
  st.branches.push(root);
  await emit(base(root, 'create', { seg: 'name', after: root.seg.name.v }));

  while (st.step < limit) {
    if (!(await wait(st.step))) return rows;
    const fork = forks.find(f => f.at === st.step);
    if (fork) rng = mulberry32(fork.seed);
    st.step++;

    const live = st.branches.filter(x => !x.lost && !x.merged);
    let b, choice;
    if (!live.length) {
      // Every branch is lost. Half the time one comes back; otherwise it ends.
      const lost = st.branches.filter(x => x.lost);
      if (!(lex.weights?.restore > 0) || rng() < 0.5) { st.step--; break; }
      b = lost[0];
      choice = { op: 'restore', seg: null, apply: r => ({ structural: 'restore', which: pick(lost, r) }) };
    } else {
      b = pick(live, rng);
      const opts = options(b, st, ctx);
      if (!opts.length) { st.step--; break; }
      // The operation is chosen first, by its weight alone, then the segment.
      // Otherwise an operation open to three segments would be chosen three
      // times as often as fork or merge.
      const weighted = (list, w) => {
        let x = rng() * list.reduce((n, o) => n + w(o), 0);
        return list.find(o => (x -= w(o)) < 0) || list[list.length - 1];
      };
      const op = weighted([...new Set(opts.map(o => o.op))], k => lex.weights[k]);
      choice = weighted(opts.filter(o => o.op === op), o => o.w);
    }
    const res = await choice.apply(rng);

    if (res.structural === 'fork') {
      const nb = {
        id: st.branches.length + 1, depth: b.depth + 1, owner: b.owner, lost: false, merged: false,
        seg: Object.fromEntries(SEGS.map(k => [k, { ...b.seg[k] }]))
      };
      st.branches.push(nb);
      await emit(base(nb, 'fork', { detail: `of branch ${b.id}` }));
    } else if (res.structural === 'merge') {
      const [ours, theirs] = b.id < res.with.id ? [b, res.with] : [res.with, b];
      const joined = [];
      const before = [pathOf(ours), pathOf(theirs)];
      const owners = [ours.owner, theirs.owner];
      for (const k of SEGS) {
        const a = ours.seg[k], t = theirs.seg[k];
        if (a.v !== t.v) {
          const after = `${a.v}|${t.v}`;
          joined.push({ seg: k, ours: a.v, theirs: t.v, after });
          ours.seg[k] = { v: after, conflict: true };
        } else if (t.conflict) a.conflict = true;
      }
      if (owners[0] !== owners[1]) ours.owner = `${owners[0]} | ${owners[1]}`;
      theirs.merged = true;
      const labels = owners[0] !== owners[1] ? owners : [`branch ${ours.id}`, `branch ${theirs.id}`];
      await emit(base(ours, 'merge', {
        detail: joined.length ? `branch ${theirs.id}, conflict` : `branch ${theirs.id}`,
        joined,
        conflict: joined.length
          ? [`<<<<<<< ${labels[0]}`, before[0], '=======', before[1], `>>>>>>> ${labels[1]}`]
          : null
      }));
    } else if (res.structural === 'lose') {
      b.lost = true;
      await emit(base(b, 'lose', { struck: true }));
    } else if (res.structural === 'restore') {
      res.which.lost = false;
      await emit(base(res.which, 'restore'));
    } else {
      const before = b.seg[choice.seg].v;
      b.seg[choice.seg].v = res.after;
      if (res.owner) b.owner = res.owner;
      await emit(base(b, choice.op, {
        seg: choice.seg, before, after: res.after, kind: res.kind,
        params: res.params, detail: res.detail || '', date: res.date || null
      }));
    }
  }
  return rows;
}

// Wikipedia, keyless and CORS-open. A spelling suggestion wins; otherwise one
// of the first five titles, chosen by the roll.
async function wikiSearch(q, roll) {
  const host = /[぀-ヿ㐀-鿿]/.test(q) ? 'ja' : 'en';
  const url = `https://${host}.wikipedia.org/w/api.php?action=query&list=search&srlimit=5`
    + `&srinfo=suggestion&srprop=&format=json&origin=*&srsearch=${encodeURIComponent(q)}`;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), SEARCH_TIMEOUT_MS);
  try {
    const j = await (await fetch(url, { signal: ac.signal })).json();
    const sug = j.query?.searchinfo?.suggestion;
    if (sug && sug !== q) return [sug, 'did you mean'];
    const hits = (j.query?.search || []).map(h => h.title).filter(t => t !== q);
    if (!hits.length) return null;
    return [hits[Math.floor(roll * hits.length)].slice(0, 48), `${host}.wikipedia`];
  } finally { clearTimeout(timer); }
}

// ---------------------------------------------------------------- tests

// Spec validation 3: every state of the name is an authored entry, the
// recomputed output of a mechanical operation on an earlier state, a search
// result held in captures, or two earlier states joined by a merge conflict.
function inventedNames(rows, lex, captures) {
  const authored = new Set([
    ...lex.name.variants.map(x => x.text),
    ...(lex.name.mishearings || []).map(x => x.text),
    ...(lex.name.translations || []).map(x => x.to)
  ]);
  const known = new Set();
  const bad = [];
  for (const r of rows) {
    if (r.op === 'create') { authored.has(r.after) ? known.add(r.after) : bad.push(r); continue; }
    for (const j of r.joined || []) {
      if (j.seg !== 'name') continue;
      known.has(j.ours) && known.has(j.theirs) && j.after === `${j.ours}|${j.theirs}` ? known.add(j.after) : bad.push(r);
    }
    if (r.seg !== 'name') continue;
    const ok = known.has(r.before) && (
      r.kind === 'authored' ? authored.has(r.after)
        : r.kind === 'mechanical' ? mech[r.op](r.before, r.params) === r.after
          : r.after === r.before || captures[r.step]?.[0] === r.after);
    ok ? known.add(r.after) : bad.push(r);
  }
  return bad;
}

const textOf = rows => rows.map(r => [(r.conflict || [r.path]).join('\n'), r.op, r.detail, r.owner].join('\t')).join('\n');

async function tests(lex) {
  const out = [];
  const t = (name, pass, note = '') => out.push({ name, pass: !!pass, note });
  const stub = async (q, roll) => [`result ${Math.floor(roll * 5)} for ${q}`, 'stub'];

  t('mojibake: é read as windows-1252 is Ã©', mech.mojibake('é', { as: 'windows-1252' }) === 'Ã©');
  const sj = mech.mojibake('再', { as: 'shift_jis' });
  t('mojibake: 再 read as shift_jis changes and is not empty', sj && sj !== '再', JSON.stringify(sj));
  t('truncate: "Cy Tamura" is CYTAMU~1', mech.truncate('Cy Tamura') === 'CYTAMU~1');
  t('truncate: 再 is _~1', mech.truncate('再') === '_~1');
  t('form: TAMURA, CYE G.', mech.form('', { surname: 'Tamura', given: 'Cye', middle: 'G.' }) === 'TAMURA, CYE G.');
  t('flip: bit 0 of "x" is "y"', mech.flip('x', { byte: 0, bit: 0 }) === 'y');
  t('flip: a broken lead byte shows U+FFFD', mech.flip('再', { byte: 0, bit: 7 }).includes('�'));
  t('copy: " - Copy", then " - Copy (2)"', mech.copy(mech.copy('xyh', { style: 0 }), { style: 0 }) === 'xyh - Copy (2)');
  t('copy: " (2)", then " (3)"', mech.copy(mech.copy('xyh', { style: 1 }), { style: 1 }) === 'xyh (3)');

  if (missing(lex).length) { t('lineage tests', false, 'lexicon is empty'); return out; }

  const a = await run({ lex, seed: 0x4f2a91, search: stub });
  const b = await run({ lex, seed: 0x4f2a91, search: stub });
  const c = await run({ lex, seed: 0x4f2a92, search: stub });
  t('determinism: one seed twice gives the same listing', textOf(a) === textOf(b));
  t('determinism: another seed gives a different listing', textOf(a) !== textOf(c));

  const caps = {};
  await run({ lex, seed: 0x4f2a91, search: stub, captures: caps });
  const replay = await run({ lex, seed: 0x4f2a91, search: null, captures: { ...caps } });
  t('replay: held search results reproduce the listing with no network', textOf(replay) === textOf(a),
    `${Object.keys(caps).length} searches held`);

  let bad = 0, total = 0, ops = new Set();
  for (let s = 1; s <= 300; s++) {
    const cap = {};
    const rows = await run({ lex, seed: s * 7919, search: stub, captures: cap });
    bad += inventedNames(rows, lex, cap).length; total += rows.length;
    rows.forEach(r => ops.add(r.op));
  }
  t('nothing invented: 300 lineages, every name state accounted for', bad === 0, `${total} rows, ${bad} unaccounted`);
  const want = ['create', ...Object.keys(lex.weights).filter(k => lex.weights[k] > 0)];
  const unseen = want.filter(k => !ops.has(k));
  t('every weighted operation occurs in 300 lineages', unseen.length === 0, unseen.join(', '));

  const at = 12;
  const f = await run({ lex, seed: 0x4f2a91, forks: [{ at, seed: 0x77c0 }], search: stub });
  const head = rows => textOf(rows.slice(0, at + 1));
  t(`fork: rows 0 to ${at} match the parent`, head(f) === head(a));
  t('fork: the listing differs after that', textOf(f) !== textOf(a));

  t('stop: no lineage runs past the step limit', a.length <= STEP_LIMIT + 1 && a[a.length - 1].step <= STEP_LIMIT, `${a.length} rows`);
  return out;
}

// ---------------------------------------------------------------- page

const $ = id => document.getElementById(id);
const hex = n => n.toString(16).padStart(6, '0');
const newSeed = () => crypto.getRandomValues(new Uint32Array(1))[0] >>> 8;
const b64 = {
  to: o => btoa(String.fromCharCode(...utf8.encode(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
  from: s => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))))
};

function readFragment() {
  const p = new URLSearchParams(location.hash.slice(1));
  const seed = parseInt(p.get('s') || '', 16);
  if (!Number.isFinite(seed)) return null;
  const ats = (p.get('at') || '').split(',').filter(Boolean).map(Number);
  const fs = (p.get('f') || '').split(',').filter(Boolean).map(x => parseInt(x, 16));
  const forks = ats.map((at, i) => ({ at, seed: fs[i] })).filter(f => Number.isFinite(f.at) && Number.isFinite(f.seed));
  let captures = {};
  try { if (p.get('w')) captures = b64.from(p.get('w')); } catch { captures = {}; }
  return { seed, forks, captures };
}

function fragmentOf({ seed, forks, captures }) {
  let h = `#s=${hex(seed)}`;
  if (forks.length) h += `&at=${forks.map(f => f.at).join(',')}&f=${forks.map(f => hex(f.seed)).join(',')}`;
  if (Object.keys(captures).length) h += `&w=${b64.to(captures)}`;
  return h;
}

// C0 controls from a bit flip are shown as their control pictures.
const show = s => s.replace(/[\u0000-\u001f]/g, c => String.fromCharCode(0x2400 + c.charCodeAt(0))).replace(/\u007f/g, '␡');

const stamp = () => {
  const d = new Date(), z = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())}`;
};

function rowElement(row) {
  const tr = document.createElement('tr');
  tr.className = `row ${row.kind} op-${row.op}${row.struck ? ' struck' : ''}`;
  const cell = (cls, text) => { const td = document.createElement('td'); td.className = cls; td.textContent = text; tr.append(td); return td; };
  const path = cell('path', '');
  path.style.setProperty('--depth', row.depth);
  if (row.depth) {
    const tree = document.createElement('span');
    tree.className = 'tree'; tree.textContent = '│ '.repeat(row.depth);
    path.append(tree);
  }
  if (row.conflict) {
    row.conflict.forEach((line, i) => {
      const s = document.createElement('span');
      s.className = i % 2 ? 'side' : 'marker';
      s.textContent = show(line);
      path.append(s, document.createElement('br'));
    });
  }
  const now = document.createElement('span');
  now.textContent = show(row.path);
  path.append(now);
  cell('op', row.detail ? `${row.op} ${row.detail}` : row.op);
  cell('owner', row.owner);
  cell('date', row.date || (row.kind === 'authored' ? '—' : stamp()));
  return tr;
}

let current = 0;   // token of the running lineage; a newer one cancels the older

async function start(lex) {
  const token = ++current;
  const rowsEl = $('rows'), status = $('status'), verse = $('verse');
  rowsEl.replaceChildren(); verse.replaceChildren();
  const gone = missing(lex);
  if (gone.length) {
    status.textContent = `The lexicon is empty. Add entries to namefile.data.js: ${gone.join(', ')}.`;
    document.querySelectorAll('.controls button').forEach(b => { b.disabled = true; });
    return;
  }

  let frag = readFragment();
  if (!frag) {
    frag = { seed: newSeed(), forks: [], captures: {} };
    history.replaceState(null, '', fragmentOf(frag));
  }
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const replayed = frag.forks.length ? Math.max(...frag.forks.map(f => f.at)) : -1;
  let paused = false, step = 0, held = Object.keys(frag.captures).length;
  $('pause').textContent = 'Pause';
  $('pause').onclick = () => { paused = !paused; $('pause').textContent = paused ? 'Continue' : 'Pause'; };
  $('pause').disabled = false;
  $('fork').onclick = () => {
    // Keep the rows shown so far and take a new seed from here.
    const keep = Object.fromEntries(Object.entries(frag.captures).filter(([k]) => +k <= step));
    location.hash = fragmentOf({ seed: frag.seed, forks: [...frag.forks.filter(f => f.at < step), { at: step, seed: newSeed() }], captures: keep });
  };

  const say = text => { status.textContent = `${text} Seed ${hex(frag.seed)}.`; };

  await run({
    lex, seed: frag.seed, forks: frag.forks, captures: frag.captures, search: wikiSearch,
    onRow(row, st) {
      if (token !== current) return;
      step = row.step;
      rowsEl.append(rowElement(row));
      if ((lex.lines || []).length) {
        const b = st.branches.find(x => !x.lost && !x.merged) || st.branches[0];
        verse.replaceChildren(...lex.lines.map(line => {
          const p = document.createElement('p');
          p.textContent = show(line.replace(/\{(name|house|island)\}/g, (_, k) => b.seg[k].v));
          return p;
        }));
      }
      if (Object.keys(frag.captures).length !== held) {
        held = Object.keys(frag.captures).length;
        history.replaceState(null, '', fragmentOf(frag));
      }
      say(`Step ${row.step} of ${STEP_LIMIT}.`);
    },
    async wait(s) {
      if (token !== current) return false;
      if (still || s < replayed) return true;
      // One timer to a wall-clock deadline. A hidden tab runs timers about
      // once a second, so counting short ticks would stretch every step.
      let due = performance.now() + STEP_MS;
      for (;;) {
        const left = due - performance.now();
        if (left <= 0 && !paused) return true;
        const t0 = performance.now();
        await new Promise(r => setTimeout(r, paused ? 250 : left));
        if (token !== current) return false;
        if (paused) due += performance.now() - t0;
      }
    }
  });
  if (token !== current) return;
  $('pause').disabled = true;
  say(`Stopped at step ${step}.`);
}

async function showTests(lex) {
  const results = await tests(lex);
  const ul = document.createElement('ul');
  ul.id = 'tests';
  for (const r of results) {
    const li = document.createElement('li');
    li.className = r.pass ? 'pass' : 'fail';
    li.textContent = `${r.pass ? 'pass' : 'FAIL'} — ${r.name}${r.note ? ` (${r.note})` : ''}`;
    ul.append(li);
  }
  document.querySelector('.listing').replaceWith(ul);
  $('status').textContent = `${results.filter(r => r.pass).length} of ${results.length} tests pass.`;
  document.querySelectorAll('.controls button').forEach(b => { b.disabled = true; });
}

if (typeof document !== 'undefined') {
  const q = new URLSearchParams(location.search);
  const EMPTY = { name: { variants: [] }, house: { variants: [] }, island: { claims: [] }, weights: {}, lines: [] };
  const lex = q.has('empty') ? EMPTY : LEXICON;
  if (q.has('test')) showTests(lex);
  else {
    $('share').onclick = async () => {
      try { await navigator.clipboard.writeText(location.href); $('status').textContent = 'Link copied.'; }
      catch { $('status').textContent = `Copy this link: ${location.href}`; }
    };
    $('new').onclick = () => { location.hash = `#s=${hex(newSeed())}`; };
    addEventListener('hashchange', () => start(lex));
    start(lex);
  }
}
