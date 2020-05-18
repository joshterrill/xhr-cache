# XHR Cache

A wrapper around `fetch()` that caches the results from your network calls. If you make a network call that has already been made, it will return the results from a cache and **not** make another XHR request.

Note: **This is functional, but still a work in progress.**

### Usage

```javascript
const res = xhrCache("http://someurl.com/here", {method: "GET", ttl: 5000})
res.then(data => console.log(data));
```

### Features Needed

* Implement blacklist and whitelist

### License

MIT