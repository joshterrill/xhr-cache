# XHR Cache

A wrapper around `fetch()` that caches the results from your network calls. If you make a network call that has already been made, it will return the results from a cache and **not** make another XHR request.

### Usage

```javascript
// blacklists to never cache URL's can be added via regex patterns, then call createBlacklist() and pass it in
const blacklist = [["GET", /github/g]];
createBlackList(blacklist)

const res = xhrCache("http://someurl.com/here", {method: "GET", ttl: 5000})
res.then(data => console.log(data));
```

### License

MIT