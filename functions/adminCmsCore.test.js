"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("./adminCmsCore");

class FakeHttpsError extends Error {
  constructor(code, message, details) { super(message); this.code = code; this.details = details; }
}
core.setHttpsErrorForTesting(FakeHttpsError);

class FakeDb {
  constructor() { this.data = new Map(); this.seq = 0; }
  ref(collection, id) {
    const db = this, docId = id || "generated-" + (++this.seq), key = collection + "/" + docId;
    return {
      id: docId,
      async get() { const v = db.data.get(key); return { id: docId, exists: v !== undefined, data: () => v ? structuredClone(v) : undefined }; },
      async set(value) { db.data.set(key, structuredClone(value)); },
      async delete() { db.data.delete(key); },
    };
  }
  collection(name) {
    const db = this;
    return {
      doc(id) { return db.ref(name, id); },
      where(field, op, value) { return queryBuilder(name, [[field, op, value]]); },
      orderBy(field, direction) { return queryBuilder(name, [], [[field, direction]]); },
    };
    function queryBuilder(collection, where, order = []) {
      const builder = {
        where(field, op, value) { return queryBuilder(collection, [...where, [field, op, value]], order); },
        orderBy(field, direction) { return queryBuilder(collection, where, [...order, [field, direction]]); },
        limit(n) { return queryBuilder(collection, where, [...order, ["__limit", n]]); },
        async get() {
          let docs = [...db.data.entries()]
            .filter(([key]) => key.startsWith(collection + "/"))
            .map(([key, value]) => ({ id: key.slice(collection.length + 1), data: () => structuredClone(value), exists: true, raw: value }));
          for (const [field, op, value] of where) {
            docs = docs.filter((doc) => op === "==" && doc.raw[field] === value);
          }
          const lim = order.find(([key]) => key === "__limit");
          const sorting = order.filter(([key]) => key !== "__limit");
          if (sorting.length) docs.sort((a, b) => {
            for (const [field, direction] of sorting) {
              const av = a.raw[field] || 0, bv = b.raw[field] || 0;
              if (av !== bv) return (av < bv ? -1 : 1) * (direction === "desc" ? -1 : 1);
            }
            return 0;
          });
          if (lim) docs = docs.slice(0, lim[1]);
          return { docs };
        },
      };
      return builder;
    }
  }
  collectionDocs(name) { return [...this.data.entries()].filter(([k]) => k.startsWith(name + "/")); }
}

const OWNER_UID = "owner-test";
function setup() {
  const db = new FakeDb();
  const adminAuthCore = {
    async requireAdminSession(request) {
      if (!request || !request.auth || request.auth.uid !== OWNER_UID || !request.data || request.data.sessionToken !== "valid-session") {
        throw new FakeHttpsError("unauthenticated", "Unauthorized.");
      }
      return { uid: OWNER_UID };
    },
  };
  const FieldValue = { serverTimestamp: () => ({ fakeTimestamp: true }) };
  const cms = core.createAdminCms({ db, adminAuthCore, FieldValue, now: () => 1780000000000, logger: { error() {} } });
  const req = (data = {}, authenticated = true) => ({ data: { ...data, sessionToken: authenticated ? "valid-session" : undefined }, auth: authenticated ? { uid: OWNER_UID } : null });
  return { db, cms, req };
}

test("rejects unauthenticated or invalid-session workspace requests", async () => {
  const { cms, req } = setup();
  await assert.rejects(cms.getWorkspace(req({}, false)), { code: "unauthenticated" });
  await assert.rejects(cms.getWorkspace({ data: { sessionToken: "wrong" }, auth: { uid: OWNER_UID } }), { code: "unauthenticated" });
});

test("rejects unsupported collections and invalid IDs", async () => {
  const { cms, req } = setup();
  await assert.rejects(cms.saveDraft(req({ collectionKey: "users", item: { id: "x", title: "No" } })), { code: "invalid-argument" });
  await assert.rejects(cms.saveDraft(req({ collectionKey: "blogs", item: { title: "No stable id" } })), { code: "invalid-argument" });
});

test("save draft does not publish content", async () => {
  const { db, cms, req } = setup();
  const result = await cms.saveDraft(req({ collectionKey: "blogs", item: { slug: "hello", title: "Hello", content: "Draft body" } }));
  assert.equal(result.success, true);
  assert.equal(db.collectionDocs("private_admin_drafts").length, 1);
  assert.equal(db.collectionDocs("cms_published").length, 0);
  assert.equal(db.collectionDocs("private_admin_audit_logs").length, 1);
});

