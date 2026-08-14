"use client";

import * as Y from "yjs";
import { createStore, get, set, del, keys } from "idb-keyval";

const store = createStore(
  "collaborative-editor-db",
  "documents"
);

function documentKey(documentId: string) {
  return `document:${documentId}:state`;
}

const saveQueues = new Map<string, Promise<void>>();

function normalizeUpdate(value: Uint8Array | number[]) {
  return value instanceof Uint8Array
    ? value
    : new Uint8Array(value);
}

export async function saveYjsUpdate(
  documentId: string,
  update: Uint8Array
) {
  const previousSave =
    saveQueues.get(documentId) ?? Promise.resolve();

  const currentSave = previousSave
    .catch(() => {
      // Allow the queue to continue if a previous save failed.
    })
    .then(async () => {
      const existingSnapshot = await get<
        Uint8Array | number[]
      >(documentKey(documentId), store);

      const mergedDocument = new Y.Doc();

      if (existingSnapshot) {
        Y.applyUpdate(
          mergedDocument,
          normalizeUpdate(existingSnapshot),
          "idb-existing"
        );
      }

      Y.applyUpdate(
        mergedDocument,
        update,
        "idb-incoming"
      );

      const mergedSnapshot =
        Y.encodeStateAsUpdate(mergedDocument);

      await set(
        documentKey(documentId),
        mergedSnapshot,
        store
      );

      mergedDocument.destroy();
    });

  saveQueues.set(documentId, currentSave);

  try {
    await currentSave;
  } finally {
    if (saveQueues.get(documentId) === currentSave) {
      saveQueues.delete(documentId);
    }
  }
}

export async function loadYjsUpdates(documentId: string) {
  const savedSnapshot = await get<
    Uint8Array | number[]
  >(documentKey(documentId), store);

  if (!savedSnapshot) {
    return [];
  }

  return [normalizeUpdate(savedSnapshot)];
}

export async function clearYjsUpdates(documentId: string) {
  await del(documentKey(documentId), store);
}

export async function clearAllYjsDocuments() {
  const allKeys = await keys(store);

  for (const key of allKeys) {
    if (
      typeof key === "string" &&
      key.startsWith("document:")
    ) {
      await del(key, store);
    }
  }
}