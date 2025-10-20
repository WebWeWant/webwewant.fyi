#!/usr/bin/env node

/**
 * Want Duplicate Checker
 * 
 * Searches existing wants by title to check for potential duplicates.
 * Uses fuzzy matching to catch similar titles.
 * 
 * Usage:
 *   node scripts/check-duplicate.js "Want Title"
 *   npm run check-duplicate "Want Title"
 * 
 * Exit codes:
 *   0 - No duplicates found
 *   1 - Potential duplicates found
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseFrontmatterOnly } from './utils/frontmatter.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Normalize title for comparison (lowercase, no extra spaces, remove "I want")
function normalizeTitle(title) {
  return title.toLowerCase()
    .replace(/^i\s+want\s+/i, '') // Remove "I want" prefix
    .trim()
    .replace(/\s+/g, ' ');
}

// Calculate similarity between two titles using word overlap and substring matching
function calculateSimilarity(title1, title2) {
  const n1 = normalizeTitle(title1);
  const n2 = normalizeTitle(title2);
  
  // Exact match after normalization
  if (n1 === n2) {
    return 100;
  }
  
  // Check if one title contains the other (high similarity)
  if (n1.includes(n2) || n2.includes(n1)) {
    const minLength = Math.min(n1.length, n2.length);
    const maxLength = Math.max(n1.length, n2.length);
    // Adjust similarity based on length difference
    return Math.round(90 * (minLength / maxLength));
  }
  
  // Check word overlap
  const words1 = n1.split(' ').filter(w => w.length > 2); // Ignore short words
  const words2 = n2.split(' ').filter(w => w.length > 2);
  
  if (words1.length === 0 || words2.length === 0) {
    return 0;
  }
  
  const commonWords = words1.filter(w => words2.includes(w));
  
  if (commonWords.length > 0) {
    const overlap = (commonWords.length * 2) / (words1.length + words2.length);
    return Math.round(overlap * 80); // Up to 80% similarity for word overlap
  }
  
  return 0;
}

// Search for duplicates
function checkDuplicates(searchTitle) {
  const wantsDir = path.join(__dirname, '..', 'wants');
  
  if (!fs.existsSync(wantsDir)) {
    console.error('Error: wants/ directory not found');
    process.exit(1);
  }
  
  const files = fs.readdirSync(wantsDir).filter(f => f.endsWith('.md'));
  const results = [];
  
  console.log(`\n🔍 Searching ${files.length} wants for matches to: "${searchTitle}"\n`);
  
  for (const file of files) {
    const filePath = path.join(wantsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const data = parseFrontmatterOnly(content);
    
    if (data && data.title) {
      const similarity = calculateSimilarity(searchTitle, data.title);
      
      if (similarity >= 50) { // Threshold for potential duplicate
        results.push({
          file,
          title: data.title,
          submitter: data.submitter,
          date: data.date,
          tags: data.tags,
          status: data.status,
          similarity
        });
      }
    }
  }
  
  // Sort by similarity (highest first)
  results.sort((a, b) => b.similarity - a.similarity);
  
  if (results.length === 0) {
    console.log('✅ No potential duplicates found.\n');
    return 0;
  }
  
  console.log(`⚠️  Found ${results.length} potential duplicate(s):\n`);
  
  for (const result of results) {
    console.log(`${result.similarity}% match: ${result.title}`);
    console.log(`  File: wants/${result.file}`);
    console.log(`  Submitter: ${result.submitter || 'N/A'}`);
    console.log(`  Date: ${result.date || 'N/A'}`);
    console.log(`  Status: ${result.status || 'N/A'}`);
    if (result.tags && result.tags.length > 0) {
      console.log(`  Tags: ${Array.isArray(result.tags) ? result.tags.join(', ') : result.tags}`);
    }
    console.log('');
  }
  
  console.log('⚠️  Please review these entries to determine if this is a true duplicate.');
  console.log('   Consider: Similar problem but different solution, same request from different angle, etc.\n');
  
  return 1;
}

// Main execution
if (process.argv.length < 3) {
  console.error('Usage: node scripts/check-duplicate.js "Want Title"');
  console.error('Example: node scripts/check-duplicate.js "I want better CSS Grid debugging"');
  process.exit(1);
}

const searchTitle = process.argv[2];

if (!searchTitle || searchTitle.trim().length === 0) {
  console.error('Error: Want title cannot be empty');
  process.exit(1);
}

const exitCode = checkDuplicates(searchTitle);
process.exit(exitCode);