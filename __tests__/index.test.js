const fs = require('fs')
const { check_encoding, ENCODED, UNENCODED } = require('../')
const composerData = require('./from_composer.json')
const { encode } = require('html-entities')

const test_data = [
  ['<p>unencoded HTML</p>', UNENCODED, 'Simple unencoded HTML'],
  ['<img onload="alert(`hiya!`)">', UNENCODED, 'Unencoded img with onload'],
  [
    '&lt;img src="http://foo.com/bar.jpg" /&gt;',
    ENCODED,
    'Encoded img without',
  ],
  [
    '&lt;img onload="alert(`hiya!`)"&gt;',
    UNENCODED,
    'Encoded img with onload unescaped quotes',
  ],
  [
    '&lt;img onload=&#34;alert(`hiya!`)&#34;&gt;',
    ENCODED,
    'Encoded img with onload escaped quotes',
  ],
  [
    '&lt;img onload=&quot;alert(`hiya!`)&quot;&gt;',
    ENCODED,
    'Encoded img with onload name-escaped quotes',
  ],
  ['&lt;p&gt;already encoded!&lt;/p&gt;', ENCODED, 'Simple encoded HTML'],
  ['&lt;pre&gt;This > that&lt;/pre&gt;', ENCODED, 'Mixed encoding.'],
  ['document.write("foo!")', UNENCODED, 'Simple document.write() call'],
  [
    'document.write("<scr"+"ipt>alert(\\"foo\\")</scr"+"ipt>")',
    UNENCODED,
    'Alerting document.write() call',
  ],
  [
    '&lt;p&gt;<script>alert("foo!");</script>&lt;/&gt;',
    UNENCODED,
    'Encoded everything but verbatim script tag',
  ],
  [
    '&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<script>alert("gotcha?!")</script>',
    UNENCODED,
    'Someone trying to screw with the algorithm',
  ],
]

test.each(test_data)('check_encoding( "%s" ) == %s // %s', (txt, expected) =>
  expect(check_encoding(txt)).toBe(expected),
)
test.each(composerData)('composer data «%s» == %p', (name, expected, obj) =>
  expect(check_encoding(obj.content)).toBe(expected ? ENCODED : UNENCODED),
)

const pbTests = fs
  .readdirSync('./__tests__/pagebuilder/', { withFileTypes: true })
  .filter((x) => x.isFile())
  .filter((x) => x.name.match(/^\w+.*?\.(html?|json|js)$/i))
  .map((x) => [x.name])
test.each(pbTests)(`pagebuilder data «%s»`, (name) => {
  const rawData = fs.readFileSync(`./__tests__/pagebuilder/${name}`).toString('utf8')
  const encodedAll = encode(rawData, { level: 'all' })
  const encodedXml = encode(rawData, { level: 'xml' })
  const encodedNonPrintable = encode(rawData, { mode: 'nonAsciiPrintable' })

  expect(check_encoding(rawData)).toBe(UNENCODED)
  expect(check_encoding(encodedAll)).toBe(ENCODED)
  expect(check_encoding(encodedXml)).toBe(ENCODED)
  expect(check_encoding(encodedNonPrintable)).toBe(ENCODED)
})
