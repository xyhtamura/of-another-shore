# Of Another Shore development notes

Hypertext collection of poems, video, audio, and interactive works. The main
entry is `index.html`; individual works also have direct URLs.

## Next in development

Trace the family trade-business chronology against the post-1985 investment
history before developing an original nonfiction essay. The dates, business
activity, and reason for travel are still needed to establish the connection
to Xyh's parents meeting.

## 2026-10-27 — Codex — External historical reading

Xyh proposed a Wikipedia-like network connecting the works to historical
articles, with original nonfiction as a possible later development. Xyh chose
links to existing articles for this pass. “BDO” in the spoken request was
interpreted as BPO because the request specified the call-center industry.

- `bigboat.html` links to [PIDS on the Philippine IT-BPM sector](https://pids.gov.ph/details/human-capital-investment-could-improve-it-bpm-sector-in-ph-says-bsp-researcher)
  and [ILO on offshoring and working conditions](https://www.ilo.org/resource/news/ilo-book-sheds-light-working-conditions-remote-work-industry).
  These cover English proficiency, labor costs, call centers, night work, and
  electronic monitoring. The ILO page is a 2010 press release about a study;
  it is not the study's full text or a current industry survey.
- `inmanchuria.html` links “the japanese are visiting again.” to the
  [National Diet Library's account of the 1931 invasion](https://www.ndl.go.jp/modern/e/cha4/description01.html),
  with a descriptive link repeated after the poem. The poem's wording is unchanged.
- `thingsmyparentsthoughtwheniwasunborn.html` links to
  [Kazuhiko Ishida's 1994 paper on Japanese investment in East Asia](https://www.rba.gov.au/publications/confs/1994/ishida.html).
  This placement is provisional. The paper identifies yen appreciation after
  the 1985 Plaza Agreement, trade friction, export restrictions, and wage costs
  as reasons for overseas production. It supports the regional mechanism;
  the connection to the family trade business remains unresolved.
- `reading.css` styles the external reading lists with underlined links,
  keyboard focus indicators, and wrapping text.

The existing [causal-chains note](note-causal-chains-ph-jp-pacific.md), section D,
already identified the Plaza Accord lead and the missing family connection.
A case-insensitive search for the Plaza Accord, trade restrictions, yen
appreciation, Japanese imports, and Japan/Southeast Asia combinations found
no matching passage in `../profiles/diary/` or `../texts/of another shore/`.
This does not rule out other wording or diaries stored elsewhere.

Read the four source pages through web retrieval. Saved the PIDS, ILO, and
National Diet Library HTML pages under `../library/of-another-shore/` and checked
their titles and content. RBA's server denied the direct download; an attempted
official mirror did not resolve. The RBA page was readable through web retrieval,
but no local copy of that paper was retained.

Original internal reference entries were considered, then dropped because Xyh
selected external links. No original essay was drafted. No family causal claim
was added to the site. The collection had no entry in the root roadmap or shared
development notes file; added both, retaining the two existing research notes.

Verification: loaded all three edited pages in the in-app browser and read
their accessibility trees. Inspected the BPO reading list and parents page at
the browser's 477-pixel-wide view; the reading links wrapped within the page.
Followed the inline Manchuria link to the National Diet Library article and
the investment link to the RBA paper, and read the destination pages in the
browser. A local check resolved each edited page's relative assets, compared
the poems' text against `HEAD` after stripping HTML, and found no wording changes
or suspicious invisible Unicode. `git diff --check` passed. The PIDS and ILO
destinations were checked through web retrieval; their links were not clicked
in the browser. Deployment remains undone.
