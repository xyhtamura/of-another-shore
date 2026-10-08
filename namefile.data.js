// Lexicon for namefile.html. Authored data: the engine reorders these entries
// and damages them mechanically. It never writes a new variant of the name.
//
// This file is public once pushed. Every entry in it is published with it.
//
// Sources, 2026-10-08:
//   name   — "Why I am Shifting My Name" (Xyh), plus the nicknames Xyh supplied.
//   house  — DRAFT by Claude Code. Xyh to check, cut, or replace.
//   island — Pag-asa (Thitu), Spratly Islands. Names, claimants, and dates from
//            https://en.wikipedia.org/wiki/Thitu_Island, read 2026-10-08.
//            DRAFT choice of island; Xyh to confirm.

export default {
  name: {
    // script: entries with the same script are spellings of each other
    // (rename); entries with different scripts are transliterations.
    variants: [
      { text: "再", script: "kanji" },
      { text: "田村再", script: "kanji" },
      { text: "zài", script: "pinyin" },
      { text: "Cy", script: "latin" },
      { text: "Cye", script: "latin" },
      { text: "Cy Tamura", script: "latin" },
      { text: "Cye Tamura", script: "latin" },
      { text: "xy", script: "latin" },
      { text: "xcy", script: "latin" },
      { text: "cxy", script: "latin" },
      { text: "czy", script: "latin" },
      { text: "çy", script: "latin" },
      { text: "sai", script: "latin" },
      { text: "xye", script: "latin" },
      { text: "xygh", script: "latin" },
      { text: "xyh", script: "latin" },
      { text: "Xyh", script: "latin" },
      { text: "zxyh", script: "latin" },
      { text: "xyh tamura", script: "latin" }
    ],
    // by: shown beside the operation. date: optional, shown in the date column.
    mishearings: [
      { text: "Cye", by: "a nurse" },
      { text: "Cyrus", by: "a stranger" },
      { text: "Cyril", by: "a stranger" },
      { text: "sigh", by: "English" },
      { text: "excy", by: "a reader" },
      { text: "cexy", by: "a reader" },
      { text: "futatabi-san", by: "a friend", date: "2022-06-17" }
    ],
    // One authored hop each. A chain happens when one hop's "to" is another's "from".
    translations: [
      { from: "再", to: "re-", lang: "ja→en" },
      { from: "再", to: "again", lang: "ja→en" },
      { from: "再", to: "再び", lang: "ja" },
      { from: "再", to: "一再", lang: "ja" },
      { from: "再", to: "再セット", lang: "ja" },
      { from: "再", to: "再考", lang: "ja" },
      { from: "再", to: "再創造", lang: "ja" },
      { from: "再", to: "zài", lang: "ja→zh" },
      { from: "再び", to: "a second time", lang: "ja→en" },
      { from: "一再", to: "repeatedly", lang: "ja→en" },
      { from: "再セット", to: "reset", lang: "ja→en" },
      { from: "再考", to: "rethink", lang: "ja→en" },
      { from: "再創造", to: "recreate", lang: "ja→en" },
      { from: "re-", to: "再", lang: "en→ja" },
      { from: "again", to: "再", lang: "en→ja" },
      { from: "a second time", to: "再び", lang: "en→ja" },
      { from: "zài", to: "再", lang: "zh→ja" }
    ],
    // Used by the "form" operation: SURNAME, GIVEN M.
    parts: { surname: "Tamura", given: "Cye", middle: "G." }
  },

  house: {
    variants: [
      { text: "house", script: "latin" },
      { text: "home", script: "latin" },
      { text: "balay", script: "latin" },
      { text: "bahay", script: "latin" },
      { text: "casa", script: "latin" },
      { text: "家", script: "kanji" },
      { text: "田村家", script: "kanji" }
    ],
    translations: [
      { from: "house", to: "balay", lang: "en→hil" },
      { from: "balay", to: "bahay", lang: "hil→tl" },
      { from: "bahay", to: "casa", lang: "tl→es" },
      { from: "casa", to: "house", lang: "es→en" },
      { from: "house", to: "家", lang: "en→ja" },
      { from: "家", to: "family", lang: "ja→en" },
      { from: "家", to: "home", lang: "ja→en" },
      { from: "family", to: "家", lang: "en→ja" },
      { from: "home", to: "balay", lang: "en→hil" }
    ]
  },

  island: {
    // "chown" moves the island to another claim: the owner and the name change
    // together. date: optional, shown in the date column.
    claims: [
      { claimant: "Philippines", name: "Pag-asa", date: "1971-07-29" },
      { claimant: "China", name: "中业岛" },
      { claimant: "Taiwan", name: "中業島", date: "1946-12-12" },
      { claimant: "Vietnam", name: "Đảo Thị Tứ", date: "1963-05-22" },
      { claimant: "Tomás Cloma", name: "Freedomland", date: "1956-05" },
      { claimant: "Hokkien fishers", name: "鐵峙" },
      { claimant: "a sea chart", name: "Thitu" }
    ],
    translations: [
      { from: "Pag-asa", to: "hope", lang: "tl→en" },
      { from: "hope", to: "Pag-asa", lang: "en→tl" },
      { from: "鐵峙", to: "Thih-tu", lang: "nan" },
      { from: "Thih-tu", to: "iron shoal", lang: "nan→en" },
      { from: "Freedomland", to: "Kalayaan", lang: "en→tl" },
      { from: "Kalayaan", to: "freedom", lang: "tl→en" }
    ]
  },

  // Other things that are versioned the way the name is, one of each kind.
  // Each has the same shape as "name" without "parts". DRAFT by Claude Code,
  // 2026-10-08; Xyh to check, cut, or replace. Every entry is a name the thing
  // has really had, except the mishearings, which are marked by who "heard" it.
  //   andesite  — named for the Andes; 安山岩 writes "Andes" as 安山.
  //   milkfish  — Chanos chanos, first described as Mugil chanos (Forsskål, 1775).
  //   ILOVEYOU  — the 2000 worm released from Manila, and what vendors and the
  //               press called it. The attachment's filename is the fourth entry.
  //   Gopher    — the protocol the web displaced: RFC 1436, port 70. Veronica
  //               and Jughead were its search tools.
  things: [
    {
      kind: "geology",
      variants: [
        { text: "andesite", script: "latin" },
        { text: "andésite", script: "latin" },
        { text: "Andesit", script: "latin" },
        { text: "andesita", script: "latin" },
        { text: "安山岩", script: "kanji" }
      ],
      mishearings: [
        { text: "and a site", by: "a listener" },
        { text: "anthracite", by: "a student" }
      ],
      translations: [
        { from: "andesite", to: "Andes", lang: "etymology" },
        { from: "Andes", to: "安山", lang: "kanji" },
        { from: "安山", to: "安山岩", lang: "ja" },
        { from: "安山岩", to: "andesite", lang: "ja→en" }
      ]
    },
    {
      kind: "species",
      variants: [
        { text: "milkfish", script: "latin" },
        { text: "bangus", script: "latin" },
        { text: "bangús", script: "latin" },
        { text: "Chanos chanos", script: "latin" },
        { text: "Mugil chanos", script: "latin" },
        { text: "awa", script: "latin" },
        { text: "ikan bandeng", script: "latin" },
        { text: "サバヒー", script: "kana" },
        { text: "虱目魚", script: "kanji" }
      ],
      mishearings: [
        { text: "Chaos chaos", by: "a typist" },
        { text: "bang us", by: "a spellchecker" }
      ],
      translations: [
        { from: "bangus", to: "milkfish", lang: "tl→en" },
        { from: "milkfish", to: "bangus", lang: "en→tl" },
        { from: "milkfish", to: "サバヒー", lang: "en→ja" },
        { from: "サバヒー", to: "虱目魚", lang: "ja→zh" },
        { from: "虱目魚", to: "milkfish", lang: "zh→en" },
        { from: "milkfish", to: "awa", lang: "en→haw" }
      ]
    },
    {
      kind: "virus",
      variants: [
        { text: "ILOVEYOU", script: "latin" },
        { text: "Love Bug", script: "latin" },
        { text: "Love Letter", script: "latin" },
        { text: "LOVE-LETTER-FOR-YOU.TXT.vbs", script: "latin" },
        { text: "VBS/LoveLetter", script: "latin" },
        { text: "VBS.LoveLetter.A", script: "latin" },
        { text: "I-Worm.LoveLetter", script: "latin" }
      ],
      mishearings: [
        { text: "LOVE-LETTER-FOR-YOU.TXT", by: "a mail client" },
        { text: "I love you", by: "a recipient" }
      ],
      translations: [
        { from: "I love you", to: "mahal kita", lang: "en→tl" },
        { from: "mahal kita", to: "I love you", lang: "tl→en" },
        { from: "I love you", to: "愛してる", lang: "en→ja" },
        { from: "愛してる", to: "I love you", lang: "ja→en" }
      ]
    },
    {
      kind: "protocol",
      variants: [
        { text: "Gopher", script: "latin" },
        { text: "gopher://", script: "latin" },
        { text: "RFC 1436", script: "latin" },
        { text: "port 70", script: "latin" },
        { text: "Gopherspace", script: "latin" },
        { text: "Veronica", script: "latin" },
        { text: "Jughead", script: "latin" }
      ],
      mishearings: [
        { text: "gofer", by: "its authors" },
        { text: "go for", by: "its authors" }
      ],
      translations: []
    }
  ],

  // How often each operation is chosen, relative to the others. 0 turns one off.
  weights: {
    rename: 4, transliterate: 3, mishear: 3, translate: 4, chown: 3,
    fork: 2, merge: 2,
    copy: 5, mojibake: 3, truncate: 1, form: 1, flip: 2,
    lose: 1, restore: 1,
    search: 2
  },

  // How often each part of the path is the one operated on.
  segments: { name: 6, house: 2, island: 3 },

  // Desktop icons. An empty string uses the placeholder drawn in
  // namefile.html. Otherwise give an image path relative to that page, e.g.
  // "img/namefile/house.png". Record the licence of anything added here; see
  // ../ASSETS.md.
  icons: { name: "", house: "", island: "" },

  // Desktop wallpapers: image paths relative to the page. Each instance shows
  // one, chosen by its seed. Empty uses the plain gradient. Same licence rule.
  wallpapers: [],

  // Optional authored verse, shown above the listing. {name}, {house}, and
  // {island} show the current state of each segment.
  lines: []
};
