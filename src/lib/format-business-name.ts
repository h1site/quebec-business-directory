/**
 * Normalize Quebec business names from the registry.
 *
 * DB sample shows three case styles:
 *   - 437/2000 ALL UPPERCASE  (e.g. "PLACEMENTS MYRNACO INC.")
 *   - 9/2000 all lowercase    (e.g. "bar tiradito")
 *   - 539/2000 Mixed/Title    (e.g. "TELUS Santé (Canada)")
 *   - 15/2000 something else  (mostly already-styled brands)
 *
 * Rule: if the original already has BOTH upper AND lower case characters,
 * we trust whoever entered it — that's a curated brand styling like "TELUS".
 * Otherwise we Title Case it with French/Quebec-specific rules.
 */

// Words that stay lowercase when they appear mid-name (after the first word).
const FR_LOWERCASE = new Set([
  'de', 'du', 'des', 'le', 'la', 'les',
  'et', 'ou', 'ni',
  'à', 'au', 'aux', 'en', 'dans', 'sur', 'sous',
  'pour', 'par', 'avec',
  'que', 'qui',
])

// Quebec corporate suffixes — canonical casing.
const CORP_SUFFIXES: Record<string, string> = {
  inc: 'Inc.',
  'inc.': 'Inc.',
  ltd: 'Ltd',
  'ltd.': 'Ltd.',
  ltée: 'Ltée',
  'ltée.': 'Ltée.',
  ltee: 'Ltée',
  'ltee.': 'Ltée.',
  enr: 'Enr.',
  'enr.': 'Enr.',
  senc: 'SENC',
  sencrl: 'SENCRL',
  llc: 'LLC',
  'co.': 'Co.',
  co: 'Co.',
  cie: 'Cie',
  'cie.': 'Cie.',
}

// Capitalize one "word" (sequence of letters) handling apostrophes and hyphens internally.
function capWord(w: string, isFirst: boolean): string {
  if (!w) return w
  const lower = w.toLowerCase()

  // Corporate suffix?
  if (CORP_SUFFIXES[lower]) return CORP_SUFFIXES[lower]

  // Initials / acronyms with internal dots: "D.D.", "U.S.A.", "S.E.N.C." → keep uppercase
  if (/^[A-Za-z](\.[A-Za-z])+\.?$/.test(w)) {
    return w.toUpperCase()
  }

  // French connector (mid-name only — first word always gets capitalized)
  if (!isFirst && FR_LOWERCASE.has(lower)) return lower

  // Apostrophe-bearing words: "d'amour" → "d'Amour", "l'atelier" (mid) → "l'Atelier"
  // For the first word the leading letter is capitalized too: "L'Atelier"
  if (lower.includes("'") || lower.includes('’')) {
    return lower.split(/(['’])/).map((part, i) => {
      if (part === "'" || part === '’') return part
      if (!part) return part
      // First short prefix ("l", "d", "qu", etc.): cap only if isFirst
      if (i === 0 && part.length <= 2) {
        return isFirst ? part.charAt(0).toUpperCase() + part.slice(1) : part
      }
      return part.charAt(0).toUpperCase() + part.slice(1)
    }).join('')
  }

  // Hyphenated word: "pilote-dufour" → "Pilote-Dufour"
  if (lower.includes('-')) {
    return lower.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('-')
  }

  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

/**
 * Format a business name from the Quebec registry for display.
 *
 * Examples:
 *   "bar tiradito"                        → "Bar Tiradito"
 *   "PLACEMENTS MYRNACO INC."             → "Placements Myrnaco Inc."
 *   "LA FONDATION BERNARD ET MIRIAM KOHN" → "La Fondation Bernard et Miriam Kohn"
 *   "TELUS Santé (Canada)"                → "TELUS Santé (Canada)"   (untouched)
 *   "DR FRANÇOIS PILOTE-DUFOUR INC."      → "Dr François Pilote-Dufour Inc."
 */
export function formatBusinessName(name: string | null | undefined): string {
  if (!name) return ''

  // Already mixed case? Trust the source.
  const hasUpper = /[A-ZÀ-Ý]/.test(name)
  const hasLower = /[a-zà-ý]/.test(name)
  if (hasUpper && hasLower) return name

  // Split on whitespace, keeping the whitespace tokens so we can rejoin verbatim.
  const tokens = name.split(/(\s+)/)
  let firstWordSeen = false
  return tokens
    .map((tok) => {
      if (/^\s+$/.test(tok)) return tok
      if (!tok) return tok
      // Pure punctuation / number → leave alone
      if (!/[a-zA-ZÀ-Ýà-ý]/.test(tok)) return tok
      const isFirst = !firstWordSeen
      firstWordSeen = true
      return capWord(tok, isFirst)
    })
    .join('')
}
