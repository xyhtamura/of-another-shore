# Spec: a name handled as a file

2026-10-08 — Claude Code. Spec only. Nothing is built. Working filename
`namefile.html`; the title is Xyh's to give.

## What it is

A computational poem for *Of Another Shore*. One name is treated as a file. It
is copied, renamed, transliterated, misheard, corrupted, translated, forked,
merged, and shared, and each step leaves a line. Two further words can travel
with it, a house and an island, and the island can be contested: it has more
than one name and more than one owner.

Xyh's brief, 2026-10-08: "my name morphing through spellings, utterances, like
it's a file being copied, shared, corrupted, translated, forked, etc. It can be
accompanied by other terms like 'house' or 'island' (then who owns the island,
names for an island. maybe a piece of land being contested)."

It belongs with "dungan" and "encyclopedia". "dungan" counts the souls;
this piece shows one of them being versioned.

## Decisions that are Xyh's

The build can start without the first two. It cannot be published without
them.

1. **The lexicon.** Every spelling, script, mishearing, and translation of the
   name is authored by Xyh in a data file. The engine never invents a variant
   of the name. It only reorders authored variants and damages them by the
   mechanical operations below. See Lexicon.
2. **What is published.** The data file is a public file on GitHub Pages.
   Any legal, former, or family name put in it is published with it.
3. **The land.** Which island, real or invented, and which claimants.
4. **Authored lines.** Whether the piece is only the generated listing, or
   whether Xyh's own lines of verse frame it. See Form.
5. **Title and where it is reachable from** in `index.html`.

## Form

One structure carries all three words: a path.

```
/island/house/name
```

Each segment has its own lineage. An operation applies to one segment at a
time. The poem is the history of that path.

The page shows a file listing with four columns: the path, the operation that
produced it, the owner, and a date. Each new step adds a row. The path column
is the poem and should be readable on its own as lines.

```
/island/house/name            create      —          —
/island/house/name - Copy     copy        —          —
```

The rows above show layout only. The words in them are placeholders.

The listing suits the suite's stated target, the look of a 1990s CD-ROM or
file manager (`DEVNOTES.md` §1, in git history), and this repository already
contains a file named `index - Copy.html`.

**Optional frame.** If Xyh writes lines of verse, they sit above or between
rows and may contain the slots `{name}`, `{house}`, and `{island}`, which
show the current state of each segment. The engine does not write verse.

**Ownership.** The owner column is where "who owns the island" lives. A
`chown` step changes it. A contested island shows two owners and two names
between merge-conflict markers, and the conflict is never resolved by the
engine:

```
<<<<<<< claimant A
name A
=======
name B
>>>>>>> claimant B
```

## Operations

Each operation is a named function from one state to the next. Two kinds.

**Authored.** These choose from the lexicon. They produce nothing Xyh did not
write.

| Operation | Effect |
| :--- | :--- |
| `rename` | Another spelling of the same segment. |
| `transliterate` | The same segment in another script. |
| `mishear` | A spelling as someone else has said or written it. |
| `translate` | The segment's meaning in another language, then possibly back. Each hop is an authored pair. |
| `chown` | The owner changes to another authored claimant. |
| `fork` | The lineage splits in two. Both branches continue; the listing indents one. |
| `merge` | Two branches rejoin. If their values differ, show the conflict markers. |

**Mechanical.** These damage whatever string they are given, by a real
process. They are computed, not looked up, so the damage is what a machine
would actually do.

| Operation | Effect | How |
| :--- | :--- | :--- |
| `copy` | Identical string with a copy suffix (` - Copy`, ` (2)`). | String append. |
| `mojibake` | The string's bytes read in the wrong encoding. | `TextEncoder` to UTF-8, then `TextDecoder('windows-1252')` or `TextDecoder('shift_jis')`. |
| `truncate` | An 8.3 short name: first six characters, upper case, `~1`. | Rule. |
| `form` | The civil-registry shape: `SURNAME, GIVEN M.` in upper case. | Rule over authored name parts. |
| `flip` | One bit of one byte flipped, then decoded; an invalid sequence shows as U+FFFD. | Byte arithmetic, `TextDecoder` with `fatal: false`. |
| `lose` | The row is struck through and its lineage ends. | State flag. |

`share` is neither kind. It is the reader's act: see Sharing.

Weights for how often each operation occurs are in the data file, so Xyh can
tune the balance without touching code.

## Lexicon

A separate data file, `namefile.data.js`, in the form the suite's other pages
can load without a build step. Authored by Xyh. Shape:

