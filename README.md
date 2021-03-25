# html-encoding-detect

Detect HTML encoding

## Usage

```js
const {checkEncoding, setIgnoredEntities} require('html-encoding-detect')

const safe_html = checkEncoding( potentially_dangerous ) ? potentially_dangerous : encode(potentially_dangerous);
```

The `checkEncoding()` function attempts to detect whether or not the HTML is HTML-entity encoded. While the algorithm here attempts to account for sloppy encoding, it isn't going to be perfect if the HTML encoding is imperfect.

## Fail-Safes

While this function does attempt to detect sloppy encoding, the following will trigger a guaranteed `false`.

- All `<script` tags with the angle bracket unencoded, including those with intentional separation such as `<scr"+"ipt`.
- All `<object` tags with the angle bracket unencoded, including those with intentional separation such as `<obj"+"ect`.
- All `<embed` tags with the angle bracket unencoded, including those with intentional separation such as `<em"+"bed`.
- All Global Event Handler attributes with unencoded quotation marks.

The list of Global Event Handlers can be found here: https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers

These are because such items could trigger the execution of script code.

## Ignoring certain entities in consideration

Different folks use different entities for punctuation, formatting, and localization purposes. The default list of entities which are ignored for these reasons are:

- `&nbsp`
- `&raquo`
- `&laquo`
- `&emdash`
- `&copy`
- `&cent`
- `&euro`
- `&yen`
- `&reg`
- `&ldquo`
- `&rdquo`

If you would like to add additional ignored entities, use the `setIgnoredEntities()` function.

```js
// Overwrite the list of ignored entities
setIgnoredEntities( ['&nbsp'], true )

// Add to the existing list of ignored entities
setIgnoredEntities( ['&#x1F600'], false )
```

You can also use regular expressions in `setIgnoredEntities()`, so if you wish to ignore all UTF-8 code points through ASCII, you could add this:

```js
setIgnoredEntities( [/&#x[0-7]\w\b/smxg, /&#(\d{1,2}|[0-1][1-2]\d)\b/smxg ], false )
```

## Special note on UTF-8

If you're using UTF-8, and you run into issues, please submit an issue with samples so that I can see what you're running. While most characters in UTF-8 can have an encoded value in HTML entity encoding (e.g. 긴in Korean could be represented as `&#xAE34`), they are usually encoded literally rather than in entity encoding.

## Author

- Michael D. Stemle, Jr.

