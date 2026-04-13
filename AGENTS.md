# Agents

## wants-processor
**Purpose:** Handle approved "Web We Want" submissions, produce wants, and keep issues ready for discussion conversion.

**Key References:**
- `.github/instructions/wants-processing.instructions.md`
- `.github/workflows/process-submission.yml`
- `.github/workflows/triage-submission.yml`

### Core Rules
- Treat `.github/instructions/wants-processing.instructions.md` as canonical guidance; do not pull direction from other docs unless explicitly referenced there.
- Maintain respectful, professional tone. Keep responses concise and actionable.
- Default to ASCII when editing or creating files. Avoid altering user-authored content outside the requested scope.
- Never revert user changes unless explicitly asked. When unexpected edits appear, pause and confirm before proceeding.
- When processing Azure requests, follow repository Azure policies and required tool usage.
- Confirm final outputs in Markdown; reference files with backticks and relative paths.
- **A pull request created during wants processing MUST contain only one change: the addition of a new Markdown file under `wants/`. Modifying any other file — including the original issue body, existing want files, workflows, or any other repository file — is strictly prohibited.**

### Quick Reference Checks
- Required frontmatter fields: `title`, `date`, `submitter`, `number`, `tags`, `discussion` (must end with the original issue number), `status` set to `discussing`.
- Optional `related` entries include `title`, `url`, and `type`.
- Commands: `npm run create-want`, `npm run check-duplicate "<title>"`, `npm run validate-want wants/<ID>.md`.

### Acceptance Criteria
1. Verify submission is not spam, abusive, commercial, or non-English noise.
2. Confirm the request focuses on web platform evolution (HTML, CSS, JS, browser APIs, devtools, accessibility, etc.).
3. Apply up to three precise technology labels; avoid broad over-labeling.
4. Run duplicate check and escalate anything ≥70% similarity for human review.
5. Enhance content for clarity while preserving submitter intent; add authoritative references when useful.

### Processing Workflow
1. **Spam detection:** Delete obvious spam (honeypot triggered, excessive promo links, abusive language, etc.) and close with the canned message.
2. **Relevance check:** Reject off-topic issues with the `off-topic` label and standard response.
3. **Technology classification:** Apply the most relevant labels (`html`, `css`, `javascript`, `accessibility`, `dom`, `api`, `devtools`, `web-apps`, `forms`, `typography`, `ux`, `urls`, `extensions`, `custom-elements`, etc.).
4. **Duplicate detection:** `npm run check-duplicate "Title"`; flag 70–100% similarity with "possible duplicate" label and human follow-up.
5. **Want creation:**
   - Run `npm run create-want` to scaffold `wants/<ID>.md`.
   - Populate fields from the issue, ensuring the `discussion` URL points to `https://github.com/WebWeWant/webwewant.fyi/discussions/<issue-number>`.
   - Polish description, keeping the submitter’s intent intact. Write from the first person perspective of someone wanting the feature.
   - Add `related` links when they improve context.
   - Validate via `npm run validate-want wants/<ID>.md`.
   - Open PR from `submission/<descriptive-name>` with title `Add want: <Title>` and reference the issue number.
   - **The PR must contain only the new `wants/<ID>.md` file. Do not modify any other files.**

### Content Quality Expectations
- Start every want title with "I want" and ensure clarity.
- Improve grammar, provide examples when helpful, and validate terminology.
- Prefer official standards links (W3C, WHATWG, Ecma, IETF) and reputable documentation (MDN, vendor docs).
- Keep markdown clean; the want file is the single source of truth.

### Communication Templates
- **Spam:** `This submission was automatically detected as spam and removed.`
- **Off-topic:** Provide standard scope reminder and close the issue.
- **Missing info:** List missing fields, direct to resubmit form, close issue.
- **Possible duplicate:** List matches, add "possible duplicate" label, note human review required.
- **Approval:** Acknowledge approval and mention PR creation.

### Issue-to-Discussion Conversion (Post-Merge)
- Clean issue content first (remove metadata, automation comments, and YAML blocks).
- Convert issue directly to discussion to preserve the numeric ID.
- Comment in the discussion with implementation details and gratitude.

### Quality Checklist Before PR
- [ ] Spam check complete.
- [ ] Relevance confirmed.
- [ ] Labels applied appropriately.
- [ ] Duplicate script run; escalations tagged.
- [ ] Want markdown polished; related links added as needed.
- [ ] `npm run validate-want` passes.
- [ ] Branch + PR follow naming guidelines and reference the issue.
- [ ] PR contains only the new `wants/<ID>.md` file — no other files modified.

### Efficiency Tips
- Process steps sequentially and document reasoning in issue comments.
- When uncertain, favor escalation over rejection.
- Maintain consistent tone and formatting with existing wants.

### Safety & Compliance
- Sanitize spam issues by stripping unsafe links before closure.
- Respect privacy: use "Anonymous" when submitter requests anonymity.
- Report anomalies or policy concerns to maintainers.

### Collaboration Notes
- Mention maintainers if human judgment is required (duplicates, controversial wants, etc.).
- Provide concise status updates in PR descriptions.
- When workflows fail (e.g., Copilot assignment unavailable), surface the error and suggest manual follow-up.
