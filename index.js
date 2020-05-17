const dbName = "xhr_cache_store";
let db;

function xhrCache(url, options) {
    return new Promise((resolve, reject) => {
        checkCache(url, options).then(result => {
            if (result) {
                resolve(result);
            } else {
                fetch(url, options).then(res => {
                    res.json().then(data => {
                        resolve(data)
                        console.log("going to cache data");
                        cacheData(url, options, data);
                    });
                }).catch(err => reject(err));
            }
        });
    });

}

function cacheData(url, options, data) {
    const request = indexedDB.open(dbName, 1);

    request.onerror = function (event) {
        console.error(event);
    }

    request.onupgradeneeded = function(event) { 
        console.log("upgrade needed");
        db = event.target.result;
        const objectStore = db.createObjectStore("requests", { keyPath: "urlMethod" });
        objectStore.onsuccess = function (event) {
            console.info("Created object store");
        }
    };

    request.onsuccess = function (event) {
        console.log("onsuccess");
        db = event.target.result;
        const requestObjectStore = db.transaction(["requests"], "readwrite").objectStore("requests");
        const method = options.method || "GET";
        const save = {
            urlMethod: `${url}:::${method}`,
            url,
            method,
            data,
        };
        requestObjectStore.add(save);
    }
}

function checkCache(url, options) {
    return new Promise(resolve => {
        const request = indexedDB.open(dbName, 1);
        request.onsuccess = function (event) {
            db = event.target.result;
            try {
                const requestObjectStore = db.transaction("requests", "readwrite").objectStore("requests");
                const method = options.method || "GET";
                const data = requestObjectStore.get(`${url}:::${method}`);
                data.onsuccess = function (event) {
                    if (event.target.result) {
                        resolve(event.target.result);
                    } else {
                        resolve(null);
                    }
                }
            } catch (error) {
                resolve(null);
            }
        }
    });
}
