const dbName = "xhr_cache_store";
const xhrBlacklist = [];
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

function createBlacklist(list = []) {
    xhrBlacklist.push(...list);
}

function checkBlacklist(method, url) {
    return xhrBlacklist.find(i => i[0] === method && url.match(i[1]));
}

function createStore(db) {
    const objectStore = db.createObjectStore("requests", { keyPath: "urlMethod" });
    objectStore.onsuccess = function (event) {
        console.info("XHRCache Created Store");
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
        const { method, ttl } = options;
        let expires = undefined;
        if (ttl) {
            expires = new Date().getTime() + ttl;
        }
        const save = {
            urlMethod: `${url}:::${method}`,
            url,
            method,
            expires,
            data,
        };
        requestObjectStore.add(save);
        db.close();
    }
}

function checkCache(url, options) {
    return new Promise(resolve => {
        if (checkBlacklist(options.method, url)) {
            resolve(false);
        } else {
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
                        const key = `${url}:::${method}`;
                        const data = requestObjectStore.get(key);
                        data.onsuccess = function (event) {
                            const record = event.target.result;
                            if (record && record.expires && record.expires >= new Date().getTime()) {
                                db.close();
                                resolve(record);
                            } else if (record) {
                                requestObjectStore.delete(key)
                            }
                            db.close();
                            resolve(false);
                        }
                    } catch (error) {
                        db.close();
                        resolve(false);
                    }
                }
            }     
        }
    });
}
