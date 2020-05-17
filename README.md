# XHR Cache [WIP]

A wrapper around `fetch()` that caches the results from your network calls. If you make a network call that has already been made, it will return the results from a cache and **not** make another XHR request.

Note: **This is still a work in progress.**

### Usage

```javascript
const res = xhrCache("http://someurl.com/here", {method: "GET"})
res.then(data => console.log(data));
```

### Features Needed

* Implement TTL
* Implement blacklist and whitelist

### License

MIT