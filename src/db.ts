import { Loop } from "./lyrcs";

const dbName = 'abLoopRecorderDB';
const dbVersion = 1;
const storeName = 'Loops';

// Open a database
const request = indexedDB.open(dbName, dbVersion);
let db: any;
request.onupgradeneeded = event => {
  db = (event.target as any).result;
  // Create an object store in the database
  db.createObjectStore(storeName, { keyPath: 'start' });
};

request.onsuccess = event => {
  db = (event.target as any).result;
  console.log("successfully loaded DB");
};

export function saveLoop(loop: Loop) {
  // Add some objects to the store
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);
  store.put(loop).onerror = () => {
    store.add(loop);
  }
}

export function saveLoops(loops: Loop[]) {
  if (loops.length === 0) return;
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);
  loops.forEach((loop) => {
    store.add(loop);
  });
}

export function updateLoop(loop: Loop) {
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);
  store.put(loop).onsuccess = () => {
    console.log('Object updated');
  }
}

export function deleteLoop(loop: Loop) {
  // Add some objects to the store
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);

  const deleteRequest = store.delete(loop.start);
  deleteRequest.onsuccess = () => {
    console.log('Object with deleted');
  };
}

export function deleteSaveLoop(start: number, loop:Loop) {
  // Add some objects to the store
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);

  const deleteRequest = store.delete(start);
  deleteRequest.onsuccess = () => {
    // console.log('Object deleted');
  };

  store.put(loop).onerror = () => {
    store.add(loop);
  }
}

export function retrieveLoops(completion: (loops: Loop[]) => void) {
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);
  // Retrieve all objects from the store
  const getAllRequest = store.getAll();
  getAllRequest.onsuccess = (event:any) => {
    completion(event.target.result);
  };
  getAllRequest.onerror = (e:any) => {
    console.error(e);
    completion([]);
  }
}

export function removeAllLoops() {
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);
  store.clear().onsuccess = () => {
    console.log("reset db.");
  };
}