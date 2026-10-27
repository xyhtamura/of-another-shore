# A leaf falling

## 2026-10-27 — Codex

Removed the visible title, return link, field note, caption, and separate leaf
illustration from `aleaffalling.html`. Centered the poem card. The opening reads
`a leaf`, then releases `f`, `a`, and `e` in sequence. The percentages are
interpreted as fall distances toward `so many ways`: 100%, 75%, and 25%.
`l` stays in place. Each loop varies the drift, rotation, and fall duration,
holds the staggered letters, then fades and reforms the word. Reduced motion
and JavaScript-free viewing retain a static staggered opening.

Checked the running page in the browser: only the poem remains, the letters
fall in order, the sequence resets, and the 492 px viewport has no visible
horizontal overflow. An isolated execution of the page script checked the
distance ratios, non-overlapping release intervals, changed paths after a
restart, and the reduced-motion branch. `git diff --check` passed for the
changed page and this note. Pacing and drift still need Xyh's review.

Kept this record beside the poem because `DEVNOTES.md` was already deleted in
the working tree. The deletion and other pre-existing changes were left alone.

## 2026-10-27 — Codex — Fall chances

Added independent per-loop fall chances: `f` 100%, `a` 75%, and `e` 25%.
The existing distances still apply. A skipped letter stays in the word, and
selected letters retain the `f`, `a`, `e` release order without waiting for a
skipped letter's turn.

Checked four controlled executions of the page script: all three letters fall,
only `f` falls, `f` and `a` fall, and `e` falls when `a` stays. The threshold
draws skip correctly, and selected letters fall sequentially. Watched a full
sequence and reset in the browser. `git diff --check` passed. Pacing and drift
still need Xyh's review.
