const fs = require('fs')
const { checkEncoding } = require('../')
const composerData = require('./from_composer.json')
const { encode } = require('html-entities')

const test_data = [
  ['<p>unencoded HTML</p>', false, 'Simple unencoded HTML'],
  ['<img onload="alert(`hiya!`)">', false, 'Unencoded img with onload'],
  ['&lt;img src="http://foo.com/bar.jpg" /&gt;', true, 'Encoded img without'],
  [
    '&lt;img onload="alert(`hiya!`)"&gt;',
    false,
    'Encoded img with onload unescaped quotes',
  ],
  [
    '&lt;img onload=&#34;alert(`hiya!`)&#34;&gt;',
    true,
    'Encoded img with onload escaped quotes',
  ],
  [
    '&lt;img onload=&quot;alert(`hiya!`)&quot;&gt;',
    true,
    'Encoded img with onload name-escaped quotes',
  ],
  ['&lt;p&gt;already encoded!&lt;/p&gt;', true, 'Simple encoded HTML'],
  ['&lt;pre&gt;This > that&lt;/pre&gt;', true, 'Mixed encoding.'],
  ['document.write("foo!")', false, 'Simple document.write() call'],
  [
    'document.write("<scr"+"ipt>alert(\\"foo\\")</scr"+"ipt>")',
    false,
    'Alerting document.write() call',
  ],
  [
    '&lt;p&gt;<script>alert("foo!");</script>&lt;/&gt;',
    false,
    'Encoded everything but verbatim script tag',
  ],
  [
    '&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<script>alert("gotcha?!")</script>',
    false,
    'Someone trying to screw with the algorithm',
  ],
  [
    '<figure><div class=\\"foo\\" data-type=\\"blah\\" data-quote=\\"blah blah Blobbidy blah\\" data-source=\\"Who knows?\\"></div><script async src=\\"//some.hostname.com/foo.js\\" charset=\\"utf-8\\"></figure>',
    false,
    'Unescaped HTML with JSON-style encoding inappropriately applied.',
  ],
  [
    '<figure><div class=\\"foo\\" \ndata-type=\\"blah\\" \ndata-quote=\\"blah blah Blobbidy blah\\" \ndata-source=\\"Who knows?\\"></div><script async src=\\"//some.hostname.com/foo.js\\" \ncharset=\\"utf-8\\"></figure>',
    false,
    'Unescaped HTML with JSON-style encoding inappropriately applied, this time with newlines!.',
  ],
  [
    '&lt;figure&gt;&lt;div class=\\"foo\\" \ndata-type=\\"blah\\" \ndata-quote=\\"blah blah Blobbidy blah\\" \ndata-source=\\"Who knows?\\"&gt;&lt;/div&gt;&lt;script async src=\\"//some.hostname.com/foo.js\\" \ncharset=\\"utf-8\\"&gt;&lt;/figure&gt;',
    true,
    'Poorly-escaped HTML with JSON-style encoding inappropriately applied, this time with newlines!.',
  ],
]

test.each(test_data)('checkEncoding( "%s" ) == %s // %s', (txt, expected) =>
  expect(checkEncoding(txt)).toBe(expected),
)
test.each(composerData)('composer data «%s» == %p', (name, expected, obj) =>
  expect(checkEncoding(obj.content)).toBe(expected ? true : false),
)

const pbTests = fs
  .readdirSync('./__tests__/pagebuilder/', { withFileTypes: true })
  .filter((x) => x.isFile())
  .filter((x) => x.name.match(/^\w+.*?\.(html?|json|js)$/i))
  .map((x) => [x.name])
test.each(pbTests)(`pagebuilder data «%s»`, (name) => {
  const rawData = fs
    .readFileSync(`./__tests__/pagebuilder/${name}`)
    .toString('utf8')
  const encodedAll = encode(rawData, { level: 'all' })
  const encodedXml = encode(rawData, { level: 'xml' })
  const encodedNonPrintable = encode(rawData, { mode: 'nonAsciiPrintable' })

  expect(checkEncoding(rawData)).toBe(false)
  expect(checkEncoding(encodedAll)).toBe(true)
  expect(checkEncoding(encodedXml)).toBe(true)
  expect(checkEncoding(encodedNonPrintable)).toBe(true)
})
