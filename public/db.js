let db;
// create a new db request for a "finances" database.
const request = window.indexedDB.open("finances", 1);


request.onupgradeneeded = function(event) {
  // create object store called "pending" and set autoIncrement to true
  const db = event.target.result;
  const pendingObjStore = db.createObjectStore("Pending", { autoIncrement:true });
  pendingObjStore.createIndex("purchasingIndex", "purchasing")
};

request.onsuccess = function(event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  // log error here
  if (err) throw err
};

function saveRecord(record) {
  // create a purchasing on the pending db with readwrite access
  const purchasing = db.transaction(["Pending"], "readwrite");
  // access your pending object store
  const pendingObjStore = purchasing.objectStore("Pending");
  // add record to your store with add method.
  pendingObjStore.add(record);
}

function checkDatabase() {
  // open a purchasing on your pending db
  const db = request.result;
  const purchasing = db.transaction(["Pending"], "readonly");
  // access your pending object store
  const pendingObjStore = purchasing.objectStore("Pending");
  // get all records from store and set to a variable
  const getAll = pendingObjStore.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/purchasing/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
          // if successful, open a purchasing on your pending db
          const purchasing = db.transaction(["Pending"], "readonly")
          // access your pending object store
          const pendingObjStore = purchasing.objectStore("Pending");
          // clear all items in your store
          pendingObjStore.clear();
      });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);