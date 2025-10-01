# Want Processing Instructions for GitHub Copilot

Follow these detailed instructions when processing want submissions for the Web We Want project.

## 🎯 Mission & Scope

Web We Want focuses on **web platform evolution** including:
- HTML elements and attributes
- CSS properties and features  
- JavaScript APIs and language features
- Browser behavior and standards
- Developer tools improvements
- Web accessibility enhancements

## 📝 Processing Workflow

### Step 1: Spam Detection ⚠️

**Analyze submission for spam indicators:**

✅ **NOT Spam - Proceed to Step 2:**
- Technical content about web technologies
- Specific, actionable requests
- Professional language and formatting
- Demonstrates understanding of web development

❌ **IS Spam - Take Action:**
- Generic promotional content
- Links to commercial services unrelated to web standards
- Excessive capitalization or suspicious formatting
- Non-technical content or obvious bot submissions
- Malicious links or potentially harmful content
- Offensive language or inappropriate scenarios

**If SPAM detected:**
1. **Edit the issue content** to remove harmful elements:
   - Replace issue title with: "SPAM - Content Removed"
   - Replace issue body with: "This submission was identified as spam. The original content has been removed to prevent potential harm. If this was done in error, please contact the maintainers."
   - Remove all external links, promotional content, and offensive material
2. Add label: `spam`
3. Close issue immediately
4. Comment: "This submission has been automatically detected as spam. The content has been sanitized and the issue closed. If this was done in error, please contact the maintainers."

**Note:** Since GitHub Copilot cannot delete issues entirely, editing the content to remove harmful links and material is essential for security and preventing abuse.

### Step 2: Relevance Check 🎯

**Evaluate against Web We Want mission:**

✅ **RELEVANT - Proceed to Step 3:**
- HTML/CSS/JavaScript improvements
- Browser feature requests
- Developer tools enhancements
- Web accessibility features
- Standards-related proposals
- Cross-browser compatibility issues

❌ **OFF-TOPIC - Take Action:**
- Browser troubleshooting requests
- Personal website help
- Non-web technologies
- General software complaints
- Specific bug reports (not feature requests)

**If OFF-TOPIC:**
1. Add label: `off-topic`
2. Close issue
3. Comment: "Thank you for your submission. This request appears to be outside the scope of Web We Want, which focuses on improvements to web platform standards (HTML, CSS, JavaScript) and browser implementations. For support questions, please refer to appropriate community forums."

### Step 3: Technology Classification 🏷️

**Apply appropriate labels (select 1-3 most relevant):**

**Core Technologies:**
- `html` - HTML elements, attributes, semantic markup
- `css` - CSS properties, selectors, styling, layout
- `javascript` - JS language features, Web APIs, ECMAScript

**Specialized Areas:**
- `accessibility` - Screen readers, WCAG, inclusive design
- `dom` - Document Object Model, including window, navigator, CSSOM, etc.
- `api` - Web APIs
- `devtools` - Browser developer tools, debugging, profiling
- `browsers` - Browser behavior, implementation differences
- `web-apps` - PWAs, app-like functionality, offline capabilities
- `forms` - Form elements, validation, input types
- `typography` - Text rendering, fonts, internationalization
- `user-experience` / `ux` - UI patterns, user interaction
- `urls` - URL handling, routing, navigation, history
- `extensions` - Browser extension capabilities
- `custom-elements` - Web components, shadow DOM

**Classification Guidelines:**
- Read the want description carefully
- Identify primary and secondary technologies
- Use specific labels over general ones
- Avoid over-labeling (max 3-4 labels)

### Step 4: Duplicate Detection 🔍

**Search existing wants for similar requests:**

**Search Strategy:**
1. Use assigned technology labels to filter relevant wants
2. Look for keyword matches in titles and descriptions
3. Consider problem space overlap, not just solution similarity
4. Check `/wants` directory systematically

**Similarity Criteria:**
- **High similarity (DUPLICATE):** Nearly identical problem and solution
- **Medium similarity (RELATED):** Same problem, different approach  
- **Low similarity (UNIQUE):** Different problem or use case

**If DUPLICATE found:**
1. Add label: `duplicate`
2. Close issue
3. Comment: "This want appears to be very similar to an existing submission: [Link to existing want]. Please add your support and additional details to that discussion instead."

**If UNIQUE, proceed to Step 5**

### Step 5: Want File Creation 📄

**Generate a pull request with new want file:**

**File Structure:**
```yaml
---
title: I want [CLEAR, SPECIFIC TITLE]
date: [ISO_DATE_STRING - use current date/time]
submitter: [SUBMITTER_NAME or "Anonymous"]
number: [USE_SUBMISSION_ID]
tags: [ assigned-labels ]
discussion: https://github.com/WebWeWant/webwewant.fyi/discussions/[USE_ISSUE_ID]
status: discussing
related:
  - title: [SPEC_OR_ARTICLE_TITLE]
    url: [URL]
    type: [spec|draft|article|proposal|project]
---

[ENHANCED_CONTENT_HERE]
```

