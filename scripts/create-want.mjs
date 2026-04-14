import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse optional issue ID argument: npm run create-want -- <issue-id>
// or: node scripts/create-want.mjs <issue-id>
const issueId = process.argv[2] ? process.argv[2].trim() : null;

if (issueId !== null && !/^[1-9]\d*$/.test(issueId)) {
  console.error(`Error: issue ID must be a positive integer (e.g. 850). Got: "${issueId}"`);
  process.exit(1);
}

const discussionUrl = issueId
  ? `https://github.com/WebWeWant/webwewant.fyi/discussions/${issueId}`
  : "";

// Generate a unique ID for the want
const wantId = crypto.randomUUID();

// Create the markdown content using the template
const markdownContent = `---
title: 
date: 
submitter: 
number: ${wantId}
tags: [ ]
discussion: ${discussionUrl}
status: discussing
related:
---

`;

// Path to the wants directory
const wantsDir = path.join(__dirname, "..", "wants");
const markdownPath = path.join(wantsDir, `${wantId}.md`);

// Ensure wants directory exists
if (!fs.existsSync(wantsDir)) {
  fs.mkdirSync(wantsDir, { recursive: true });
}

// Write the markdown file
fs.writeFileSync(markdownPath, markdownContent);

console.log(`✓ Created new want markdown file: ${wantId}.md`);
console.log(`✓ Want ID: ${wantId}`);
if (issueId) {
  console.log(`✓ Discussion URL pre-populated: ${discussionUrl}`);
} else {
  console.log(`⚠ No issue ID provided — discussion URL is empty.`);
  console.log(`  Usage: npm run create-want -- <issue-id>`);
  console.log(`  Example: npm run create-want -- 850`);
}
console.log(`\nPlease fill in the following REQUIRED fields:`);
console.log(`  - title: "I want [description]"`);
console.log(`  - date: Current ISO date string`);
console.log(`  - submitter: Submitter's name or "Anonymous"`);
console.log(`  - tags: Array of 1-3 relevant technology labels`);
if (!issueId) {
  console.log(`  - discussion: GitHub discussions URL (https://github.com/WebWeWant/webwewant.fyi/discussions/<ISSUE_ID>)`);
}
console.log(`\nOptional fields:`);
console.log(`  - related: Array of related links with title, url, type`);
console.log(`\n✓ Next steps:`);
console.log(`  1. Fill in the fields in wants/${wantId}.md`);
console.log(`  2. Add content after the frontmatter`);
console.log(`  3. Run: npm run validate-want wants/${wantId}.md`);