```js
export default {
  name: {
    variants: [ { text: "", script: "latin", note: "" } ],
    mishearings: [ "" ],
    translations: [ { from: "", to: "", lang: "" } ],
    parts: { surname: "", given: "", middle: "" }
  },
  house:  { variants: [], translations: [] },
  island: {
    claims: [ { claimant: "", name: "", script: "" } ]
  },
  weights: { copy: 3, rename: 3, mojibake: 1 },
  lines: [ "" ]            // optional authored verse with {name} {house} {island}
};
```

The builder ships the file with empty arrays and one obviously fake test entry
per field, clearly marked, so the page runs before Xyh fills it. The fake
entries are removed before publishing.

For reference only, spellings of the name that appear elsewhere in this
workspace: `Xyh`, `xyh`, `zxyh`, `Cye G. Tamura`, `Cy Tamura`,
`TAMURA, CYE G.`. Whether any of these go in is Xyh's decision, as is every
form in Japanese script.

## Instances and sharing

Each load is one instance.

- A seeded random generator (mulberry32 or similar) drives every choice. The
  seed is in the URL fragment: `namefile.html#s=4f2a91`.
- A load with no fragment picks a new seed and writes it to the fragment. A
  refresh without the fragment is therefore a different poem, and the same
  link always replays the same poem.
- `share` is a control that copies the current link. Whoever opens it receives
  that exact lineage. This makes sharing literal: the reader passes a version
  on.
- `fork` as a reader control: a link that keeps the lineage so far and takes a
  new seed from that point (`#s=4f2a91&at=12&f=77c0`). The fork shows its
  parent's rows, then diverges.

No server, no storage beyond the URL. Nothing about the reader is recorded.

## Pacing and stop

- One step every few seconds at reading pace, set by one constant.
- The lineage stops after a fixed number of steps (suggest 24 to 40, a
  constant), or earlier if every branch has been lost. The final state stays
  on screen. It does not loop on its own.
- Use `setTimeout`, not `requestAnimationFrame`, so it advances when the tab
  is in the background.
- `prefers-reduced-motion`: render the whole lineage at once.

## Constraints

- Static, build-free: `namefile.html`, `namefile.data.js`, and at most one
  script and one stylesheet. Served at
  `http://localhost:8000/of-another-shore/namefile.html` by the root server.
  Do not start another server.
- No Microsoft icons or fonts ([../ASSETS.md](../ASSETS.md)). A file-manager
  look is drawn in CSS and inline SVG with a system font stack, or the
  typeface the other pages use.
- No network calls. No machine translation. No transliteration by rule; a
  wrong reading of a name in kana or kanji is worse than none.
- Rows are real text in the DOM, in order, so the poem can be selected, read
  by a screen reader, and copied. The operation and owner columns are text
  too.
- Follow the look of the existing pages (`dungan.html`) unless Xyh says
  otherwise. Interface text is plain: a control says what it does.
- Do not touch `index.html`, which has uncommitted changes by someone else.
  Linking the piece from the index is a separate step for Xyh.

## Validation

Check the thing, not that it ran.

1. **Determinism.** Load the same `#s=` link twice and compare the text of the
   listing. Identical. Load without a fragment twice. Different.
2. **Mojibake is real.** `é` through UTF-8 then windows-1252 is `Ã©`. Assert
   it in a test run (`?test` in the query prints pass or fail for each
   mechanical operation).
3. **Nothing invented.** For a full lineage, every state of the name segment
   is either an authored entry or the output of a mechanical operation applied
   to one. Assert it in the same test run.
4. **Fork.** A fork link shows the parent's first `at` rows unchanged and
   differs after them.
5. **Stop.** The lineage ends at the step limit and the page is still.
6. **Hidden tab.** With the Browser pane hidden, the row count still grows.
   Read the DOM, do not screenshot.
7. **Empty lexicon.** With all arrays empty the page says the lexicon is
   empty and does not throw.

## Not in this version

- Sound, or the name spoken.
- Words in "dungan" or "encyclopedia" changing on refresh. Xyh raised it; it
  is a change to existing poems and a separate decision.
- A time-travel poem, also raised by Xyh, also separate.
- Any record of which versions readers made or shared.

## Open questions

1. Is the listing the right surface, or should it read as a version-control
   log (`commit`, `branch`, `merge`), or as plain lines of verse with no
   interface dress at all?
2. Does the house have an owner too, or only the island?
3. Should a lost branch be able to come back? The suite has the dead
   returning; a `restore` operation would be the file-system form of it.
