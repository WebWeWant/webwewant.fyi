/**
 * Frontmatter parsing utilities
 */

/**
 * Parse frontmatter from markdown content
 * @param {string} content - Full markdown content
 * @returns {Object|null} Parsed frontmatter and body, or null if no frontmatter
 */
export function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return null;
  }
  
  const [, frontmatterText, body] = match;
  
  try {
    const frontmatter = parseYaml(frontmatterText);
    return {
      frontmatter,
      body: body || ''
    };
  } catch (error) {
    throw new Error(`Failed to parse frontmatter: ${error.message}`);
  }
}

/**
 * Parse only frontmatter (no body) from markdown content  
 * @param {string} content - Full markdown content
 * @returns {Object|null} Parsed frontmatter only, or null if no frontmatter
 */
export function parseFrontmatterOnly(content) {
  const result = parseFrontmatter(content);
  return result ? result.frontmatter : null;
}

/**
 * Simple YAML parser for frontmatter
 * Handles basic YAML structures used in want files
 * @param {string} yamlText - YAML text to parse
 * @returns {Object} Parsed YAML object
 */
function parseYaml(yamlText) {
  const result = {};
  const lines = yamlText.split('\n');
  let currentKey = null;
  let currentArray = null;
  let currentObject = null;
  let inMultilineString = false;
  let multilineValue = '';
  
  // Pre-compile regex patterns for better performance
  const indentedPropertyRegex = /^\s+\w+:/;
  const objectPropertyRegex = /^(\w+):\s*(.+)$/;
  
  /**
   * Initialize array for current key if not already initialized
   */
  const ensureArray = () => {
    if (currentKey && !currentArray) {
      result[currentKey] = [];
      currentArray = result[currentKey];
    }
  };
  
  for (let line of lines) {
    const originalLine = line;
    const trimmedLine = line.trim();
    
    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }
    
    // Handle multiline strings (for content after frontmatter)
    if (inMultilineString) {
      if (trimmedLine === '---' || trimmedLine === '...') {
        inMultilineString = false;
        if (currentKey) {
          result[currentKey] = multilineValue.trim();
        }
        multilineValue = '';
      } else {
        multilineValue += trimmedLine + '\n';
      }
      continue;
    }
    
    // Handle object properties within arrays (indented with spaces, not starting with -)
    if (indentedPropertyRegex.test(originalLine) && !trimmedLine.startsWith('-') && currentObject) {
      const colonIndex = trimmedLine.indexOf(':');
      if (colonIndex > 0) {
        const key = trimmedLine.substring(0, colonIndex).trim();
        const value = trimmedLine.substring(colonIndex + 1).trim();
        currentObject[key] = parseValue(value);
      }
      continue;
    }
    
    // Now work with trimmed line for the rest
    line = trimmedLine;
    
    // Handle array items
    if (line.startsWith('- ')) {
      const value = line.substring(2).trim();
      
      // Initialize array if we have a currentKey but no array yet
      ensureArray();
      
      // Check if this is an object in an array (like related links)
      if (value.includes(':')) {
        const objMatch = objectPropertyRegex.exec(value);
        if (objMatch) {
          const [, key, objValue] = objMatch;
          // Create a new object for this array item
          currentObject = {};
          if (currentArray) {
            currentArray.push(currentObject);
          }
          currentObject[key] = parseValue(objValue);
        }
      } else {
        // Simple array item
        if (currentArray) {
          currentArray.push(parseValue(value));
        }
        // Reset currentObject since this is not an object array item
        currentObject = null;
      }
      continue;
    }
    
    // Handle key-value pairs
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      currentKey = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      // Reset array/object tracking for new key
      currentArray = null;
      currentObject = null;
      
      if (!value) {
        // Empty value might be start of array or multiline
        continue;
      }
      
      // Handle arrays in bracket notation
      if (value.startsWith('[') && value.endsWith(']')) {
        const arrayContent = value.slice(1, -1).trim();
        if (arrayContent) {
          result[currentKey] = arrayContent.split(',').map(item => parseValue(item.trim()));
        } else {
          result[currentKey] = [];
        }
      } else {
        result[currentKey] = parseValue(value);
      }
      continue;
    }
    
    // If we have a current key but no colon, this might be an array start
    if (currentKey && !result.hasOwnProperty(currentKey)) {
      result[currentKey] = [];
      currentArray = result[currentKey];
    }
  }
  
  return result;
}

/**
 * Parse individual YAML values with type detection
 * @param {string} value - Raw value string
 * @returns {any} Parsed value with appropriate type
 */
function parseValue(value) {
  if (!value || value === 'null') {
    return null;
  }
  
  // Remove quotes
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  
  // Boolean values
  if (value === 'true') return true;
  if (value === 'false') return false;
  
  // Numeric values
  if (/^\d+$/.test(value)) {
    return parseInt(value, 10);
  }
  if (/^\d+\.\d+$/.test(value)) {
    return parseFloat(value);
  }
  
  // Return as string
  return value;
}