const dbName = "xhr_cache_store";
function xhrCache(url, options) {
    return new Promise((resolve, reject) => {
        options.method = options.method || "GET";
        checkCache(url, options).then(result => {
                if (result) {
                    resolve(result);
                } else {
                    fetch(url, options).then(res => {
                        res.json().then(data => {
                            cacheData(url, options, data);
                            resolve({data, url, method: options.method})
                        });
                    }).catch(err => reject(err));
                }
           
        });
    });

}

function createStore(db) {
    const objectStore = db.createObjectStore("requests", { keyPath: "urlMethod" });
    console.log("creating object store", objectStore);
    objectStore.onsuccess = function (event) {
        console.info("Created object store");
    }
}

function cacheData(url, options, data) {
    const cacheRequest = indexedDB.open(dbName);
    cacheRequest.onupgradeneeded = function(event) { 
        const db = event.target.result;
        if (!db.objectStoreNames.length || !db.objectStoreNames.contains("requests")) {
            createStore(db);
        }
    };

    cacheRequest.onsuccess = function (event) {
        const db = event.target.result;
        const requestObjectStore = db.transaction(["requests"], "readwrite").objectStore("requests");
        const method = options.method;
        const save = {
            urlMethod: `${url}:::${method}`,
            url,
            method,
            data,
        };
        requestObjectStore.add(save);
        db.close();
    }
}

function checkCache(url, options) {
    return new Promise(resolve => {
        const checkCacheRequest = indexedDB.open(dbName);
        checkCacheRequest.onupgradeneeded = function (event) {
            const db = event.target.result;
            if (!db.objectStoreNames.length || !db.objectStoreNames.contains("requests")) {
                createStore(db);
            }
        }
        checkCacheRequest.onsuccess = function (event) {
            const db = event.target.result;
            if (!db.objectStoreNames.length || !db.objectStoreNames.contains("requests")) {
                db.close();
                resolve(false);
            } else {
                try {
                    const requestObjectStore = db.transaction(["requests"], "readwrite").objectStore("requests");
                    const method = options.method;
                    const data = requestObjectStore.get(`${url}:::${method}`);
                    data.onsuccess = function (event) {
                        if (event.target.result) {
                            db.close();
                            resolve(event.target.result);
                        } else {
                            db.close();
                            resolve(false);
                        }
                    }
                } catch (error) {
                    db.close();
                    resolve(false);
                }
            }
        }
    });
}
