# Want Processing Instructions for GitHub Copilot

Follow these detailed instructions when processing Want submissions for the Web We Want project.

> **⚠️ CRITICAL RULE: A pull request created during wants processing must contain only one change — the addition of a new Markdown file under `wants/`. Modifying any other file (issue bodies, existing want files, workflows, configuration, or any other repository file) is strictly prohibited.**

## Quick Reference

### Required Markdown Fields

- `title`: "I want [description]" format
- `date`: ISO date string (current date/time)
- `submitter`: Submitter's name or "Anonymous"
- `number`: Submission ID from issue
- `tags`: Array of relevant technology labels
- `discussion`: GitHub issues URL pointing to the source issue as a placeholder (e.g. `https://github.com/WebWeWant/webwewant.fyi/issues/<issue-number>`). This will be updated to the discussion URL after a maintainer converts the issue to a discussion.
- `status`: "discussing"

### Optional Fields

- `related`: Array of related specifications/articles with title, url, type

### Essential Commands

- `npm run create-want -- <issue-number>` - Generate UUID and markdown template with discussion URL pre-populated (e.g. `npm run create-want -- 850`)
- `npm run check-duplicate "Want Title"` - Check for potential duplicates (fuzzy matching)
- `npm run validate-want wants/<ID>.md` - Validate markdown file
- `npm run convert-to-discussion -- <issue-number> [category-name]` - Convert a GitHub issue to a discussion via the GraphQL API and print the new discussion URL (e.g. `npm run convert-to-discussion -- 850`)

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
2. If >= 70% similarity, add "possible duplicate" label
3. Comment with links to potential matches
4. **Do not close** - flag for human review instead
5. Humans will make final determination on true duplicates

**If UNIQUE, proceed to Step 5**

### Step 5: Want File Creation 📄

**For approved submissions, follow this process:**

1. **Generate markdown template:**

   ```bash
   npm run create-want -- <issue-number>
   ```

   Replace `<issue-number>` with the original GitHub issue number (e.g. `npm run create-want -- 850`). This creates `wants/<ID>.md` with the `discussion` field pre-set to `https://github.com/WebWeWant/webwewant.fyi/issues/<issue-number>` as a placeholder. **Note:** GitHub no longer preserves the issue number when converting to a discussion — the discussion will receive a new net-new number. The issues URL works as a redirect after conversion, but will need to be updated to the real discussion URL once known.

2. **Fill in the generated file** with data from the issue:
   - `title`: Ensure starts with "I want" and is descriptive
   - `date`: Current ISO date string
   - `submitter`: Use provided name or "Anonymous" if privacy requested
   - `number`: Use the generated UUID
   - `tags`: Add 1-3 relevant technology labels (see tag list below)
   - `discussion`: Use the source issue URL as a placeholder: `https://github.com/WebWeWant/webwewant.fyi/issues/<issue-number>`. GitHub redirects this to the correct discussion after conversion, but a maintainer will need to update it to the real `/discussions/<new-number>` URL once the issue is converted.
   - `status`: Set to "discussing"
   - Content: Clean up and enhance the description for clarity

3. **Add related links** if applicable:

   ```yaml
   related:
     - title: HTML Standard
       url: https://html.spec.whatwg.org/
       type: spec
   ```

4. **Update the original issue body** directly via the GitHub API (this is a direct issue edit, NOT a file committed to the PR):
   - Remove any frontmatter or submission metadata that came from the form
   - Replace the issue description with the cleaned narrative used in the want markdown (no YAML blocks)
   - Confirm the issue title remains accurate so conversion to a discussion keeps the right context

5. **Validate the file:**

   ```bash
   npm run validate-want wants/<ID>.md
   ```

   A note about the `discussion` field using an issue URL placeholder is expected and can be ignored — it will be resolved after the maintainer converts the issue to a discussion.

6. **Create pull request:**
   - Branch: `submission/<descriptive-name>`
   - Title: "Add want: [Want Title]"
   - Include issue number in PR description
   - Request review from maintainers
   - **The PR must contain only the new `wants/<ID>.md` file. Modifying any other file is strictly prohibited.**

