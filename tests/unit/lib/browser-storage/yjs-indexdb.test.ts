import * as Y from "yjs";

describe("Yjs IndexedDB storage", () => {
  let saveYjsUpdate: typeof import("@/lib/browser-storage/yjs-indexdb").saveYjsUpdate;
  let loadYjsUpdates: typeof import("@/lib/browser-storage/yjs-indexdb").loadYjsUpdates;
  let clearYjsUpdates: typeof import("@/lib/browser-storage/yjs-indexdb").clearYjsUpdates;
  let clearAllYjsDocuments: typeof import("@/lib/browser-storage/yjs-indexdb").clearAllYjsDocuments;

  let mockStore: Record<string, unknown>;
  let mockGet: jest.Mock;
  let mockSet: jest.Mock;
  let mockDel: jest.Mock;
  let mockKeys: jest.Mock;

  beforeEach(async () => {
    jest.resetModules();

    mockStore = {};

    mockGet = jest.fn();
    mockSet = jest.fn();
    mockDel = jest.fn();
    mockKeys = jest.fn();

    mockGet.mockResolvedValue(undefined);
    mockSet.mockResolvedValue(undefined);
    mockDel.mockResolvedValue(undefined);
    mockKeys.mockResolvedValue([]);

    jest.doMock("idb-keyval", () => ({
      createStore: jest.fn(() => mockStore),
      get: mockGet,
      set: mockSet,
      del: mockDel,
      keys: mockKeys,
    }));

    const module = await import(
      "@/lib/browser-storage/yjs-indexdb"
    );

    saveYjsUpdate = module.saveYjsUpdate;
    loadYjsUpdates = module.loadYjsUpdates;
    clearYjsUpdates = module.clearYjsUpdates;
    clearAllYjsDocuments =
      module.clearAllYjsDocuments;
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("saveYjsUpdate", () => {
    it("saves a Yjs update to IndexedDB", async () => {
      const documentId = "document-123";

      const doc = new Y.Doc();

      doc
        .getText("default")
        .insert(0, "Hello");

      const update =
        Y.encodeStateAsUpdate(doc);

      await saveYjsUpdate(
        documentId,
        update,
      );

      expect(mockGet).toHaveBeenCalledWith(
        "document:document-123:state",
        mockStore,
      );

      expect(mockSet).toHaveBeenCalledTimes(1);

      expect(mockSet).toHaveBeenCalledWith(
        "document:document-123:state",
        expect.any(Uint8Array),
        mockStore,
      );

      doc.destroy();
    });

    it("merges an existing snapshot with the incoming update", async () => {
      const existingDoc = new Y.Doc();

      existingDoc
        .getMap("data")
        .set("existing", "value");

      const existingSnapshot =
        Y.encodeStateAsUpdate(
          existingDoc,
        );

      mockGet.mockResolvedValueOnce(
        existingSnapshot,
      );

      const incomingDoc = new Y.Doc();

      incomingDoc
        .getMap("data")
        .set("incoming", "value");

      const incomingUpdate =
        Y.encodeStateAsUpdate(
          incomingDoc,
        );

      await saveYjsUpdate(
        "document-123",
        incomingUpdate,
      );

      expect(mockSet).toHaveBeenCalledTimes(1);

      const savedSnapshot =
        mockSet.mock.calls[0][1];

      expect(
        savedSnapshot,
      ).toBeInstanceOf(Uint8Array);

      const restoredDoc =
        new Y.Doc();

      Y.applyUpdate(
        restoredDoc,
        savedSnapshot,
      );

      const data =
        restoredDoc.getMap("data");

      expect(data.get("existing")).toBe(
        "value",
      );

      expect(data.get("incoming")).toBe(
        "value",
      );

      existingDoc.destroy();
      incomingDoc.destroy();
      restoredDoc.destroy();
    });

    it("supports an existing snapshot represented as number[]", async () => {
      const existingDoc = new Y.Doc();

      existingDoc
        .getText("default")
        .insert(0, "Existing");

      const snapshot =
        Y.encodeStateAsUpdate(
          existingDoc,
        );

      mockGet.mockResolvedValueOnce(
        Array.from(snapshot),
      );

      const incomingDoc = new Y.Doc();

      incomingDoc
        .getText("default")
        .insert(0, "Incoming");

      await saveYjsUpdate(
        "document-123",
        Y.encodeStateAsUpdate(
          incomingDoc,
        ),
      );

      expect(mockSet).toHaveBeenCalledWith(
        "document:document-123:state",
        expect.any(Uint8Array),
        mockStore,
      );

      existingDoc.destroy();
      incomingDoc.destroy();
    });

    it("uses the correct document key", async () => {
      const doc = new Y.Doc();

      await saveYjsUpdate(
        "doc-123",
        Y.encodeStateAsUpdate(doc),
      );

      expect(mockGet).toHaveBeenCalledWith(
        "document:doc-123:state",
        mockStore,
      );

      expect(mockSet).toHaveBeenCalledWith(
        "document:doc-123:state",
        expect.any(Uint8Array),
        mockStore,
      );

      doc.destroy();
    });

    it("propagates IndexedDB read errors", async () => {
      mockGet.mockRejectedValueOnce(
        new Error("IndexedDB read failed"),
      );

      const doc = new Y.Doc();

      const update =
        Y.encodeStateAsUpdate(doc);

      await expect(
        saveYjsUpdate(
          "document-123",
          update,
        ),
      ).rejects.toThrow(
        "IndexedDB read failed",
      );

      doc.destroy();
    });

    it("propagates IndexedDB write errors", async () => {
      mockSet.mockRejectedValueOnce(
        new Error("IndexedDB write failed"),
      );

      const doc = new Y.Doc();

      const update =
        Y.encodeStateAsUpdate(doc);

      await expect(
        saveYjsUpdate(
          "document-123",
          update,
        ),
      ).rejects.toThrow(
        "IndexedDB write failed",
      );

      doc.destroy();
    });
  });

  describe("loadYjsUpdates", () => {
    it("returns an empty array when no snapshot exists", async () => {
      mockGet.mockResolvedValueOnce(
        undefined,
      );

      const result =
        await loadYjsUpdates(
          "document-123",
        );

      expect(result).toEqual([]);
    });

    it("loads a stored Uint8Array snapshot", async () => {
      const snapshot =
        new Uint8Array([
          1,
          2,
          3,
        ]);

      mockGet.mockResolvedValueOnce(
        snapshot,
      );

      const result =
        await loadYjsUpdates(
          "document-123",
        );

      expect(mockGet).toHaveBeenCalledWith(
        "document:document-123:state",
        mockStore,
      );

      expect(result).toHaveLength(1);

      expect(result[0]).toBe(snapshot);
    });

    it("normalizes a number array", async () => {
      mockGet.mockResolvedValueOnce([
        1,
        2,
        3,
        255,
      ]);

      const result =
        await loadYjsUpdates(
          "document-123",
        );

      expect(result).toHaveLength(1);

      expect(result[0]).toBeInstanceOf(
        Uint8Array,
      );

      expect(
        Array.from(result[0]),
      ).toEqual([
        1,
        2,
        3,
        255,
      ]);
    });

    it("uses the correct document key", async () => {
      await loadYjsUpdates(
        "doc-456",
      );

      expect(mockGet).toHaveBeenCalledWith(
        "document:doc-456:state",
        mockStore,
      );
    });

    it("propagates IndexedDB errors", async () => {
      mockGet.mockRejectedValueOnce(
        new Error("Read failed"),
      );

      await expect(
        loadYjsUpdates(
          "document-123",
        ),
      ).rejects.toThrow(
        "Read failed",
      );
    });
  });

  describe("clearYjsUpdates", () => {
    it("deletes the correct document snapshot", async () => {
      await clearYjsUpdates(
        "document-123",
      );

      expect(mockDel).toHaveBeenCalledTimes(
        1,
      );

      expect(mockDel).toHaveBeenCalledWith(
        "document:document-123:state",
        mockStore,
      );
    });

    it("propagates IndexedDB errors", async () => {
      mockDel.mockRejectedValueOnce(
        new Error("Delete failed"),
      );

      await expect(
        clearYjsUpdates(
          "document-123",
        ),
      ).rejects.toThrow(
        "Delete failed",
      );
    });
  });

  describe("clearAllYjsDocuments", () => {
    it("gets all IndexedDB keys", async () => {
      await clearAllYjsDocuments();

      expect(mockKeys).toHaveBeenCalledWith(
        mockStore,
      );
    });

    it("deletes all document keys", async () => {
      mockKeys.mockResolvedValueOnce([
        "document:doc-1:state",
        "document:doc-2:state",
      ]);

      await clearAllYjsDocuments();

      expect(mockDel).toHaveBeenCalledTimes(
        2,
      );

      expect(mockDel).toHaveBeenCalledWith(
        "document:doc-1:state",
        mockStore,
      );

      expect(mockDel).toHaveBeenCalledWith(
        "document:doc-2:state",
        mockStore,
      );
    });

    it("does not delete unrelated keys", async () => {
      mockKeys.mockResolvedValueOnce([
        "document:doc-1:state",
        "user:settings",
        "cache:data",
        "document:doc-2:state",
      ]);

      await clearAllYjsDocuments();

      expect(mockDel).toHaveBeenCalledTimes(
        2,
      );

      expect(mockDel).toHaveBeenCalledWith(
        "document:doc-1:state",
        mockStore,
      );

      expect(mockDel).toHaveBeenCalledWith(
        "document:doc-2:state",
        mockStore,
      );

      expect(mockDel).not.toHaveBeenCalledWith(
        "user:settings",
        mockStore,
      );

      expect(mockDel).not.toHaveBeenCalledWith(
        "cache:data",
        mockStore,
      );
    });

    it("ignores non-string keys", async () => {
      mockKeys.mockResolvedValueOnce([
        123,
        { key: "document:doc-1" },
        "document:doc-2:state",
      ]);

      await clearAllYjsDocuments();

      expect(mockDel).toHaveBeenCalledTimes(
        1,
      );

      expect(mockDel).toHaveBeenCalledWith(
        "document:doc-2:state",
        mockStore,
      );
    });

    it("does nothing when there are no keys", async () => {
      mockKeys.mockResolvedValueOnce([]);

      await clearAllYjsDocuments();

      expect(mockDel).not.toHaveBeenCalled();
    });

    it("propagates key lookup errors", async () => {
      mockKeys.mockRejectedValueOnce(
        new Error("Keys lookup failed"),
      );

      await expect(
        clearAllYjsDocuments(),
      ).rejects.toThrow(
        "Keys lookup failed",
      );
    });

    it("propagates delete errors", async () => {
      mockKeys.mockResolvedValueOnce([
        "document:doc-1:state",
      ]);

      mockDel.mockRejectedValueOnce(
        new Error("Delete failed"),
      );

      await expect(
        clearAllYjsDocuments(),
      ).rejects.toThrow(
        "Delete failed",
      );
    });
  });
});