test("publish writes public content and removes draft", async () => {
  const { db, cms, req } = setup();
  const item = { slug: "hello", title: "Hello", content: "Published body" };
  await cms.saveDraft(req({ collectionKey: "blogs", item }));
  const result = await cms.publishItem(req({ collectionKey: "blogs", item }));
  assert.equal(result.success, true);
  assert.equal(db.collectionDocs("private_admin_drafts").length, 0);
  const pub = db.collectionDocs("cms_published").map(([, value]) => value)[0];
  assert.equal(pub.status, "published");
  assert.equal(pub.content.title, "Hello");
});

test("publication validation blocks incomplete blog items", async () => {
  const { cms, req } = setup();
  const result = await cms.publishItem(req({ collectionKey: "blogs", item: { slug: "empty", title: "Empty", content: "" } }));
  assert.equal(result.success, false);
  assert.ok(result.errors.length > 0);
});

test("unpublish creates a public tombstone so static fallback can hide an item", async () => {
  const { db, cms, req } = setup();
  const item = { slug: "hello", title: "Hello", content: "Published body" };
  await cms.publishItem(req({ collectionKey: "blogs", item }));
  await cms.unpublishItem(req({ collectionKey: "blogs", itemId: "hello" }));
  const pub = db.collectionDocs("cms_published").map(([, value]) => value)[0];
  assert.equal(pub.status, "published");
  assert.equal(pub.content.__cmsTombstone, true);
  assert.equal((await cms.getWorkspace(req({}))).collections.blogs.unpublishedIds.includes("hello"), true);
});

test("delete moves an item to trash and restore can recover it", async () => {
  const { db, cms, req } = setup();
  const item = { slug: "restore-me", title: "Restore me", content: "body" };
  await cms.publishItem(req({ collectionKey: "blogs", item }));
  const deleted = await cms.deleteItem(req({ collectionKey: "blogs", itemId: "restore-me" }));
  assert.equal(deleted.success, true);
  assert.equal(db.collectionDocs("private_admin_trash").length, 1);
  await cms.restoreTrashItem(req({ trashId: deleted.trashId }));
  const pub = db.collectionDocs("cms_published").map(([, v]) => v).find(v => v.itemId === "restore-me");
  assert.equal(pub.content.title, "Restore me");
  assert.equal(db.collectionDocs("private_admin_trash").length, 0);
});

test("revision restore preserves content as a draft unless explicitly publishing", async () => {
  const { db, cms, req } = setup();
  const item = { slug: "revision", title: "Initial", content: "body" };
  await cms.publishItem(req({ collectionKey: "blogs", item }));
  await cms.saveDraft(req({ collectionKey: "blogs", item: { ...item, title: "Changed" } }));
  const workspace = await cms.getWorkspace(req({}));
  assert.ok(workspace.revisions.length >= 1);
  const revision = workspace.revisions.find(r => r.collectionKey === "blogs" && r.itemId === "revision" && r.publishedSnapshot);
  assert.ok(revision);
  const result = await cms.restoreRevision(req({ revisionId: revision.revisionId }));
  assert.equal(result.success, true);
  assert.ok(db.collectionDocs("private_admin_drafts").length > 0);
});

test("HTML sanitizer removes scripts, event handlers and javascript URLs", () => {
  const clean = core.cleanHtml('<p onclick="run()">Safe <script>alert(1)</script><a href="javascript:alert(1)">link</a></p>');
  assert.ok(!/script|onclick|javascript:/i.test(clean));
});

test("media registration rejects unsafe file types and unsafe storage paths", async () => {
  const { cms, req } = setup();
  await assert.rejects(cms.registerMedia(req({ media: { mimeType: "image/svg+xml", sizeBytes: 100, storagePath: "public/cms-media/x.svg", url: "https://example.com/x.svg" } })), { code: "invalid-argument" });
  await assert.rejects(cms.registerMedia(req({ media: { mimeType: "image/png", sizeBytes: 100, storagePath: "public/cms-media/../x.png", url: "https://example.com/x.png" } })), { code: "invalid-argument" });
});

test("workspace includes published items and hides tombstones from publishedItems", async () => {
  const { cms, req } = setup();
  await cms.publishItem(req({ collectionKey: "scholarships", item: { id: "grant", title: "Grant", content: "Details" } }));
  await cms.unpublishItem(req({ collectionKey: "scholarships", itemId: "grant" }));
  const workspace = await cms.getWorkspace(req({}));
  assert.equal(workspace.collections.scholarships.publishedItems.grant, undefined);
  assert.ok(workspace.collections.scholarships.unpublishedIds.includes("grant"));
});
