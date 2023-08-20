import { Loop } from "./lyrcs";

const dbName = 'abLoopRecorderDB';
const dbVersion = 3;
const storeName = 'Loops';
const mediaStoreName = 'Media';
const mediaStoreKey = 'media';

// Open a database
const request = indexedDB.open(dbName, dbVersion);
let db: any;
request.onupgradeneeded = event => {
  db = (event.target as any).result;
  // Create an object store in the database
  if (!db.objectStoreNames.contains(storeName))
    db.createObjectStore(storeName, { keyPath: 'start' });
  if (!db.objectStoreNames.contains(mediaStoreName))
    db.createObjectStore(mediaStoreName);
};

let queues: (() => void)[] = [];
request.onsuccess = event => {
  db = (event.target as any).result;
  queues.forEach(cb => {
    cb();
  })
  queues.length = 0;
  console.log("successfully loaded DB");
};

request.onerror = e => {
  console.error((e.target as any | undefined).error.message);
}

export function saveMedia(media: Blob) {
  const transaction = db.transaction(mediaStoreName, 'readwrite');
  const store = transaction.objectStore(mediaStoreName);
  store.put(media, mediaStoreKey);
}

export function removeMedia() {
  // Add some objects to the store
  const transaction = db.transaction(mediaStoreName, 'readwrite');
  const store = transaction.objectStore(mediaStoreName);

  const deleteRequest = store.delete(mediaStoreKey);
  deleteRequest.onsuccess = () => {
    console.log('media deleted');
  };
}

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

export function deleteSaveLoop(start: number, loop: Loop) {
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
  const retrieve = () => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    // Retrieve all objects from the store
    const getAllRequest = store.getAll();
    getAllRequest.onsuccess = (event: any) => {
      completion(event.target.result);
    };
    getAllRequest.onerror = (e: any) => {
      console.error(e);
      completion([]);
    };
  }

  if (!db) {
    queues.push(retrieve);
  } else {
    retrieve();
  }
}

export function retreiveMedia() {
  return new Promise((resolve) => {
    const callback = ()=>{
      const transaction = db.transaction(mediaStoreName, 'readonly');
      const store = transaction.objectStore(mediaStoreName);

      const request = store.get(mediaStoreKey);
      request.onsuccess = (e: any) => {
        const blob = e.target.result;
        resolve(blob);
      }
      request.onerror = (e: any) => {
        console.error(e);
      }
    };
    if (!db) {
      queues.push(callback);
    } else {
      callback();
    }
  })
}

export function removeAllLoops() {
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);
  store.clear().onsuccess = () => {
    console.log("reset db.");
  };
}