let CURRENT_VERSION = 1; //Change this everytime data structure changes
let DATABASE_NAME = "RubyDB";

export function initialize() {
    let req = indexedDB.open(DATABASE_NAME, CURRENT_VERSION);

    req.onupgradeneeded = function () {
        let db = req.result;
        db.createObjectStore("RubyGameData", { keyPath: "id" });
        db.createObjectStore("KeysValues", { keyPath: "id" });
        console.log('indexedDb initialized');
    }
}

export function set(collectionName, data, id) {
    let req = indexedDB.open(DATABASE_NAME, CURRENT_VERSION);

    req.onsuccess = function () {
        let transaction = req.result.transaction(collectionName, "readwrite");
        let collection = transaction.objectStore(collectionName)
        collection.put({ id: id, value: data });
    };

    req.onerror = function () {
        console.log("Couldn't set database");
    };
    req.onblocked = function () {
        console.log("Couldn't delete database due to the operation being blocked");
    };
}

export async function get(collectionName, id) {
    let request = new Promise((resolve) => {
        let req = indexedDB.open(DATABASE_NAME, CURRENT_VERSION);
        req.onsuccess = function () {
            try {
                let transaction = req.result.transaction(collectionName, "readonly");

                let collection = transaction.objectStore(collectionName);
                let objectStoreRequest = collection.get(id);

                objectStoreRequest.onsuccess = (event) => {
                    resolve(objectStoreRequest.result);
                };
            }
            catch (error) {
                console.warn('transaction failed on ' + collectionName + '. ' + error);
                resolve(null);
            }
        };

        req.onerror = function () {
            console.log("Couldn't get database");
        };
        req.onblocked = function () {
            console.log("Couldn't delete database due to the operation being blocked");
        };
    });

    let result = await request;

    return result;
}

export function deleteDatabase() {
    //Warning : ca bloque, puis ca met un moment avant que la DB soit effacée. Ou alors le debuger de chrome merde

    let req = indexedDB.deleteDatabase(DATABASE_NAME);
    req.onsuccess = function () {
        console.log("Deleted database successfully");
    };
    req.onerror = function () {
        console.log("Couldn't delete database");
    };
    req.onblocked = function () {
        console.log("Couldn't delete database due to the operation being blocked");
    };
}