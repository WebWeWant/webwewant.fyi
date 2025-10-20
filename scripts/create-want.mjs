import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate a unique ID for the want
const wantId = crypto.randomUUID();

// Create the markdown content using the template
const markdownContent = `---
title: 
date: 
submitter: 
number: ${wantId}
tags: [ ]
discussion: 
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
console.log(`\nPlease fill in the following REQUIRED fields:`);
console.log(`  - title: "I want [description]"`);
console.log(`  - date: Current ISO date string`);
console.log(`  - submitter: Submitter's name or "Anonymous"`);
console.log(`  - tags: Array of 1-3 relevant technology labels`);
console.log(`  - discussion: GitHub discussions URL`);
console.log(`\nOptional fields:`);
console.log(`  - related: Array of related links with title, url, type`);
console.log(`\n✓ Next steps:`);
console.log(`  1. Fill in the fields in wants/${wantId}.md`);
console.log(`  2. Add content after the frontmatter`);
console.log(`  3. Run: npm run validate-want wants/${wantId}.md`);