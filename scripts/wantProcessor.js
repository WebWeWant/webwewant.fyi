const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Utility functions for processing want submissions
 */

/**
 * Generate a new want file with proper frontmatter
 * @param {Object} wantData - The want submission data
 * @param {string} wantData.title - The want title
 * @param {string} wantData.submitter - The submitter name
 * @param {string} wantData.description - The want description
 * @param {Array<string>} wantData.tags - Array of technology tags
 * @param {string} wantData.submissionId - Unique submission ID
 * @param {Array<Object>} wantData.related - Related links (optional)
 * @returns {Object} Generated file data
 */
function generateWantFile(wantData) {
  const {
    title,
    submitter = 'Anonymous',
    description,
    tags = [],
    submissionId,
    related = []
  } = wantData;

  // Ensure title starts with "I want"
  const formattedTitle = title.startsWith('I want') 
    ? title 
    : `I want ${title.toLowerCase()}`;

  // Generate current ISO date
  const currentDate = new Date().toISOString();

  // Create frontmatter
  const frontmatter = {
    title: formattedTitle,
    date: currentDate,
    submitter: submitter,
    number: submissionId,
    tags: tags.length > 0 ? tags : ['uncategorized'],
    discussion: `https://github.com/WebWeWant/webwewant.fyi/discussions/${submissionId}`,
    status: 'discussing'
  };

  // Add related links if provided
  if (related.length > 0) {
    frontmatter.related = related;
  }

  // Format frontmatter as YAML
  const yamlFrontmatter = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        if (key === 'related') {
          return `${key}:\n${value.map(item => 
            `  - title: ${item.title}\n    url: ${item.url}\n    type: ${item.type}`
          ).join('\n')}`;
        } else {
          return `${key}: [ ${value.join(', ')} ]`;
        }
      }
      return `${key}: ${value}`;
    })
    .join('\n');

  // Combine frontmatter and content
  const fileContent = `---
${yamlFrontmatter}
---

${description.trim()}
`;

  return {
    filename: `${submissionId}.md`,
    content: fileContent,
    path: path.join('wants', `${submissionId}.md`)
  };
}

/**
 * Parse existing want files to extract metadata
 * @param {string} wantsDirectory - Path to wants directory
 * @returns {Array<Object>} Array of want metadata
 */
function parseExistingWants(wantsDirectory) {
  const wants = [];
  
  try {
    const files = fs.readdirSync(wantsDirectory)
      .filter(file => file.endsWith('.md'));

    for (const file of files) {
      try {
        const filePath = path.join(wantsDirectory, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];
          
          // Parse key fields (simple parsing for this use case)
          const title = extractField(frontmatter, 'title');
          const tags = extractArrayField(frontmatter, 'tags');
          const contentBody = content.replace(/^---\n[\s\S]*?\n---\n/, '');
          
          wants.push({
            filename: file,
            title: title,
            tags: tags,
            content: contentBody.trim(),
            filePath: filePath
          });
        }
      } catch (err) {
        console.warn(`Warning: Could not parse ${file}:`, err.message);
      }
    }
  } catch (err) {
    console.error('Error reading wants directory:', err.message);
  }

  return wants;
}

/**
 * Find similar wants based on content and tags
 * @param {Object} newWant - New want data
 * @param {Array<Object>} existingWants - Existing wants array
 * @returns {Array<Object>} Array of similar wants
 */
function findSimilarWants(newWant, existingWants) {
  const similar = [];
  const newWantWords = tokenizeContent(newWant.title + ' ' + newWant.description);
  const newWantTags = new Set(newWant.tags || []);

  for (const existing of existingWants) {
    let similarity = 0;
    
    // Tag overlap scoring (40% weight)
    const existingTags = new Set(existing.tags || []);
    const tagOverlap = [...newWantTags].filter(tag => existingTags.has(tag)).length;
    const tagSimilarity = tagOverlap / Math.max(newWantTags.size, existingTags.size);
    similarity += tagSimilarity * 0.4;

    // Content similarity scoring (60% weight)
    const existingWords = tokenizeContent(existing.title + ' ' + existing.content);
    const wordOverlap = countWordOverlap(newWantWords, existingWords);
    const contentSimilarity = wordOverlap / Math.max(newWantWords.size, existingWords.size);
    similarity += contentSimilarity * 0.6;

    // Consider as similar if similarity > 0.3 (30%)
    if (similarity > 0.3) {
      similar.push({
        want: existing,
        similarity: similarity,
        reasons: {
          tagOverlap: tagOverlap,
          tagSimilarity: tagSimilarity,
          contentSimilarity: contentSimilarity
        }
      });
    }
  }

  // Sort by similarity score (highest first)
  return similar.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Extract a field value from frontmatter text
 * @param {string} frontmatter - Frontmatter text
 * @param {string} field - Field name
 * @returns {string} Field value
 */
function extractField(frontmatter, field) {
  const match = frontmatter.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : '';
}

/**
 * Extract array field from frontmatter
 * @param {string} frontmatter - Frontmatter text
 * @param {string} field - Field name
 * @returns {Array<string>} Array of values
 */
function extractArrayField(frontmatter, field) {
  const match = frontmatter.match(new RegExp(`^${field}:\\s*\\[([^\\]]+)\\]$`, 'm'));
  if (match) {
    return match[1].split(',').map(tag => tag.trim().replace(/^['"]|['"]$/g, ''));
  }
  
  // Try alternate format with dashes
  const lines = frontmatter.split('\n');
  const fieldIndex = lines.findIndex(line => line.trim() === `${field}:`);
  if (fieldIndex !== -1) {
    const tags = [];
    for (let i = fieldIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('- ')) {
        tags.push(line.substring(2).trim());
      } else if (line.endsWith(':') && !line.startsWith(' ')) {
        break; // Start of next field
      }
    }
    return tags;
  }
  
  return [];
}

/**
 * Tokenize content for similarity comparison
 * @param {string} text - Text to tokenize
 * @returns {Set<string>} Set of normalized words
 */
function tokenizeContent(text) {
  return new Set(
    text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !isStopWord(word))
  );
}

/**
 * Count word overlap between two sets
 * @param {Set<string>} words1 - First word set
 * @param {Set<string>} words2 - Second word set
 * @returns {number} Number of overlapping words
 */
function countWordOverlap(words1, words2) {
  return [...words1].filter(word => words2.has(word)).length;
}

/**
 * Check if word is a stop word
 * @param {string} word - Word to check
 * @returns {boolean} True if stop word
 */
function isStopWord(word) {
  const stopWords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'had', 'with', 'have', 'this', 'will', 'his', 'they', 'she', 'has', 'its'
  ]);
  return stopWords.has(word);
}

/**
 * Validate want data before processing
 * @param {Object} wantData - Want data to validate
 * @returns {Object} Validation result
 */
function validateWantData(wantData) {
  const errors = [];
  
  if (!wantData.title || wantData.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (!wantData.description || wantData.description.trim().length === 0) {
    errors.push('Description is required');
  }
  
  if (!wantData.submissionId) {
    errors.push('Submission ID is required');
  }
  
  if (wantData.title && wantData.title.length > 200) {
    errors.push('Title is too long (max 200 characters)');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

module.exports = {
  generateWantFile,
  parseExistingWants,
  findSimilarWants,
  validateWantData,
  extractField,
  extractArrayField,
  tokenizeContent
};