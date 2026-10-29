"use strict";

const crypto = require("node:crypto");

const COLLECTION_KEYS = new Set([
  "site_content",
  "blogs",
  "scholarships",
  "guides",
  "roadmaps",
  "tools",
  "seo_settings",
  "autonomous_colleges",
  "datasets",
]);
const MAX_ITEM_BYTES = 350 * 1024;
const MAX_COLLECTION_ITEMS = 1000;
const MAX_MEDIA_BYTES = 25 * 1024 * 1024;
const ALLOWED_MEDIA_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const OWNER_EMAIL = "jaganmakes@gmail.com";
const PUBLISHED = "cms_published";
const DRAFTS = "private_admin_drafts";
const REVISIONS = "private_admin_revisions";
const TRASH = "private_admin_trash";
const AUDIT = "private_admin_audit_logs";
const MEDIA = "private_admin_media";

let HttpsErrorImpl = null;
function setHttpsErrorForTesting(value) { HttpsErrorImpl = value; }
function makeError(code, message, details) {
  const Ctor = HttpsErrorImpl || require("firebase-functions/v2/https").HttpsError;
  return new Ctor(code, message, details);
}
function badRequest(message) { return makeError("invalid-argument", message); }
function assertCollectionKey(key) {
  if (typeof key !== "string" || !COLLECTION_KEYS.has(key)) {
    throw badRequest("Unsupported content collection.");
  }
  return key;
}
function safeId(value) {
  if (typeof value !== "string" && typeof value !== "number") return "";
  const id = String(value).trim();
  if (!id || id.length > 180 || id.includes("/") || id === "." || id === "..") return "";
  return id;
}
function itemIdFrom(item, supplied) {
  return safeId(supplied || item.itemId || item.id || item.slug || item.code || item.college_code || item.college_name);
}
function docId(collectionKey, itemId) {
  return collectionKey + "__" + Buffer.from(itemId, "utf8").toString("base64url");
}
function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}
function cleanHtml(input) {
  let html = String(input);
  html = html.replace(/<\s*(script|iframe|object|embed|form|style|base|meta|link|svg|math)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "");
  html = html.replace(/<\s*(script|iframe|object|embed|form|style|base|meta|link|svg|math)\b[^>]*\/?>/gi, "");
  html = html.replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  html = html.replace(/\s+(href|src|xlink:href|action)\s*=\s*(["'])\s*(?:javascript:|data:text\/html)[\s\S]*?\2/gi, ' $1="#"');
  html = html.replace(/javascript\s*:/gi, "");
  return html;
}
function sanitizeValue(value, key = "", depth = 0) {
  if (depth > 12) throw badRequest("Content is nested too deeply.");
  if (value === null || typeof value === "boolean" || typeof value === "number") return value;
  if (typeof value === "string") {
    if (value.length > 200000) throw badRequest("A content field is too large.");
    if (/^(content|body|html|articleHtml)$/i.test(key) && /<\s*[a-z][\s\S]*>/i.test(value)) return cleanHtml(value);
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length > 2000) throw badRequest("A content list is too large.");
    return value.map((part) => sanitizeValue(part, key, depth + 1));
  }
  if (typeof value === "object") {
    const out = {};
    for (const [childKey, childValue] of Object.entries(value)) {
      if (["__proto__", "prototype", "constructor"].includes(childKey)) continue;
      if (childKey.length > 120) throw badRequest("A content field name is too long.");
      out[childKey] = sanitizeValue(childValue, childKey, depth + 1);
    }
    return out;
  }
  throw badRequest("Content contains an unsupported value.");
}
function validateItem(raw, suppliedId) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw badRequest("Content must be an object.");
  const item = sanitizeValue(raw);
  const itemId = itemIdFrom(item, suppliedId);
  if (!itemId) throw badRequest("Every item needs a stable ID, slug, or code.");
  const bytes = Buffer.byteLength(JSON.stringify(item), "utf8");
  if (bytes > MAX_ITEM_BYTES) throw badRequest("This content item is too large. Large datasets must be managed with the validated data pipeline.");
  return { itemId, content: { ...item, id: item.id || itemId } };
}
function titleOf(item) {
  return String(item.title || item.pageTitle || item.name || item.label || item.id || "Untitled item").slice(0, 200);
}
function snapshotData(snapshot) {
  return snapshot && snapshot.exists ? (snapshot.data() || null) : null;
}
function publishedRef(db, key, itemId) {
  return db.collection(PUBLISHED).doc(docId(key, itemId));
}
function draftRef(db, key, itemId) {
  return db.collection(DRAFTS).doc(docId(key, itemId));
}
function summarize(item) { return titleOf(item || {}); }

function createAdminCms({ db, adminAuthCore, FieldValue, storageBucket = null, logger = console, now = () => Date.now() }) {
  if (!db || !adminAuthCore || !FieldValue) throw new Error("Admin CMS dependencies are missing.");

  async function authorize(request) {
    return adminAuthCore.requireAdminSession(request);
  }
  async function audit(uid, action, collectionKey, itemId, summary) {
    await db.collection(AUDIT).doc().set({
      uid,
      email: OWNER_EMAIL,
      action,
      collectionKey: collectionKey || null,
      itemId: itemId || null,
      summary: String(summary || action).slice(0, 220),
      timestamp: FieldValue.serverTimestamp(),
      timestampMs: now(),
    });
  }
  async function writeRevision(uid, collectionKey, itemId, action, priorPublished, priorDraft) {
    if (!priorPublished && !priorDraft) return null;
    const ref = db.collection(REVISIONS).doc();
    await ref.set({
      revisionId: ref.id,
      uid,
      collectionKey,
      itemId,
      action,
      publishedSnapshot: priorPublished,
      draftSnapshot: priorDraft,
      createdAt: FieldValue.serverTimestamp(),
      createdAtMs: now(),
      createdBy: OWNER_EMAIL,
    });
    return ref.id;
  }
  async function getWorkspace(request) {
    await authorize(request);
    const collections = {};
    for (const key of COLLECTION_KEYS) {
      const [publishedSnap, draftSnap] = await Promise.all([
        db.collection(PUBLISHED).where("collectionKey", "==", key).limit(MAX_COLLECTION_ITEMS).get(),
        db.collection(DRAFTS).where("collectionKey", "==", key).limit(MAX_COLLECTION_ITEMS).get(),
      ]);
      const publishedItems = {};
      const unpublishedIds = [];
      for (const doc of publishedSnap.docs) {
        const data = doc.data() || {};
        const itemId = safeId(data.itemId);
        if (!itemId) continue;
        if (data.content && data.content.__cmsTombstone === true) {
          unpublishedIds.push(itemId);
          continue;
        }
        if (data.status === "published" && data.content && typeof data.content === "object") {
          publishedItems[itemId] = { ...data.content, id: data.content.id || itemId, status: "published" };
        }
      }
      const draftItems = {};
      for (const doc of draftSnap.docs) {
        const data = doc.data() || {};
        const itemId = safeId(data.itemId);
        if (itemId && data.content && typeof data.content === "object") {
          draftItems[itemId] = { ...data.content, id: data.content.id || itemId, status: "draft", _draftUpdatedAtMs: data.updatedAtMs || 0 };
        }
      }
      collections[key] = { publishedItems, unpublishedIds, draftItems };
    }
    const [revisionSnap, trashSnap, auditSnap, mediaSnap] = await Promise.all([
      db.collection(REVISIONS).orderBy("createdAtMs", "desc").limit(60).get(),
      db.collection(TRASH).orderBy("deletedAtMs", "desc").limit(60).get(),
      db.collection(AUDIT).orderBy("timestampMs", "desc").limit(80).get(),
      db.collection(MEDIA).orderBy("uploadedAtMs", "desc").limit(80).get(),
    ]);
    return {
      collections,
      revisions: revisionSnap.docs.map((d) => d.data()),
      trash: trashSnap.docs.map((d) => d.data()),
      auditLogs: auditSnap.docs.map((d) => d.data()),
      media: mediaSnap.docs.map((d) => d.data()),
      generatedAt: new Date(now()).toISOString(),
    };
  }

  async function saveDraft(request) {
    const { uid } = await authorize(request);
    const key = assertCollectionKey(request.data && request.data.collectionKey);
    const { itemId, content } = validateItem(request.data && request.data.item, request.data && request.data.itemId);
    const pubRef = publishedRef(db, key, itemId);
    const draft = draftRef(db, key, itemId);
    const [pubSnap, draftSnap] = await Promise.all([pubRef.get(), draft.get()]);
    const priorPublished = snapshotData(pubSnap);
    const priorDraft = snapshotData(draftSnap);
    await writeRevision(uid, key, itemId, "save-draft", priorPublished, priorDraft);
    const updated = {
      collectionKey: key, itemId, status: "draft", content,
      updatedAt: FieldValue.serverTimestamp(), updatedAtMs: now(), updatedBy: OWNER_EMAIL,
      createdAtMs: priorDraft && priorDraft.createdAtMs ? priorDraft.createdAtMs : now(),
    };
    await draft.set(updated);
    await audit(uid, "save-draft", key, itemId, "Saved draft: " + summarize(content));
    return { success: true, item: { ...content, id: itemId, status: "draft" } };
  }

  async function publishItem(request) {
    const { uid } = await authorize(request);
    const key = assertCollectionKey(request.data && request.data.collectionKey);
    const { itemId, content: suppliedContent } = validateItem(request.data && request.data.item, request.data && request.data.itemId);
    const pubRef = publishedRef(db, key, itemId);
    const draft = draftRef(db, key, itemId);
    const [pubSnap, draftSnap] = await Promise.all([pubRef.get(), draft.get()]);
    const priorPublished = snapshotData(pubSnap);
    const priorDraft = snapshotData(draftSnap);
    const content = priorDraft && priorDraft.content ? validateItem(priorDraft.content, itemId).content : suppliedContent;
    const issues = validatePublication(key, content);
    if (issues.length) return { success: false, errors: issues };
    await writeRevision(uid, key, itemId, "publish", priorPublished, priorDraft);
    await pubRef.set({
      collectionKey: key, itemId, status: "published", content,
      updatedAt: FieldValue.serverTimestamp(), updatedAtMs: now(), updatedBy: OWNER_EMAIL,
      schemaVersion: 1,
    });
    await draft.delete().catch(() => {});
    await audit(uid, "publish", key, itemId, "Published: " + summarize(content));
    return { success: true, item: { ...content, id: itemId, status: "published" } };
  }

  function validatePublication(key, item) {
    const issues = [];
    if (key === "blogs") {
      if (!String(item.slug || item.id || "").trim()) issues.push("Blog needs a slug or stable ID.");
      if (!String(item.title || "").trim()) issues.push("Blog needs a title.");
      if (!String(item.content || "").trim()) issues.push("Blog needs content.");
    }
    if (key === "scholarships") {
      if (!String(item.title || "").trim()) issues.push("Scholarship needs a title.");
      if (!String(item.id || "").trim()) issues.push("Scholarship needs a stable ID.");
    }
    if (key === "site_content" && !String(item.id || "").trim()) issues.push("Site content needs an ID.");
    return issues;
  }

  async function unpublishItem(request) {
    const { uid } = await authorize(request);
    const key = assertCollectionKey(request.data && request.data.collectionKey);
    const itemId = safeId(request.data && request.data.itemId);
    if (!itemId) throw badRequest("A valid item ID is required.");
    const pubRef = publishedRef(db, key, itemId);
    const draft = draftRef(db, key, itemId);
    const [pubSnap, draftSnap] = await Promise.all([pubRef.get(), draft.get()]);
    const oldPublished = snapshotData(pubSnap);
    const oldDraft = snapshotData(draftSnap);
    if (!oldPublished && !oldDraft) throw makeError("not-found", "Content item not found.");
    await writeRevision(uid, key, itemId, "unpublish", oldPublished, oldDraft);
    await pubRef.set({
      collectionKey: key, itemId, status: "published",
      content: { __cmsTombstone: true, id: itemId },
      updatedAt: FieldValue.serverTimestamp(), updatedAtMs: now(), updatedBy: OWNER_EMAIL,
      schemaVersion: 1,
    });
    await draft.delete().catch(() => {});
    await audit(uid, "unpublish", key, itemId, "Unpublished: " + (oldPublished && oldPublished.content ? summarize(oldPublished.content) : itemId));
    return { success: true };
  }

  async function deleteItem(request) {
    const { uid } = await authorize(request);
    const key = assertCollectionKey(request.data && request.data.collectionKey);
    const itemId = safeId(request.data && request.data.itemId);
    if (!itemId) throw badRequest("A valid item ID is required.");
    const pubRef = publishedRef(db, key, itemId);
    const draftRefValue = draftRef(db, key, itemId);
    const [pubSnap, draftSnap] = await Promise.all([pubRef.get(), draftRefValue.get()]);
    const published = snapshotData(pubSnap);
    const draft = snapshotData(draftSnap);
    if (!published && !draft) throw makeError("not-found", "Content item not found.");
    await writeRevision(uid, key, itemId, "delete-to-trash", published, draft);
    const trashRef = db.collection(TRASH).doc();
    await trashRef.set({
      trashId: trashRef.id, uid, collectionKey: key, itemId,
      publishedSnapshot: published, draftSnapshot: draft,
      wasPublished: Boolean(published && published.content && published.content.__cmsTombstone !== true),
      deletedAt: FieldValue.serverTimestamp(), deletedAtMs: now(), deletedBy: OWNER_EMAIL,
      title: summarize((published && published.content) || (draft && draft.content) || { id: itemId }),
    });
    await pubRef.set({
      collectionKey: key, itemId, status: "published",
      content: { __cmsTombstone: true, id: itemId },
      updatedAt: FieldValue.serverTimestamp(), updatedAtMs: now(), updatedBy: OWNER_EMAIL,
      schemaVersion: 1,
    });
    await draftRefValue.delete().catch(() => {});
    await audit(uid, "delete-to-trash", key, itemId, "Moved to recycle bin: " + trashRef.id);
    return { success: true, trashId: trashRef.id };
  }

  async function restoreTrashItem(request) {
    const { uid } = await authorize(request);
    const trashId = safeId(request.data && request.data.trashId);
    if (!trashId) throw badRequest("A valid recycle-bin ID is required.");
    const trashRef = db.collection(TRASH).doc(trashId);
    const snap = await trashRef.get();
    const trash = snapshotData(snap);
    if (!trash) throw makeError("not-found", "Recycle-bin item not found.");
    const key = assertCollectionKey(trash.collectionKey);
    const itemId = safeId(trash.itemId);
    if (!itemId) throw makeError("failed-precondition", "Recycle-bin record is invalid.");
    await writeRevision(uid, key, itemId, "restore-from-trash", snapshotData(await publishedRef(db, key, itemId).get()), snapshotData(await draftRef(db, key, itemId).get()));
    const pubRef = publishedRef(db, key, itemId);
    const draftRefValue = draftRef(db, key, itemId);
    const oldPub = trash.publishedSnapshot;
    const oldDraft = trash.draftSnapshot;
    if (trash.wasPublished && oldPub && oldPub.content && oldPub.content.__cmsTombstone !== true) {
      await pubRef.set({ ...oldPub, updatedAt: FieldValue.serverTimestamp(), updatedAtMs: now(), updatedBy: OWNER_EMAIL });
      if (oldDraft) await draftRefValue.set(oldDraft); else await draftRefValue.delete().catch(() => {});
    } else if (oldDraft && oldDraft.content) {
      await draftRefValue.set({ ...oldDraft, updatedAt: FieldValue.serverTimestamp(), updatedAtMs: now(), updatedBy: OWNER_EMAIL });
      await pubRef.set({ collectionKey: key, itemId, status: "published", content: { __cmsTombstone: true, id: itemId }, updatedAt: FieldValue.serverTimestamp(), updatedAtMs: now(), updatedBy: OWNER_EMAIL });
    } else {
      await pubRef.set({ collectionKey: key, itemId, status: "published", content: { __cmsTombstone: true, id: itemId }, updatedAt: FieldValue.serverTimestamp(), updatedAtMs: now(), updatedBy: OWNER_EMAIL });
    }
    await trashRef.delete();
    await audit(uid, "restore-trash", key, itemId, "Restored from recycle bin: " + itemId);
    return { success: true };
  }

  async function restoreRevision(request) {
    const { uid } = await authorize(request);
    const revisionId = safeId(request.data && request.data.revisionId);
    if (!revisionId) throw badRequest("A valid revision ID is required.");
    const snap = await db.collection(REVISIONS).doc(revisionId).get();
    const revision = snapshotData(snap);
    if (!revision) throw makeError("not-found", "Revision not found.");
    const key = assertCollectionKey(revision.collectionKey);
    const itemId = safeId(revision.itemId);
    const content = (revision.publishedSnapshot && revision.publishedSnapshot.content) || (revision.draftSnapshot && revision.draftSnapshot.content);
    if (!itemId || !content || content.__cmsTombstone === true) throw makeError("failed-precondition", "This revision has no restorable content.");
    const pubRef = publishedRef(db, key, itemId);
    const draft = draftRef(db, key, itemId);
    const [pubSnap, draftSnap] = await Promise.all([pubRef.get(), draft.get()]);
    await writeRevision(uid, key, itemId, "before-restore-revision", snapshotData(pubSnap), snapshotData(draftSnap));
    if (request.data && request.data.publishImmediately === true) {
      const issues = validatePublication(key, content);
      if (issues.length) return { success: false, errors: issues };
      await pubRef.set({ collectionKey: key, itemId, status: "published", content: sanitizeValue(content), updatedAt: FieldValue.serverTimestamp(), updatedAtMs: now(), updatedBy: OWNER_EMAIL, schemaVersion: 1 });
      await draft.delete().catch(() => {});
    } else {
      await draft.set({ collectionKey: key, itemId, status: "draft", content: sanitizeValue(content), updatedAt: FieldValue.serverTimestamp(), updatedAtMs: now(), updatedBy: OWNER_EMAIL, createdAtMs: now() });
    }
    await audit(uid, "restore-revision", key, itemId, "Restored revision " + revisionId);
    return { success: true };
  }

  async function registerMedia(request) {
    const { uid } = await authorize(request);
    const media = request.data && request.data.media;
    if (!media || typeof media !== "object") throw badRequest("Media metadata is required.");
    const mimeType = String(media.mimeType || "");
    const sizeBytes = Number(media.sizeBytes);
    const storagePath = String(media.storagePath || "");
    if (!ALLOWED_MEDIA_TYPES.has(mimeType)) throw badRequest("Only JPEG, PNG, WebP and GIF images are allowed.");
    if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_MEDIA_BYTES) throw badRequest("Image size must be between 1 byte and 25 MB.");
    if (!storagePath.startsWith("public/cms-media/") || storagePath.includes("..") || storagePath.length > 500) throw badRequest("Invalid media storage path.");
    if (storageBucket && typeof storageBucket.file === "function") {
      const [exists] = await storageBucket.file(storagePath).exists();
      if (!exists) throw makeError("failed-precondition", "Uploaded media file was not found in storage.");
    }
    const ref = db.collection(MEDIA).doc();
    const record = {
      mediaId: ref.id, uid, fileName: String(media.fileName || "image").slice(0, 240),
      altText: String(media.altText || "").slice(0, 500), category: String(media.category || "general").slice(0, 80),
      mimeType, sizeBytes, url: String(media.url || "").slice(0, 2000), storagePath,
      uploadedAt: FieldValue.serverTimestamp(), uploadedAtMs: now(), uploadedBy: OWNER_EMAIL,
    };
    if (!record.url.startsWith("https://")) throw badRequest("Invalid media URL.");
    await ref.set(record);
    await audit(uid, "register-media", "media", ref.id, "Registered media: " + record.fileName);
    return { success: true, media: record };
  }

  async function deleteMedia(request) {
    const { uid } = await authorize(request);
    const mediaId = safeId(request.data && request.data.mediaId);
    if (!mediaId) throw badRequest("A valid media ID is required.");
    const ref = db.collection(MEDIA).doc(mediaId);
    const snap = await ref.get();
    const media = snapshotData(snap);
    if (!media) throw makeError("not-found", "Media item not found.");
    if (media.storagePath && storageBucket && typeof storageBucket.file === "function") {
      if (!String(media.storagePath).startsWith("public/cms-media/") || String(media.storagePath).includes("..")) {
        throw makeError("failed-precondition", "Stored media path is invalid.");
      }
      await storageBucket.file(media.storagePath).delete({ ignoreNotFound: true });
    }
    await ref.delete();
    await audit(uid, "delete-media", "media", mediaId, "Deleted media: " + String(media.fileName || mediaId));
    return { success: true };
  }

  return {
    getWorkspace,
    saveDraft,
    publishItem,
    unpublishItem,
    deleteItem,
    restoreTrashItem,
    restoreRevision,
    registerMedia,
    deleteMedia,
  };
}

module.exports = {
  createAdminCms,
  setHttpsErrorForTesting,
  COLLECTION_KEYS,
  sanitizeValue,
  cleanHtml,
  validateItem,
  docId,
  OWNER_EMAIL,
  MAX_ITEM_BYTES,
  MAX_MEDIA_BYTES,
};