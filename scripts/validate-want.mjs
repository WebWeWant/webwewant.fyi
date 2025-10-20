#!/usr/bin/env node

/**
 * Want Markdown Validation Script
 * 
 * Fast, lightweight validator for want submission markdown files.
 * Use this instead of running full Eleventy builds for validation.
 * 
 * Usage:
 *   node scripts/validate-want.js <path-to-markdown-file>
 *   node scripts/validate-want.js wants/uuid.md
 * 
 * Exit codes:
 *   0 - Validation passed
 *   1 - Validation failed
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseFrontmatter } from './utils/frontmatter.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VALID_STATUSES = ['discussing', 'complete', 'in-progress'];
const VALID_LINK_TYPES = ['spec', 'draft', 'article', 'proposal', 'project'];
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

function validateTitle(title) {
  if (!title) {
    throw new ValidationError('Missing required field: title');
  }
  if (typeof title !== 'string') {
    throw new ValidationError('title must be a string');
  }
  if (title.length < 5) {
    throw new ValidationError('Title must be at least 5 characters');
  }
  if (title.length > 200) {
    throw new ValidationError('Title must be 200 characters or less');
  }
  if (!title.toLowerCase().startsWith('i want')) {
    console.warn('⚠️  Warning: Title should start with "I want"');
  }
}

function validateDate(date) {
  if (!date) {
    throw new ValidationError('Missing required field: date');
  }
  if (!DATE_REGEX.test(date)) {
    throw new ValidationError(`Invalid date format: ${date}. Must be ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)`);
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new ValidationError(`Invalid date: ${date}`);
  }
  
  // Check that date is not too far in the future (more than 1 day)
  const now = new Date();
  const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  if (dateObj > oneDayFromNow) {
    console.warn(`⚠️  Warning: Date is in the future: ${date}`);
  }
  
  // Check that date is not before 2019 (project start)
  if (dateObj.getFullYear() < 2019) {
    throw new ValidationError(`Date seems incorrect (too old): ${date}`);
  }
}

function validateSubmitter(submitter) {
  if (!submitter) {
    throw new ValidationError('Missing required field: submitter');
  }
  if (typeof submitter !== 'string') {
    throw new ValidationError('submitter must be a string');
  }
  if (submitter.length < 1) {
    throw new ValidationError('submitter cannot be empty');
  }
  if (submitter.length > 100) {
    throw new ValidationError('submitter must be 100 characters or less');
  }
}

function validateNumber(number) {
  if (!number) {
    throw new ValidationError('Missing required field: number');
  }
  // Can be either a UUID or a legacy numeric ID
  if (typeof number === 'string' && UUID_REGEX.test(number)) {
    return; // Valid UUID
  }
  if (typeof number === 'number' && number > 0) {
    return; // Valid legacy numeric ID
  }
  if (typeof number === 'string' && /^\d+$/.test(number)) {
    return; // Valid numeric string
  }
  throw new ValidationError(`Invalid number format: ${number}. Must be UUID or positive integer`);
}

function validateTags(tags) {
  if (!tags) {
    throw new ValidationError('Missing required field: tags');
  }
  if (!Array.isArray(tags)) {
    throw new ValidationError('tags must be an array');
  }
  if (tags.length === 0) {
    throw new ValidationError('tags array cannot be empty');
  }
  if (tags.length > 5) {
    throw new ValidationError('tags array cannot have more than 5 items');
  }
  
  for (const tag of tags) {
    if (typeof tag !== 'string') {
      throw new ValidationError('All tags must be strings');
    }
    if (tag.length < 2) {
      throw new ValidationError(`Tag too short: "${tag}"`);
    }
    if (tag.length > 30) {
      throw new ValidationError(`Tag too long: "${tag}"`);
    }
  }
}

function validateDiscussion(discussion) {
  if (!discussion) {
    throw new ValidationError('Missing required field: discussion');
  }
  
  // Basic URL validation
  let url;
  try {
    url = new URL(discussion);
  } catch (e) {
    throw new ValidationError(`Invalid discussion URL: ${discussion}`);
  }
  
  // Check if it's a GitHub discussions URL
  if (!discussion.includes('github.com') || !discussion.includes('/discussions/')) {
    throw new ValidationError(`Discussion URL must be a GitHub discussions URL: ${discussion}`);
  }
  
  // Restrict to http/https protocols only for security
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new ValidationError(`Invalid discussion URL protocol: ${url.protocol}. Only http:// and https:// are allowed.`);
  }
}

function validateStatus(status) {
  if (!status) {
    throw new ValidationError('Missing required field: status');
  }
  if (!VALID_STATUSES.includes(status)) {
    throw new ValidationError(`Invalid status: ${status}. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }
}

function validateRelated(related) {
  if (related !== undefined && related !== null) {
    if (!Array.isArray(related)) {
      throw new ValidationError('related must be an array');
    }
    
    for (const item of related) {
      if (typeof item !== 'object' || item === null) {
        throw new ValidationError('related items must be objects');
      }
      
      if (!item.title || typeof item.title !== 'string') {
        throw new ValidationError('related items must have a title (string)');
      }
      
      if (!item.url || typeof item.url !== 'string') {
        throw new ValidationError('related items must have a url (string)');
      }
      
      // Validate URL format
      try {
        const url = new URL(item.url);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          throw new ValidationError(`Invalid related URL protocol: ${url.protocol}`);
        }
      } catch (e) {
        throw new ValidationError(`Invalid related URL: ${item.url}`);
      }
      
      if (!item.type || typeof item.type !== 'string') {
        throw new ValidationError('related items must have a type (string)');
      }
      
      if (!VALID_LINK_TYPES.includes(item.type)) {
        throw new ValidationError(`Invalid related type: ${item.type}. Must be one of: ${VALID_LINK_TYPES.join(', ')}`);
      }
    }
  }
}

function validateMarkdownFile(filePath) {
  console.log(`\n📝 Validating: ${filePath}\n`);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new ValidationError(`File not found: ${filePath}`);
  }
  
  // Read file content
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Parse frontmatter
  const parsed = parseFrontmatter(content);
  
  if (!parsed) {
    throw new ValidationError('No frontmatter found. File must start with --- and end with ---');
  }
  
  const { frontmatter, body } = parsed;
  
  console.log('✓ Frontmatter parsed');
  
  // Validate required fields
  validateTitle(frontmatter.title);
  console.log(`✓ Title: ${frontmatter.title}`);
  
  validateDate(frontmatter.date);
  console.log(`✓ Date: ${frontmatter.date}`);
  
  validateSubmitter(frontmatter.submitter);
  console.log(`✓ Submitter: ${frontmatter.submitter}`);
  
  validateNumber(frontmatter.number);
  console.log(`✓ Number: ${frontmatter.number}`);
  
  validateTags(frontmatter.tags);
  console.log(`✓ Tags: ${Array.isArray(frontmatter.tags) ? frontmatter.tags.join(', ') : frontmatter.tags}`);
  
  validateDiscussion(frontmatter.discussion);
  console.log(`✓ Discussion: ${frontmatter.discussion}`);
  
  validateStatus(frontmatter.status);
  console.log(`✓ Status: ${frontmatter.status}`);
  
  // Validate optional fields if present
  validateRelated(frontmatter.related);
  if (frontmatter.related && frontmatter.related.length > 0) {
    console.log(`✓ Related links: ${frontmatter.related.length} item(s)`);
  }
  
  // Check if body exists (content after frontmatter)
  if (body.trim().length === 0) {
    console.warn('⚠️  Warning: No content found after frontmatter');
  } else {
    console.log(`✓ Content present (${body.trim().length} characters)`);
  }
  
  // Validate filename if it's in the wants directory
  if (filePath.includes('/wants/')) {
    const filename = path.basename(filePath, '.md');
    const number = frontmatter.number.toString();
    if (filename !== number) {
      throw new ValidationError(`Filename (${filename}) does not match number field (${number})`);
    }
    console.log('✓ Filename matches number field');
  }
  
  console.log('\n✅ Validation passed!\n');
  return true;
}

// Main execution
if (process.argv.length < 3) {
  console.error('Usage: node scripts/validate-want.js <path-to-markdown-file>');
  console.error('Example: node scripts/validate-want.js wants/550e8400-e29b-41d4-a716-446655440000.md');
  process.exit(1);
}

const markdownFile = process.argv[2];

try {
  validateMarkdownFile(markdownFile);
  process.exit(0);
} catch (error) {
  console.error(`\n❌ Validation failed: ${error.message}\n`);
  process.exit(1);
}