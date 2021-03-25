const { matchesEventNameRe } = require('./lib/global-event-handlers.js')
const ENCODED = true
const UNENCODED = false
const FAILSAFE = Symbol('failsafe')
let DEBUG = false

const log_passthrough = (msg = '', x) => {
  if (DEBUG) console.log(msg, x)
  return x
}

// This list is specifically mentioned in documentation. If you edit this
// list, please update the documentation.
let _ignored_entities = [
  '&emdash',
  '&raquo',
  '&laquo',
  '&nbsp',
  '&copy',
  '&cent',
  '&euro',
  '&yen',
  '&reg',
  '&ldquo',
  '&rdquo',
]

const setIgnoredEntities = (list, overwrite) =>
  overwrite ? (_ignored_entities = list) : _ignored_entities.push(list)

const get_re_multiplier = (outcome) => (outcome ? outcome.length : 0)
const matching_rules = [
  {
    name: 'script-tag',
    score: (txt) =>
      txt.match(/<\s*s["'+]*c["'+]*r["'+]*i["'+]*p["'+]*t\b/gi) ? FAILSAFE : 0,
  },
  {
    name: 'embed-tag',
    score: (txt) =>
      txt.match(/<\s*e["'+]*m["'+]*b["'+]*e["'+]*d\b/gi) ? FAILSAFE : 0,
  },
  {
    name: 'object-tag',
    score: (txt) =>
      txt.match(/<\s*o["'+]*b["'+]*j["'+]*e["'+]*c["'+]*t\b/gi) ? FAILSAFE : 0,
  },
  {
    name: 'global-event-handler',
    score: (txt) => (matchesEventNameRe(txt) ? FAILSAFE : 0),
  },
  {
    name: 'angles',
    score: (txt) => get_re_multiplier(txt.match(/<\w+.*?>/g)) * -1,
  },
  {
    name: 'escaped',
    // The regex here gets complicated, because we're looking for encoded characters but not
    // &nbsp since that character tends to be repeated a _lot_ in some content.
    score: (txt) => {
      let copy = `${txt}`
      _ignored_entities.forEach((x) => (copy = copy.replaceAll(x, '')))
      let old_debug = DEBUG
      DEBUG = true
      log_passthrough('COPY:', copy)
      DEBUG = old_debug
      return get_re_multiplier(copy.match(/&#?\w{2,};?/gi))
    },
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

const checkEncoding = (txt) => {
  const checked = matching_rules.reduce(
    (acc, cur) => score_reducer(txt, acc, cur),
    { matches: [], score: 0 },
  )

  // A failsafe!
  if (checked.score === FAILSAFE) {
    return UNENCODED
  }

  return log_passthrough(`Score «${txt}»: `, checked.score) > 0
    ? ENCODED
    : UNENCODED
}

module.exports = {
  setIgnoredEntities,
  checkEncoding,
}