7. **Add a conversion reminder comment to the PR** immediately after opening it:
   - Explain that the issue must be converted to a discussion after this PR is merged
   - Provide the direct issue link
   - Note that GitHub assigns a **new net-new discussion number** (not the same as the issue number)
   - Ask the maintainer to post the new discussion URL as a comment on the PR so the `discussion` field in `wants/<ID>.md` can be updated

   Use this template:

   ```
   ⚠️ **Action required after merging:** Convert the source issue to a discussion

   Issue #<number> needs to be converted to a discussion after this PR is merged:

   1. Go to https://github.com/WebWeWant/webwewant.fyi/issues/<number>
   2. Click the three-dot menu (⋯) at the top-right of the issue and select **"Convert to discussion"**
   3. Choose the **"Wants"** category (or "General" if Wants is unavailable)
   4. GitHub will assign a **new discussion number** that differs from the issue number
   5. Once converted, please reply to this PR with the new discussion URL (e.g. `https://github.com/WebWeWant/webwewant.fyi/discussions/<new-number>`) so that `wants/<ID>.md` can be updated accordingly
   ```

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
- [ ] Original issue body updated directly via GitHub API with cleaned narrative (not via PR)
- [ ] Markdown file validates successfully
- [ ] Branch and PR created with proper naming
- [ ] PR contains only the new `wants/<ID>.md` file — no other files modified
- [ ] Conversion reminder comment posted on the PR with issue link and instructions

## 🚀 Processing Tips

**Important Notes:**

- **PR scope is strictly limited:** The only change a PR may contain is adding a new `wants/<ID>.md` file. No other files may be modified.
- **Single source of truth:** These instructions are your only guidance - don't reference other documentation
- **Act decisively:** Process submissions quickly but thoroughly
- **Maintain quality:** Enhance content for clarity while preserving submitter intent
- **Preserve context:** Always reference the original issue number in PRs. Use the `/issues/<number>` URL as the `discussion` placeholder — it redirects after conversion, and a maintainer will update it to the real discussion URL once they know it.
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

When a want PR is merged, the source issue must be converted to a discussion and the want markdown file updated with the correct discussion URL.

> **Important:** GitHub no longer preserves the issue number when converting to a discussion. The new discussion receives a **net-new number** that differs from the original issue number. The want file is initially created with an `/issues/<number>` placeholder URL; this must be updated to the real `/discussions/<new-number>` URL after conversion.

### Agent-Assisted Conversion (preferred)

The agent can perform the conversion directly using the CLI script:

```bash
npm run convert-to-discussion -- <issue-number>
# e.g. npm run convert-to-discussion -- 850
```

This calls the GitHub GraphQL `convertIssueToDiscussion` mutation, targets the **"Wants"** category by default (falls back to "General", then the first available category), and prints the new discussion URL. Once the URL is known, update the want file:

1. Edit `wants/<ID>.md` — change the `discussion` field from the `/issues/<old-number>` placeholder to the printed `/discussions/<new-number>` URL.
2. Commit with message: `Update discussion URL for want <ID>`.
3. Push directly to `main` (or open a follow-up PR).

### Conversion Steps for Maintainers (manual fallback)

1. **Clean the Issue Content First:**
   - Edit the current issue to remove submission metadata (ID, timestamp, form fields)
   - Remove processing instructions and JSON data blocks
   - Remove "@github-copilot[bot]" mentions and processing comments
   - Keep only the essential want description and clean title
   - Ensure the content is well-formatted for a discussion

2. **Convert Issue to Discussion:**
   - On the issue page, click the three-dot menu (⋯) at the top-right and select **"Convert to discussion"**
   - Choose the **"Wants"** category (or "General" if Wants is unavailable)
   - GitHub will create a new discussion with a **new number** — note this number

3. **Provide the New Discussion URL:**
   - Post the new discussion URL (e.g. `https://github.com/WebWeWant/webwewant.fyi/discussions/<new-number>`) as a comment on the merged PR
   - This allows the agent or a maintainer to update the want file

4. **Update the Want Markdown File:**
   - In `wants/<ID>.md`, change the `discussion` field from the `/issues/<old-number>` placeholder to the new `/discussions/<new-number>` URL
   - Commit the change directly to `main` (or via a follow-up PR)

5. **Add Implementation Context (optional):**
   - Comment on the newly created discussion to thank the submitter and reference the PR

### If Asked to Do the Update

If a maintainer provides the new discussion URL in a PR comment and asks the agent to update the want file, the agent should:
1. Edit `wants/<ID>.md` to replace the `discussion` URL with the new `/discussions/<new-number>` URL
2. Commit the change with message: `Update discussion URL for want <ID>`
3. Push directly to the branch or open a follow-up PR as appropriate
