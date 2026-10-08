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

  // How often each operation is chosen, relative to the others. 0 turns one off.
  weights: {
    rename: 4, transliterate: 3, mishear: 3, translate: 4, chown: 3,
    fork: 2, merge: 2,
    copy: 3, mojibake: 3, truncate: 1, form: 1, flip: 2,
    lose: 1, restore: 1,
    search: 2
  },

  // How often each part of the path is the one operated on.
  segments: { name: 6, house: 2, island: 3 },

  // Optional authored verse, shown above the listing. {name}, {house}, and
  // {island} show the current state of each segment.
  lines: []
};
