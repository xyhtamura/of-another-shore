# Of Another Shore — development notes

Captured 2026-07-28. Ramble-dump, not a spec. Nothing here is committed to
implementation yet; some of it will be cut.

Current state of the ground we're standing on: `index.html` is the new vertical
scroll — one continuous `#panorama` of zones (`#sky`, `#sea`, `#shore`,
`#shelf`, `#strata`, with `#house` and `#basement` nested), spots hyperlinked
out to the individual poems, a legend rail, a hit counter, `encyclopedia.md`
sitting in a panel. Older attempts kept around: `oldindex.html` (the rhizomic
one), `indexold.html`, `newindex.html`, `indexreact.html`, `index - Copy.html`.

---

## 1. The bullseye — feel before structure

The thing to hit first is a **feel**, not an architecture. Somewhere between:

- an Encarta-era edutainment game
- a webring / GeoCities page
- a geology or geography diagram — cross-section, plate labels, `FIG. 1`
- an interactive map

If the work is perfectly rhizomic but doesn't feel like *browsing a strange
90s CD-ROM*, the mark is already missed. Structure is negotiable; the feel is
the target.

This is a priority ordering, not a dismissal of structure. Rhizome is the
outermost ring of the target. Feel is the bullseye.

Evidence for this ordering: the first index (`oldindex.html`) **was** already
rhizomic, and it still didn't give the vibe. So rhizome alone doesn't produce
it.

## 2. Give up on total accessibility

Committing to this: **not every poem is reachable from the front page.** Some
poems can only be arrived at from inside other poems, or through an unlock, or
not at all in a given traversal.

The current flat list exists because the work needed to be legible for class
evaluation. As a finished artifact, that reason is gone. A list is not the
shape of this thing.

## 3. Ultimate structure: enter from anywhere

Long-term, Of Another Shore has no front door. Wiki-like: you click from one
poem and land at some other poem, place, or site. "Main site" is scaffolding
language for now — useful while building, meant to dissolve.

But: we start arboreal. Not out of preference — out of not having any way to
*visualize* or *author* the rhizome yet. The tree is the drafting surface. It
can be cut into a network later; that's a much cheaper move than the reverse.

## 4. Scale structure — macro / mezzo / micro

The vertical scroll should work **as a poem in itself**, read top to bottom.
Not a menu of poems: an intermediate poem (text + sound + visual) that you
read by scrolling.

So the zones are verses:

```
sky   →  sea   →  shore  →  shelf  →  strata        macro poem (the scroll)
  └ mezzo poems inside each zone (verse-scale)
      └ micro poems (line-scale), clicked open
          └ micro-micro …
```

Each scale should poeticize the one above it — lines poeticizing verses,
verses poeticizing the whole descent. Reaching the bottom should feel like
reaching the end of a poem, not the end of a list.

**Windows.** Try having some of the small poems open as `div`s / windowed
pop-ups *inside* the big poem rather than navigating away. Keeps the macro
poem present underneath; makes the reading feel layered rather than
sequential. (Also very on-register for the 90s desktop feel.)

**Nesting is allowed — the mix is the point.** (Revised 2026-07-28.) Some poems
really will be reachable through exactly one page, and that's correct rather
than a compromise: those micro poems genuinely *are* part of the bigger poem,
not independent works filed under it. Totally flat reads as structureless. The
target is **mostly flat with arboreal pockets** — local depth inside a wide
network, not a hierarchy with a root.

So §3 and §4 aren't actually in conflict. Drop the earlier framing that called
it a tension to be resolved later.

## 5. The container problem — and the inversion

**The diagnosis.** Scrolling the current `index.html` feels like moving through
a *layout*, not through a poem. The sequence sky → sea → shore → shelf → strata
isn't doing anything — it isn't active, it doesn't build. It's a container for
links. The wish is to feel like you're *experiencing* something poetic and for
that to **strengthen as you move down the page**.

There's a structural reason for this, and it's measurable. `index.html` holds
**30 outbound poem links (25 unique)**. The poems themselves hold almost none:

| poem | outlinks |
|---|---|
| `inmanchuria.html`, `dungan.html` | 4 |
| `sandstoneschistandesite.html` | 2 |
| `memorypalace.html`, `adobar.html`, `argence.html`, `blueprint.html`, `aleaffalling.html`, `dreamwindowreturn.html`, `iwantedtothinkabouttimeiwanted.html` | 1 |
| `nightbus`, `moonmilk`, `now`, `quoineconomics`, `sanddollarexchange`, `escarpmentpinks`, `afterwemisremberthegrains` | 0 |

