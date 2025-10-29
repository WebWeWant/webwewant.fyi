# Want Processing Instructions for GitHub Copilot

Follow these detailed instructions when processing Want submissions for the Web We Want project.

## Quick Reference

### Required Markdown Fields
- `title`: "I want [description]" format
- `date`: ISO date string (current date/time)
- `submitter`: Submitter's name or "Anonymous"
- `number`: Submission ID from issue
- `tags`: Array of relevant technology labels
- `discussion`: GitHub discussions URL ending with the original issue number (e.g. `https://github.com/WebWeWant/webwewant.fyi/discussions/<issue-number>`)
- `status`: "discussing"

### Optional Fields
- `related`: Array of related specifications/articles with title, url, type

### Essential Commands
- `npm run create-want` - Generate UUID and markdown template
- `npm run check-duplicate "Want Title"` - Check for potential duplicates (fuzzy matching)
- `npm run validate-want wants/<ID>.md` - Validate markdown file

### Triage Decision Tree
1. **Spam/abuse/honeypot triggered?** → DELETE and close issue immediately
2. **Links to commercial services (>2 links)?** → FLAG as potential spam, review carefully
3. **Off-topic (not web platform)?** → REJECT with "off-topic" label, close issue
4. **Missing required fields?** → REJECT with explanation, close issue  
5. **Potential duplicate?** → Run `npm run check-duplicate`, flag for human review if similar
6. **Passes all checks?** → CREATE markdown file and PR per "Creating Approved Submissions" section

### Similarity Score Guidelines (for duplicate checking)
- **90-100%** = Very likely duplicate → Flag for human review
- **70-89%** = Possibly duplicate → Flag for human review
- **<70%** = Probably unique → Proceed with processing

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

**Immediately delete and close submissions that:**
1. **Triggered honeypot** - "website" field is filled (automated spam)
2. **Contain excessive links** - More than 2 external links (likely promotional)
3. **Commercial promotion** - Advertising services, products, or companies
4. **Abusive content** - Hateful, threatening, or inappropriate language
5. **Non-English content** - Unless directly related to internationalization features
6. **Obvious bot submissions** - Generic text, random characters, or template spam

**When deleting spam:**
- Close the issue immediately
- Add comment: "This submission was automatically detected as spam and removed."
- Do not engage with or provide detailed feedback on spam submissions

**Note:** Since GitHub Copilot cannot delete issues entirely, editing the content to remove harmful links and material is essential for security and preventing abuse.

### Step 2: Relevance Check 🎯

**Approve submissions that:**
1. **Relate to web platform evolution** - HTML, CSS, JavaScript, browser APIs, developer tools
2. **Include required information** - Clear title, detailed description, contact info
3. **Are technically feasible** - Not requesting impossible or deprecated features
4. **Show understanding** - Demonstrate knowledge of web development challenges
5. **Are respectful** - Professional language and constructive tone

**Common off-topic submissions (reject with "off-topic" label):**
- Browser troubleshooting or bug reports for specific sites
- Requests for help with personal projects
- General software or non-web technology requests
- Infrastructure or hosting questions
- Questions about using existing APIs (rather than improving them)

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

**Always check for duplicates using:**
```bash
npm run check-duplicate "Want Title From Issue"
```

**If potential duplicates found (exit code 1):**
1. Review the similarity scores and descriptions
2. If 70%+ similarity, add "possible duplicate" label
3. Comment with links to potential matches
4. **Do not close** - flag for human review instead
5. Humans will make final determination on true duplicates

**If UNIQUE, proceed to Step 5**

### Step 5: Want File Creation 📄

**For approved submissions, follow this process:**

1. **Generate markdown template:**
   ```bash
   npm run create-want
   ```
   This creates `wants/<ID>.md` with proper structure

2. **Fill in the generated file** with data from the issue:
   - `title`: Ensure starts with "I want" and is descriptive
   - `date`: Current ISO date string
   - `submitter`: Use provided name or "Anonymous" if privacy requested
   - `number`: Use the generated UUID
   - `tags`: Add 1-3 relevant technology labels (see tag list below)
   - `discussion`: Use GitHub discussions URL whose trailing ID matches the original issue number
   - `status`: Set to "discussing"
   - Content: Clean up and enhance the description for clarity

3. **Add related links** if applicable:
   ```yaml
   related:
     - title: HTML Standard
       url: https://html.spec.whatwg.org/
       type: spec
   ```

4. **Update the original issue body** to match the polished want content:
   - Remove any frontmatter or submission metadata that came from the form
   - Replace the issue description with the cleaned narrative used in the want markdown (no YAML blocks)
   - Confirm the issue title remains accurate so conversion to a discussion keeps the right context

5. **Validate the file:**
   ```bash
   npm run validate-want wants/<ID>.md
   ```

6. **Create pull request:**
   - Branch: `submission/<descriptive-name>`
   - Title: "Add want: [Want Title]"
   - Include issue number in PR description
   - Request review from maintainers

## 🎨 Content Quality Standards

### Content Enhancement Guidelines

1. **Title formatting:** Always start with "I want" and be specific
2. **Content editing:** Improve grammar, add context, fix technical terminology
3. **Examples:** Include code samples or use cases when helpful
4. **Related links:** Add relevant specs, articles, or proposals when available
5. **Technical accuracy:** Verify terminology and concepts are correct

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

**Related Links to Consider:**
- W3C specifications and working drafts
- WHATWG living standards  
- IETF RFCs
- Ecma International standards
- Browser vendor documentation
- Established developer resources
- GitHub repositories for standards work
- MDN documentation for context

## 📋 Response Templates

### For Spam/Abuse
```
This submission was automatically detected as spam and removed.
```

### For Off-Topic Submissions
```
Thank you for your submission. This request appears to be outside the scope of Web We Want, which focuses on improvements to web platform standards (HTML, CSS, JavaScript) and browser implementations. For support questions, please refer to appropriate community forums.
```

### For Missing Information
```
This submission is missing required information: [list missing fields]

Please provide the missing information and resubmit through the form at https://webwewant.fyi/#submit

Closing this issue.
```

### For Possible Duplicates
```
This submission may be a duplicate of existing want(s):

[List potential matches with links]

This issue has been flagged with the "possible duplicate" label for human review to determine if this is truly a duplicate or a different request with similar goals.
```

### For Approval
```
This submission has been approved and will be processed.

Creating pull request with the want information.
```

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
- [ ] Spam detection completed (deleted if spam)
- [ ] Relevance to web platform confirmed  
- [ ] Appropriate technology tags applied (1-3 tags)
- [ ] Duplicate check performed using script
- [ ] Content enhanced for clarity and completeness
- [ ] Related links added where applicable
- [ ] Markdown file validates successfully
- [ ] Branch and PR created with proper naming

## 🚀 Processing Tips

**Important Notes:**
- **Single source of truth:** These instructions are your only guidance - don't reference other documentation
- **Act decisively:** Process submissions quickly but thoroughly
- **Maintain quality:** Enhance content for clarity while preserving submitter intent
- **Preserve context:** Always reference the original issue number in PRs and ensure discussion URLs end with that number
- **Human escalation:** When in doubt, flag for human review rather than rejecting

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
