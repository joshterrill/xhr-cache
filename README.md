# XHR Cache [WIP]

A wrapper around `fetch()` that caches the results from your network calls. If you make a network call that has already been made, it will return the results from a cache and **not** make another XHR request.

**This is still a work in progress**

### Usage

Include in HTML:

```html
<script src="https://unpkg.com/xhr-cache@latest/index.js"></script>
```

Then somewhere in javascript...

```javascript
// blacklists to never cache URL's can be added via regex patterns, then call createBlacklist() and pass it in
const blacklist = [["GET", /github/g]];
createBlackList(blacklist)

// if no ttl is set, it never expires
const res = xhrCache("http://someurl.com/here", {method: "GET", ttl: 5000})
res.then(data => console.log(data));
```

### Still being worked on

* Making this a module so it can be `import`ed and pulled in using `require`.
* Add option for setting global headers
* Add option for clearing cache

### License

MIT
