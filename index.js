const ENCODED = true
const UNENCODED = false
const FAILSAFE = Symbol('failsafe')

/*
const log_passthrough = (msg = '', x) => {
  console.log(msg, x)
  return x
}
*/

const score_threshold = 4

const get_re_multiplier = (outcome) => (outcome ? outcome.length : 0)
const matching_rules = [
  {
    name: 'script-tag',
    score: (txt) =>
      txt.match(/<\s*s["'+]*c["'+]*r["'+]*i["'+]*p["'+]*t\b/ig) ? FAILSAFE : 0,
  },
  {
    name: 'embed-tag',
    score: (txt) =>
      txt.match(/<\s*e["'+]*m["'+]*b["'+]*e["'+]*d\b/ig) ? FAILSAFE : 0,
  },
  {
    name: 'object-tag',
    score: (txt) =>
      txt.match(/<\s*o["'+]*b["'+]*j["'+]*e["'+]*c["'+]*t\b/ig) ? FAILSAFE : 0,
  },
  {
    name: 'onload-attribute',
    score: (txt) =>
      txt.match(/\bonload=[^&]['"]?.*?['"]?/g) ? FAILSAFE : 0,
  },
  {
    name: 'angles',
    score: (txt) => get_re_multiplier(txt.match(/<\w+.*?>/g)) * -3,
  },
  {
    name: 'escaped',
    // The regex here gets complicated, because we're looking for encoded characters but not
    // &nbsp since that character tends to be repeated a _lot_ in some content.
    score: (txt) => get_re_multiplier(txt.match(/&(?!nbsp)#?\w{2,};?/gi)) * 2,
  },
]

const matches_rule = (txt, rule) => rule.score(txt) != 0

const score_reducer = (txt, acc, cur) =>
  matches_rule(txt, cur)
    ? {
        matches: [...acc.matches, cur.name],
        score:
          acc.score === FAILSAFE || cur.score(txt) === FAILSAFE
            ? FAILSAFE
            : acc.score + cur.score(txt),
      }
    : acc

const check_encoding = (txt) => {
  const checked = matching_rules.reduce(
    (acc, cur) => score_reducer(txt, acc, cur),
    { matches: [], score: 0 },
  )

  // A failsafe!
  if (checked.score === FAILSAFE) {
    return UNENCODED
  }

  return checked.score >= score_threshold
    ? ENCODED
    : UNENCODED
}

module.exports = {
  check_encoding,
}
