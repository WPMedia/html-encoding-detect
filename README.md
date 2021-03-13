# html-encoding-detect

Detect HTML encoding

## Usage

```js
const {check_encoding} require('html-encoding-detect')

const safe_html = check_encoding( potentially_dangerous ) ? potentially_dangerous : encode(potentially_dangerous);
```

The `check_encoding()` function attempts to detect whether or not the HTML is HTML-entity encoded. While the algorithm here attempts to account for sloppy encoding, it isn't going to be perfect if the HTML encoding is imperfect.

## Fail-Safes

While this function does attempt to detect sloppy encoding, the following will trigger a guaranteed `false`.

- All `<script` tags with the angle bracket unencoded, including those with intentional separation such as `<scr"+"ipt`.
- All `<object` tags with the angle bracket unencoded, including those with intentional separation such as `<obj"+"ect`.
- All `<embed` tags with the angle bracket unencoded, including those with intentional separation such as `<em"+"bed`.
- All `onload` attributes with unencoded quotation marks.

These are because such items could trigger the execution of script code.

## Author

- Michael D. Stemle, Jr.