**Content Enhancement Guidelines:**
1. **Title:** Ensure starts with "I want" and is specific
2. **Content:** Edit for clarity, fix grammar, add context
3. **Examples:** Include code samples or use cases when helpful
4. **Technical accuracy:** Verify terminology and concepts
5. **Related links:** Add relevant specifications, proposals, articles

**Related Links to Consider:**
- W3C specifications and working drafts
- WHATWG living standards  
- Browser vendor documentation
- Established developer resources
- GitHub repositories for standards work
- MDN documentation for context

**PR Requirements:**
- **File:** `/wants/{SUBMISSION_ID}.md`
- **Title:** `Add want: [TITLE]`
- **Description:** Reference original issue number
- **Request review** from repository maintainers

## 🎨 Content Quality Standards

### Writing Style:
- Clear, professional language
- Maintain submitter's intent while improving clarity
- Use active voice where possible
- Include concrete examples when beneficial

### Technical Standards:
- Verify correct terminology usage
- Ensure proposals are technically feasible
- Consider backward compatibility implications
- Reference existing standards when relevant

### Link Quality:
- Prioritize official specifications
- Include authoritative developer resources  
- Verify links are current and accessible
- Avoid linking to outdated/deprecated content

## 📊 Example Processing

### Example 1: Legitimate Want
```markdown
## Processing Want #123: "Better CSS Grid debugging"

✅ **Spam Check:** Technical content, specific request - NOT SPAM
✅ **Relevance:** CSS developer tools improvement - RELEVANT  
✅ **Classification:** Added labels: css, devtools
✅ **Duplicate Check:** Similar requests exist but different focus - UNIQUE
✅ **Want Creation:** Generated /wants/123.md with enhanced content

**Created PR #456** with:
- Improved title clarity
- Added technical context about current limitations
- Included links to CSS Grid Level 1 spec
- Referenced Firefox DevTools implementation
```

### Example 2: Spam Handling
```markdown
## Processing Want #124: Originally contained promotional links

❌ **Spam Check:** Generic promotional content with commercial links - IS SPAM
🔧 **Content Sanitization:** 
- Edited title to: "SPAM - Content Removed"
- Replaced body with sanitization notice
- Removed all external promotional links
- Added spam label and closed issue
```

## 🔧 Quality Checklist

Before creating the want file, verify:
- [ ] Spam detection completed (content sanitized if needed)
- [ ] Relevance to web platform confirmed
- [ ] Appropriate technology labels applied
- [ ] Duplicate search conducted thoroughly
- [ ] Content enhanced for clarity and completeness
- [ ] Related links added where applicable
- [ ] Frontmatter properly formatted
- [ ] File named with submission ID

**For Spam Issues:**
- [ ] Issue title changed to "SPAM - Content Removed"
- [ ] Issue body replaced with sanitization notice
- [ ] All external links and promotional content removed
- [ ] Spam label applied
- [ ] Issue closed with explanatory comment

## 🚀 Processing Tips

**Efficiency:**
- Process steps sequentially - don't skip ahead
- Document reasoning in issue comments
- Be decisive but explain your logic
- When in doubt, err on the side of inclusion

**Quality:**
- Focus on the submitter's core intent
- Enhance without changing meaning
- Add value through context and links
- Maintain consistency with existing wants

## 🔄 Post-Implementation: Issue to Discussion Conversion

When a want PR is merged, you may be asked to convert the original issue to a discussion to keep community conversation going.

### Direct Conversion Process:

**Important**: Convert the issue DIRECTLY to a discussion (don't create a new one) to preserve the same ID. This ensures existing want markdown files continue to reference the correct discussion.

1. **Clean the Issue Content First:**
   - Edit the current issue to remove submission metadata (ID, timestamp, form fields)
   - Remove processing instructions and JSON data blocks
   - Remove "@github-copilot[bot]" mentions and processing comments
   - Keep only the essential want description and clean title
   - Ensure the content is well-formatted for a discussion

2. **Convert Issue to Discussion:**
   - Use the GitHub API to convert this issue directly to a discussion
   - Choose "General" category (or "Wants" if available)
   - The ID will remain the same after conversion

3. **Add Implementation Context:**
   - Comment on the newly created discussion
   - Reference the implementing PR number
   - Thank the submitter and community

4. **Example Implementation Comment:**
   ```
   🎉 This want has been implemented in PR #XXX!
   
   Thank you @[submitter] for this valuable contribution to making the web better. 
   The community can continue discussing this feature here.
   ```

**Key Benefits:**
- Same ID preserved → want markdown files reference correct discussion
- Clean discussion content without processing metadata
- Continued community engagement on implemented features