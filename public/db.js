// import { response } from "express";
let db;
// create a new db request for a "finances" database.
const request = window.indexedDB.open("finances", 1);
request.onupgradeneeded = function(event) {
  // create object store called "pending" and set autoIncrement to true
  const db = event.target.result;
  const pendingObStore = db.createObjectStore("Pending", { autoIncrement:true });
  pendingObStore.createIndex("transactionIndex", "transaction");
};
request.onsuccess = function(event) {
  db = event.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};
request.onerror = function(event) {
  // log error here 
};
function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  const transaction = db.transaction(["Pending"], "readwrite");
  // access your pending object store
  const pendingObStore = transaction.objectStore("Pending");
  // add record to your store with add method.
  pendingObStore.add(record);
}
function checkDatabase() {
  // open a transaction on your pending db
  const db = request.result;
  const transaction = db.transaction(["Pending"], "readonly");
  // access your pending object store
  const pendingObStore = transaction.objectStore("Pending");
  // get all records from store and set to a variable
  const getAll = pendingObStore.getAll();
  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
          // if successful, open a transaction on your pending db
          const transaction = db.transaction(["Pending"], "readwrite");
          // access your pending object store
          const pendingObStore = transaction.objectStore("Pending");
          // clear all items in your store
          pendingObStore.clear();
      });
    }
  };
}
// listen for app coming back online
window.addEventListener("online", checkDatabase);