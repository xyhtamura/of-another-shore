# Spec: a name handled as a file

2026-10-08 — Claude Code. Built the same day as `namefile.html`,
`namefile.js`, `namefile.css`, and `namefile.data.js`. The title is Xyh's to
give. Where the build departs from this spec, the [build record](#build-record)
at the end is the current statement.

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

## Build record

2026-10-08 — Claude Code — first build.

Xyh's direction for the build, 2026-10-08: the source for the name is the essay
"Why I am Shifting My Name"; the nickname `futatabi-san` (from 再び) goes in;
corruptions are welcome; the land should be one that has been contested, and its
name should be corrupted too; internet search can be drawn in, as in `cutline/`.

### What changed from the spec

- **`search` is a new operation, and the piece now makes network calls.** It
  sends the current text of one segment to Wikipedia (`en`, or `ja` when the
  text has kana or kanji) and replaces the segment with what comes back: the
  "did you mean" suggestion if there is one, otherwise one of the first five
  titles. No results and no connection each leave the segment unchanged and say
  so in the operation column. This replaces "No network calls" under
  Constraints. Machine translation and transliteration by rule are still out.
- **Search results are a third kind of state**, beside authored and mechanical.
  A name can therefore become a stranger's name. That is the web's answer, not
  the engine's, and the row is marked `search`.
- **Search results are held in the link.** After each search the page writes the
  result into the fragment as `&w=`. A link with `w` replays without asking
  Wikipedia again. A bare `#s=` link replays the same choices but asks again, so
  it can drift as Wikipedia changes.
- **The island is Pag-asa (Thitu) in the Spratlys.** Seven claims: Philippines,
  China, Taiwan, Vietnam, Tomás Cloma's Freedomland, the Hokkien fishers' 鐵峙,
  and the chart name Thitu. Names and dates are from the English Wikipedia
  article, read 2026-10-08. Draft choice; Xyh to confirm.
- **`restore` is in** (open question 3). A lost branch can come back.
- **The house has no owner of its own** (open question 2). The owner column is
  the island's claimant.
- **The lexicon is filled, not shipped empty.** The name entries come from the
  essay. The house entries are a draft by Claude Code.
- **Weights apply to operations, then segments.** An operation is chosen by its
  weight alone; the segment it acts on is chosen second, by `segments`.
- **A conflict freezes its segment for authored operations and for search.**
  Mechanical operations still apply, to both sides at once as one string. The
  two sides are shown joined by `|` on later rows.
- **Date column.** An authored date where the entry has one, `—` where it does
  not, and the reader's clock for mechanical and search rows. The clock time is
  not part of the replayed poem.
- **`?test` and `?empty`** in the query string run the self-tests and an empty
  lexicon.

### Verified, and how

All in the Browser pane at `http://localhost:8000/of-another-shore/namefile.html`.

- `?test`: 17 of 17 pass. Covers each mechanical operation against a known
  answer, one seed twice, two seeds, replay from held search results with no
  network, fork head and divergence, the step limit, every weighted operation
  occurring, and "nothing invented" over 300 lineages (9,692 rows, 0 name states
  unaccounted for). Search is stubbed in the tests.
- Live search: read the DOM of a full run. Wikipedia returned suggestions and
  titles and the fragment gained `&w=`.
- Paced mode with the pane hidden (`document.hidden` true): rows arrived about
  every 3 s. The first version counted 100 ms ticks and stalled at one row; it
  now waits to a wall-clock deadline.
- Reduced motion: this pane reports it, and the whole lineage rendered at once.
- "Fork from this row": the first 12 rows were unchanged after the click.
- `?empty`: the status line names the three missing lists; no console error.
- 375 px wide: no horizontal scroll (`scrollWidth` 375).

### Not done

- `index.html` does not link to the piece. It has someone else's uncommitted
  changes.
- No authored verse. `lines` in the data file is empty.
- Nothing is pushed. Before it is: Xyh reads `namefile.data.js` as a public
  file. It holds `Cye`, `Cy Tamura`, `Cye Tamura`, the middle initial `G.`, and
  the nickname. It does not hold the friend's handle or the name Gumban.
- The Japanese wartime name for the island is left out. 三角島 could not be
  confirmed; only the group name 新南群島 was.
- `Thih-tu` → `Thitu` is not an authored hop. The article gives the Hokkien
  reading and the chart name but does not say one came from the other.
- Pause and "Copy link" were not clicked in testing. "New instance" was
  exercised only through the same `hashchange` path the fork button uses.
- `DEVNOTES.md` is deleted in the working tree, uncommitted, by someone else.
  This record is here for that reason.
- Open question 1 (listing, version-control log, or plain verse) is still open.
  The build is the listing.

2026-10-08 — Claude Code — desktop view.

Xyh, after the first build: make it more graphic, icons that multiply on a
desktop, scrolling down as in `ephemeralrenders/cinderella stairs`; placeholder
icons for now; opening a house like a folder can come later.

- **The page is now a desktop that scrolls down.** Each step puts one icon on
  it, following a sine down the page with one phase per branch. The page follows
  the newest icon. The listing is still built and is behind "Show listing".
- **The icon is of the segment the step touched**: a file for the name, a house,
  or an island, labelled with that segment's new text. Fork, lose, and restore
  show the name. Clicking an icon selects it and puts its path, operation, and
  owner in the taskbar.
- **Each operation changes the picture.** A copy leaves four earlier paintings
  behind it. Mojibake skews and recolours. A flip inverts one square, placed by
  the bit and byte. Truncate cuts the icon short. A lost row is grey and struck.
  A conflict shows two icons overlapped. A search that changed the text carries
  a magnifier. The island's flag colour is computed from the owner's name.
- **Icons are placeholders drawn as inline SVG** in `namefile.html`, so nothing
  needs a licence. `icons` in the data file takes an image path per segment to
  replace them. Tango is the public-domain set already checked in
  [../ASSETS.md](../ASSETS.md).
- Labels are clamped to two lines, as on a desktop, and open in full on hover,
  focus, or selection. The whole text is in the DOM either way.

Verified in the Browser pane: `?test` still 17 of 17; seed `00000e` drew 21
icons for 21 rows with no console error; with reduced motion overridden the
page scrolled to keep the newest icon centred (`scrollY` 467 at step 10);
clicking an icon selected it and filled the taskbar line; "Show listing" swapped
the two views (read from the `hidden` properties, the screenshot lagged).

Not done: the desktop was not checked at phone width. Long labels on adjacent
steps can overlap when opened. One icon per step is sparse next to the stairs
reel; multiplying faster is a design choice still open. Houses do not open.

2026-10-08 — Claude Code — moving desktop.

Xyh: an autoscrolling fake desktop, like a screensaver. Files pop up, copy, and
fork downwards; files that leave the window are removed; wallpapers can come
from public-domain images later.

- **The desktop fills the window and does not scroll by hand.** The icons slide
  up one row per step. A new icon pops in 72% of the way down (`ANCHOR`), and an
  icon that has passed the top is removed from the page. The listing keeps every
  row, so the text of the whole lineage is still there.
- **A copy pops two to five more icons**, stepping down and to the right. This
  replaces the ghost trail. The count comes from the step number, so a link
  replays it. `copy` is weighted 5, up from 3.
- **Wallpapers.** `wallpapers` in the data file takes image paths; each instance
  shows one, chosen by its seed. Empty leaves the gradient.
- **Reduced motion** keeps the earlier behaviour: nothing moves, every icon is
  laid out on a tall page, and nothing is removed. `?motion` in the query string
  forces the moving desktop.
- The lineage still stops at the step limit, and the desktop stops with it.

Verified in the Browser pane with `?motion#s=00000f`: `?test` 17 of 17; at step
15 the page held 15 icons for 16 rows and 7 copy extras, so icons past the top
had been removed; the document did not scroll (`scrollHeight` equal to the
window height); no console error; a screenshot showed the cascade and the newest
icon near the anchor.

Not done: not watched from start to stop by eye, and not checked at phone width.
The pane was hidden for part of the run, where transitions do not advance, so
the smoothness of the movement is unconfirmed. No wallpaper image has been
tried. Whether it should loop like a screensaver instead of stopping is Xyh's
call.

2026-10-08 — Claude Code — engine opened to another page.

`ephemeralrenders/cinderella stairs/desktop.html` is an offline experiment that
draws the lineage as files on a Windows XP desktop, using an asset pack that
cannot be published. It imports `run`, `mulberry32`, and `wikiSearch` from
`namefile.js`. For that: a segment weighted 0 in `segments` is now left alone
entirely; a fork row carries `from` and a merge row carries `with`, the other
branch's id; and the page code at the bottom of `namefile.js` runs only where
the listing table exists. `?test` still passes 17 of 17. `namefile.html` itself
is unchanged in behaviour.

2026-10-08 — Claude Code — `things` added to `namefile.data.js`: andesite,
milkfish, ILOVEYOU, and Gopher, each with the shape of `name`. Xyh asked for
geology, a species, a virus, and a protocol, one of each, as alternate-world
versions. The entries are a draft by Claude Code, from memory and not checked
against a source; the one I am least sure of is `Andes` → `安山` as the origin
of 安山岩. Only the offline XP desktop page reads `things`. `namefile.html`
ignores it.
