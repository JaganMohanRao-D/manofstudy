"use strict";

const COLLECTIONS = Object.freeze({
  posts: "admin_posts",
  scholarships: "admin_scholarships",
  config: "admin_site_config",
});

const CONFIG_KEYS = new Set(["tools", "hero", "alerts", "featuredTags", "contentMigration"]);
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HTTP_URL_RE = /^https?:\/\//i;

class AdminContentValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "AdminContentValidationError";
  }
}

function cleanString(value, max, field, required = false) {
  const result = typeof value === "string" ? value.trim() : "";
  if (required && !result) throw new AdminContentValidationError(field + " is required.");
  if (result.length > max) throw new AdminContentValidationError(field + " is too long.");
  return result;
}

function safeUrl(value, field, required = false) {
  const result = cleanString(value, 2048, field, required);
  if (result) {
    let parsed;
    try { parsed = new URL(result); } catch { throw new AdminContentValidationError(field + " must be a valid http(s) URL."); }
    if (!HTTP_URL_RE.test(result) || !["http:", "https:"].includes(parsed.protocol) || !parsed.hostname) {
      throw new AdminContentValidationError(field + " must be a valid http(s) URL.");
    }
  }
  return result;
}

function validateRecord(type, input) {
  const data = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  if (type === "posts") {
    const title = cleanString(data.title, 180, "Title", true);
    const slug = cleanString(data.slug, 180, "Slug", true).toLowerCase();
    if (!SLUG_RE.test(slug)) throw new AdminContentValidationError("Use a URL-safe slug with lowercase letters, numbers and hyphens.");
    const status = data.status === "published" ? "published" : "draft";
    return {
      title,
      slug,
      category: cleanString(data.category, 80, "Category", true),
      content: cleanString(data.content, 60000, "Content", true),
      summary: cleanString(data.summary, 500, "Summary"),
      coverImage: safeUrl(data.coverImage, "Cover image"),
      status,
      featured: data.featured === true,
      tags: Array.isArray(data.tags) ? data.tags.slice(0, 12).map((tag) => cleanString(tag, 40, "Tag")).filter(Boolean) : [],
      author: "TEAM NAA COLLEGE",
    };
  }
  if (type === "scholarships") {
    return {
      title: cleanString(data.title, 180, "Title", true),
      provider: cleanString(data.provider, 180, "Provider", true),
      amount: cleanString(data.amount, 120, "Amount"),
      eligibility: cleanString(data.eligibility, 2000, "Eligibility", true),
      deadline: cleanString(data.deadline, 120, "Deadline"),
      link: safeUrl(data.link, "Apply link", true),
      active: data.active !== false,
    };
  }
  if (type === "config") {
    const key = cleanString(data.key, 40, "Configuration key", true);
    if (!CONFIG_KEYS.has(key)) throw new AdminContentValidationError("Unsupported configuration section.");
    const value = data.value && typeof data.value === "object" && !Array.isArray(data.value) ? data.value : {};
    const serialized = JSON.stringify(value);
    if (serialized.length > 30000) throw new AdminContentValidationError("Configuration is too large.");
    return { key, value };
  }
  throw new AdminContentValidationError("Unsupported content type.");
}

function createAdminContent({ db, FieldValue, now = () => Date.now() }) {
  async function getDashboard() {
    const [postsSnap, scholarshipsSnap, configSnap] = await Promise.all([
      db.collection(COLLECTIONS.posts).orderBy("updatedAt", "desc").limit(250).get(),
      db.collection(COLLECTIONS.scholarships).orderBy("updatedAt", "desc").limit(250).get(),
      db.collection(COLLECTIONS.config).get(),
    ]);
    const mapDocs = (snapshot) => snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const config = {};
    configSnap.docs.forEach((doc) => { config[doc.id] = doc.data().value || {}; });
    return {
      posts: mapDocs(postsSnap),
      scholarships: mapDocs(scholarshipsSnap),
      config,
      generatedAt: new Date(now()).toISOString(),
    };
  }

  async function saveRecord(input) {
    const record = validateRecord(input && input.type, input && input.data);
    const type = input.type;
    if (type === "config") {
      const ref = db.collection(COLLECTIONS.config).doc(record.key);
      await ref.set({ value: record.value, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      return { id: record.key };
    }
    const collectionName = COLLECTIONS[type];
    const requestedId = cleanString(input.id, 160, "Record id");
    if (type === "posts") {
      const duplicates = await db.collection(collectionName).where("slug", "==", record.slug).limit(2).get();
      if (duplicates.docs.some((doc) => doc.id !== requestedId)) {
        throw new AdminContentValidationError("Another blog post already uses this slug.");
      }
    }
    const ref = requestedId ? db.collection(collectionName).doc(requestedId) : db.collection(collectionName).doc();
    const snapshot = await ref.get();
    const timestamp = FieldValue.serverTimestamp();
    await ref.set({
      ...record,
      ...(snapshot.exists ? {} : { createdAt: timestamp }),
      updatedAt: timestamp,
    }, { merge: true });
    return { id: ref.id };
  }

  async function deleteRecord(input) {
    const type = input && input.type;
    const id = cleanString(input && input.id, 160, "Record id", true);
    if (type !== "posts" && type !== "scholarships") throw new AdminContentValidationError("Unsupported delete operation.");
    await db.collection(COLLECTIONS[type]).doc(id).delete();
    return { id };
  }

  async function importLegacyContent(input) {
    const posts = Array.isArray(input && input.posts) ? input.posts : [];
    const scholarships = Array.isArray(input && input.scholarships) ? input.scholarships : [];
    if (posts.length > 300 || scholarships.length > 500) {
      throw new AdminContentValidationError("The import contains too many records. Split the import and retry.");
    }
    const migrationRef = db.collection(COLLECTIONS.config).doc("contentMigration");
    const migrationSnapshot = await migrationRef.get();
    const migrationState = migrationSnapshot.exists ? migrationSnapshot.data().value || {} : {};
    if (migrationState.blogs === true && migrationState.scholarships === true) {
      throw new AdminContentValidationError("The existing content library has already been imported.");
    }
    const writes = [];
    const timestamp = FieldValue.serverTimestamp();
    const slugify = (value) => String(value || "").toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 140);

    for (const raw of posts) {
      const record = validateRecord("posts", raw);
      const ref = db.collection(COLLECTIONS.posts).doc("legacy-" + record.slug);
      writes.push({ ref, data: { ...record, source: "legacy-import", createdAt: timestamp, updatedAt: timestamp } });
    }
    for (const raw of scholarships) {
      const record = validateRecord("scholarships", raw);
      const id = "legacy-" + slugify(record.title + "-" + record.provider);
      if (id === "legacy-") continue;
      const ref = db.collection(COLLECTIONS.scholarships).doc(id);
      writes.push({ ref, data: { ...record, source: "legacy-import", createdAt: timestamp, updatedAt: timestamp } });
    }

    for (let index = 0; index < writes.length; index += 400) {
      const batch = db.batch();
      writes.slice(index, index + 400).forEach((write) => batch.set(write.ref, write.data, { merge: true }));
      await batch.commit();
    }
    await migrationRef.set({
      value: { blogs: true, scholarships: true },
      updatedAt: timestamp,
    }, { merge: true });
    return { postsImported: posts.length, scholarshipsImported: scholarships.length };
  }

  return { getDashboard, saveRecord, deleteRecord, importLegacyContent };
}

module.exports = { createAdminContent, validateRecord, COLLECTIONS };
