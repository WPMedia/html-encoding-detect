const eventNames = [
  'onabort',
  'onanimationcancel',
  'onanimationend',
  'onanimationiteration',
  'onauxclick',
  'onblur',
  'oncancel',
  'oncanplay',
  'oncanplaythrough',
  'onchange',
  'onclick',
  'onclose',
  'oncontextmenu',
  'oncuechange',
  'ondblclick',
  'ondurationchange',
  'onended',
  'onerror',
  'onfocus',
  'onformdata',
  'ongotpointercapture',
  'oninput',
  'oninvalid',
  'onkeydown',
  'onkeypress',
  'onkeyup',
  'onload',
  'onloadeddata',
  'onloadedmetadata',
  'onloadend',
  'onloadstart',
  'onlostpointercapture',
  'onmousedown',
  'onmouseenter',
  'onmouseleave',
  'onmousemove',
  'onmouseout',
  'onmouseover',
  'onmouseup',
  'onpause',
  'onplay',
  'onplaying',
  'onpointercancel',
  'onpointerdown',
  'onpointerenter',
  'onpointerleave',
  'onpointermove',
  'onpointerout',
  'onpointerover',
  'onpointerup',
  'onreset',
  'onresize',
  'onscroll',
  'onselect',
  'onselectionchange',
  'onselectstart',
  'onsubmit',
  'ontouchcancel',
  'ontouchstart',
  'ontransitioncancel',
  'ontransitionend',
  'onwheel',
]

const eventNameRes = eventNames.map(
  (name) => new RegExp(`\\b${name}\\s*?=\\s*?[^&]['"]?.*?['"]?`, 'igsm'),
)

const matchesEventNameRe = (str) =>
  eventNameRes.find((re) => str.match(re) !== null)

module.exports = {
  eventNames,
  eventNameRes,
  matchesEventNameRe,
}