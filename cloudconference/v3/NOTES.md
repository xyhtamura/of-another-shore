# Cloud Conference v3

Cloud Conference v3 is one seven-line changing verse. It withholds speaker
labels and presents each line as a fragment from the same interrupted call.
Line breaks mark changes of channel rather than complete statements.

## Edit the verse data

[weather-lines.json](weather-lines.json) contains the authored text and its
selection rules. Each object in `lines` has these fields:

- `id` matches one colored phrase in `cloudconference.html`.
- `source` selects a city or `internet`.
- `prefix` and `suffix` hold the fixed part of the line.
- `rules` are tested from top to bottom. The first matching rule supplies an
  option.
- `when` combines conditions with AND. For example, humidity above `80` and
  temperature above `28` requires both values to match.
- `options` holds phrases for that condition. Selecting a colored phrase cycles
  through its matching options.

Supported weather fields are `temperature`, `humidity`, `precipitation`,
`cloudCover`, `windSpeed`, and `windDirection`. Supported network fields are
`online`, `effectiveType`, `rtt`, `downlink`, and `requestTime`. The `_guide`
object at the top of the JSON file records units and template syntax.

The weather values come from the
[Open-Meteo forecast API](https://open-meteo.com/en/docs). Browser connection
estimates come from the
[Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation),
which is unavailable in some browsers. `requestTime`, measured from the weather
request, remains available when the browser omits `rtt` and `downlink`.

## Work log

2026-09-05 — Codex — Added v3 without changing v1 or v2. The v1 single-verse
form remains, but seven phrases vary through ordered weather and network rules.
The writing uses partial calls, lazy abstractions, misplaced deliveries, and
small domestic events instead of named speakers or an explanatory ENSO
dialogue. Verified at `http://localhost:8000/of-another-shore/cloudconference/v3/cloudconference.html`:
Open-Meteo returned six city reports, the internet line used a measured live
request time when needed, selecting a phrase changed only that fragment,
refreshing conditions completed, and the console contained no errors. At a
`390 × 844` viewport, the document had no horizontal overflow and no ellipsis
was stranded as a separate text node. The parent repository's `DEVNOTES.md`
remained deleted in the existing working tree and was not restored.

2026-09-05 — Codex — Reworked the v3 page as a compact weather-relay window.
Pearl and lavender translucency, narrow desktop chrome, a fictional address
field, underlined version links, beveled controls, and a tiled screen texture
combine glass-era and old-web references. The low-radius window, restrained
palette, single reading field, and status-bar layout separate it from
`bodyclocks.html`, which uses saturated aqua and lime, large rounded glass
cards, and a calendar-dashboard composition. The verse data and selection
logic did not change. Verified the complete page in the in-app browser at
`http://localhost:8000/of-another-shore/cloudconference/v3/cloudconference.html`.
At a `390 × 844` viewport, the document had no horizontal overflow. Selecting
the Manila phrase changed its text, and **Refresh conditions** completed with
stored weather when the live request was unavailable. The restored v1 and v2
files and the existing `DEVNOTES.md` deletion remained untouched.
