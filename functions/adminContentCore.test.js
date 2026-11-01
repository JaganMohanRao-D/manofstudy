"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { validateRecord } = require("./adminContentCore");

test("validates and normalizes a publishable blog post", () => {
  const result = validateRecord("posts", {
    title: "A Practical Guide",
    slug: "a-practical-guide",
    category: "Student Guides",
    content: "## Start here",
    status: "published",
    coverImage: "https://cdn.example.com/cover.webp",
  });
  assert.equal(result.status, "published");
  assert.equal(result.slug, "a-practical-guide");
  assert.equal(result.author, "TEAM NAA COLLEGE");
});

test("rejects unsafe or malformed blog slugs", () => {
  assert.throws(() => validateRecord("posts", {
    title: "Bad slug",
    slug: "../bad-slug",
    category: "Guides",
    content: "Content",
  }), /URL-safe slug/);
});

test("rejects non-http(s) cover image and scholarship links", () => {
  assert.throws(() => validateRecord("posts", {
    title: "Guide",
    slug: "guide",
    category: "Guides",
    content: "Content",
    coverImage: "javascript:alert(1)",
  }), /http\(s\) URL/);
  assert.throws(() => validateRecord("scholarships", {
    title: "Award",
    provider: "Provider",
    eligibility: "Students",
    link: "javascript:alert(1)",
  }), /http\(s\) URL/);
});

test("only known site configuration sections can be changed", () => {
  const result = validateRecord("config", {
    key: "hero",
    value: { title: "A better student journey" },
  });
  assert.equal(result.key, "hero");
  assert.throws(() => validateRecord("config", {
    key: "private_admin_sessions",
    value: { compromised: true },
  }), /Unsupported configuration section/);
});

test("scholarships require an official application URL", () => {
  assert.throws(() => validateRecord("scholarships", {
    title: "Scholarship",
    provider: "Provider",
    eligibility: "Eligible students",
    link: "",
  }), /Apply link is required/);
});
