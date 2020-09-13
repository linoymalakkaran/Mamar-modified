var createIndexDB = function () {
    // This works on all devices/browsers, and uses IndexedDBShim as a final fallback 
    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

    // Open (or create) the database
    var open = indexedDB.open("MamarLocal", 1);

    // Create the schema
    open.onupgradeneeded = function () {
        var db = open.result;
        var store = db.createObjectStore("Lookups", { keyPath: "id" });
    };

    open.onsuccess = function () {
    }
}

var storeData = function (dataValues, dataType, centreCode) {
    if (dataValues) {
        var open = indexedDB.open("MamarLocal", 1);

        open.onsuccess = function () {
            var db = open.result;
            var tx = db.transaction("Lookups", "readwrite");
            var store = tx.objectStore("Lookups");
            store.put({
                id: dataType + '_' + centreCode, data: dataValues
            });
            // Close the db when the transaction is done
            tx.oncomplete = function () {
                db.close();
            };
        }
    }
}

var getIndexData = function (dataType, centreCode, onsuccess, onFailure) {
    var open = indexedDB.open("MamarLocal", 1);
    open.onsuccess = function () {
        var db = open.result;
        var tx = db.transaction("Lookups", "readwrite");
        var store = tx.objectStore("Lookups");

        var data = store.get(dataType + '_' + centreCode);
        data.onsuccess = function () {
            if (data && data.result)
                onsuccess(data.result.data);
            else
                onFailure();
        };

        // Close the db when the transaction is done
        tx.oncomplete = function () {
            db.close();
        };
        return data;

    }


}

var deleteIndexDB = function () {
    window.indexedDB.deleteDatabase('MamarLocal');
}