The index feels like a container because it *is* one — it's carrying the entire
link load of the work. The rhizome mostly doesn't exist yet in the poems; it
exists in the hub. (Memory Palace, which reads as the exemplar of a poem that
links out, has exactly one link out — to `nightbus.html`.)

**The inversion — worth trying.** Instead of making the index more poem-like,
make **each poem more like the vertical index.** Push the Encarta / diagram /
90s-website feel *down into* the poems, so that opening any poem already puts
you inside that atmosphere, and links out of it happen as a matter of course
while you read.

Why this is probably the strong move:

- It fixes the container problem by **removing the container's job**. If every
  poem carries the feel and the links, no hub has to supply either.
- It dissolves §1-vs-§3 for real: the rhizome stops needing a front page to
  make it feel rich, because richness is distributed into the nodes.
- It's incremental and testable per poem — no big-bang rebuild.
- Two poems (`inmanchuria`, `dungan`) are already halfway there at 4 outlinks
  each; they're the models, not Memory Palace.

Corollary either way: **most elements on the page should be active.** Not
decorative illustration with a link attached — things that respond, play,
change, accumulate.

## 6. Game-like elements

Raise the interaction ceiling past "scroll and click a link."

- Reading a poem — or clicking something inside it — **gives you an item.**
- The item is **used on an object elsewhere** in the vertical map.
- That unlocks another poem, or a mode, or a device.
- Some unlocks aren't poems at all: a player you can make sounds with, a
  toy, a machine.

Object → poem seeds (obvious, generative ones):

| object in the map | opens |
|---|---|
| a clock | `bodyclocks.html` |
| a radio | `nightbus.html` (plays) |
| ... | ... |

Also fair game as inhabitants of the map: live data, ambient/random sounds,
things that change with the real world's time. Junk, in the good sense —
the accumulated clutter of a personal site.

**Unresolved: who remembers?** If items (or words, or fragments) can be picked
up, something has to hold that state across pages — cookie, localStorage,
sessionStorage, URL, or nothing at all. Not decided, and not urgent to decide.

Worth noting the entanglement: this question gets *harder* the more the work
goes rhizomic. A single scroll can keep state in the page. A network you enter
from anywhere has no guaranteed first page to initialize anything, no
guaranteed order, no exit. So "where does inventory live" is really a question
about **what a session even is** in a work with no front door — and that may
turn out to be a reason to make picked-up things re-earnable and local rather
than persistent and global.

## 7. Two branches, developed in parallel

**Branch A — the interactive vertical scroll.** Evolve from the current
`index.html`. Arboreal for now. Zones as verses, windows as micro poems,
items and unlocks. This is the branch aimed at the bullseye (§1).

**Branch B — the random door.** Take the *existing* poems, rework them, and
make `index.html` do nothing but **redirect randomly to one of them.** That's
how you start Of Another Shore. No overview, no list, no map. Tests whether
the rhizome plus reworked pieces can carry the feel by itself — the question
`oldindex.html` left open.

These don't conflict. A's tree can be cut into a network later; B tells us
early whether the network needs the tree at all.

---

## Open questions

- Where does item state live, and what is a "session" in a work with no front
  door? (See §6. Cookie / localStorage / nothing — re-earned each visit is more
  90s and maybe more honest.)
- If the inversion (§5) goes far enough, does the vertical index survive at all
  — or does it become just one more poem among the others, entered like any
  other?
- If poems open as windows inside the scroll, what happens when someone lands
  on that poem's URL directly from elsewhere in the rhizome? Same content, two
  presentations.
- Does the scroll have a *soundtrack* at macro scale, or only per-zone /
  per-object sound?
- Which existing poems get reworked for Branch B, and how much rework counts
  as rework?

## Next thing to actually try

Pick one poem — most likely `nightbus.html` or `moonmilk.html`, both currently
at zero outlinks and short — and rebuild it under §5: give it the index's
atmosphere (plate labels, diagram furniture, active elements, sound) and three
or four honest links out. Then look at it next to the vertical scroll and see
which one feels more like Of Another Shore.
