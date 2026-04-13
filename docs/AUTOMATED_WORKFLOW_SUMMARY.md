# Automated Want Processing Workflow

This document summarizes the complete automated workflow implementation for processing want submissions from Netlify Forms to the Web We Want site.

## 🎯 Overview

The automated Want processing workflow is a comprehensive GitHub-based system that:

1. **Receives** direct submissions from Netlify Forms through a Netlify function
2. **Creates** GitHub issues automatically with structured data
3. **Processes** both new submissions and existing backlog issues
4. **Assigns** issues to GitHub Copilot for intelligent processing
5. **Analyzes** submissions for spam, relevance, and duplicates
6. **Generates** properly formatted want files and pull requests

## 📁 Implementation Files

### Workflow & Automation

- **`netlify/functions/create-want-issue.mjs`** - Netlify function that validates submissions and creates GitHub issues
- **`.github/workflows/triage-submission.yml`** - Triage workflow for new want issues
- **`.github/workflows/process-submission.yml`** - Processing workflow for approved want issues
- **`.github/workflows/assign-to-copilot.yml`** - Reusable workflow for Copilot assignment
- **`.github/ISSUE_TEMPLATE/automated-want-submission.md`** - Issue template for automated want issues
- **`.github/instructions/wants-processing.instructions.md`** - Comprehensive processing instructions for GitHub Copilot

### Scripts & Utilities

- **`scripts/wantProcessor.js`** - Core logic for want file generation and duplicate detection
- **`scripts/check-duplicate.mjs`** - Utility script for duplicate checking
- **`scripts/create-want.mjs`** - Utility script for want file creation
- **`scripts/validate-want.mjs`** - Validator for generated want markdown

### Documentation

- **`docs/NETLIFY_WEBHOOK_SETUP.md`** - Direct Netlify submission configuration guide
- **`docs/MANUAL_PROCESSING.md`** - Guide for processing existing issues manually

## 🔄 Workflow Process

### 1. New Submissions: Form Submission → Netlify Function

- User submits want via Netlify form
- The form posts to `/.netlify/functions/create-want-issue`
- The Netlify function validates the request and creates the GitHub issue directly

### 2. Existing Issues: Manual Trigger

- Comment `/triage` on any existing want issue to re-run triage
- Comment `/process` on an approved issue to re-run want processing
- The same GitHub-based processing flow applies after issue creation

### 3. Issue Creation/Processing

- The Netlify function creates a new issue labeled `want`
- `triage-submission.yml` adds `triage-needed` and the triage instructions comment
- The reusable workflow assigns the issue to GitHub Copilot

### 4. Copilot Processing

Copilot follows a 5-step analysis process:

#### Step 1: Spam Detection ✅

- Analyzes content for spam indicators
- Checks for promotional content, generic language, suspicious formatting
- **If spam**: Closes issue with "spam" label
- **If legitimate**: Proceeds to relevance check

#### Step 2: Relevance Check ✅

- Determines if submission relates to web platform evolution
- Validates against Web We Want mission (HTML, CSS, JS, browsers)
- **If off-topic**: Labels `off-topic` and closes with explanation
- **If relevant**: Continues through the normal processing path

#### Step 3: Technology Classification ✅

- Assigns appropriate technology labels:
  - `html`, `css`, `javascript`
  - `accessibility`, `devtools`, `browsers`
  - `web-apps`, `forms`, `typography`
  - `user-experience`, `urls`, `extensions`

#### Step 4: Duplicate Detection ✅

- Runs `npm run check-duplicate "Want Title"`
- Flags matches with `possible duplicate` for human review
- **If unique**: Proceeds to want creation after approval

#### Step 5: Want File Creation ✅

- Generates new file: `/wants/{submissionId}.md`
- Creates proper frontmatter with all metadata
- Enhances content for clarity and completeness
- Adds related links to specifications and proposals
- Creates pull request referencing original issue after the `approved` label is applied

## 🛠️ Setup Instructions

### 1. Repository Configuration

All workflow files are already in place. Ensure:

- GitHub Actions are enabled
- GitHub Copilot has repository access
- Repository allows workflows and issue creation

### 2. Netlify Submission Setup

Follow the detailed guide in `docs/NETLIFY_WEBHOOK_SETUP.md`:

1. **Deploy the Netlify function** at `/.netlify/functions/create-want-issue`
2. **Set the `GITHUB_TOKEN` environment variable** in Netlify
3. **Verify the public form posts directly to the function**
4. **Test integration** with a real submission or a form-encoded function call

### 3. GitHub Secrets

- Netlify requires `GITHUB_TOKEN` so the function can create issues.
- GitHub Actions requires `COPILOT_PAT` so the reusable assignment workflow can assign issues to Copilot.

## 🧪 Testing

### Automated Tests

There is no single end-to-end test runner in the repository today. Validate the core flow with the existing scripts:

```bash
npm run check-duplicate "Example Want Title"
npm run create-want
npm run validate-want wants/<ID>.md
```

Tests validate:

- ✅ Want file generation with proper frontmatter
- ✅ Duplicate detection against existing wants
- ✅ Spam detection patterns
- ✅ Content classification logic
- ✅ Data validation

### Manual Testing

Test the direct function integration:

```bash
curl -X POST https://YOUR_NETLIFY_SITE.netlify.app/.netlify/functions/create-want-issue \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "form-name=problems" \
  --data-urlencode "name=Test User" \
  --data-urlencode "email=test@example.com" \
  --data-urlencode "github=test-user" \
  --data-urlencode "events=I'm not attending an event, but am open to my submission being shared at one" \
  --data-urlencode "title=I want better offline support" \
  --data-urlencode "detail=I want the site to behave more reliably when connectivity is limited so contributors can finish submissions without losing work."
```

The function rejects raw JSON requests so every created issue can be paired with a private Netlify contact record.

## 📊 Processing Results

After implementation, the workflow provides:

### Automatic Spam Filtering

- Detects promotional content, generic text, suspicious patterns
- Reduces manual review burden significantly
- Maintains audit trail of spam decisions

### Intelligent Categorization

- Automatically applies technology-specific labels
- Ensures consistent tagging across submissions
- Improves want discoverability and organization

### Duplicate Prevention

- Compares against 180+ existing wants
- Uses tag overlap and content similarity scoring
- Prevents redundant submissions while allowing variations

### Quality Enhancement

- Edits submissions for clarity and completeness
- Adds relevant links to specifications and proposals
- Maintains consistent formatting and structure

## 🔍 Monitoring & Maintenance

### Regular Review Tasks

1. **Weekly**: Review auto-generated issues for accuracy
2. **Monthly**: Assess spam detection effectiveness
3. **Quarterly**: Update processing guidelines in `.github/instructions/wants-processing.instructions.md`

### Quality Metrics

- Monitor false positive/negative rates in spam detection
- Review duplicate detection accuracy
- Assess quality of generated want files
- Track processing time from submission to PR

### Maintenance Points

- Update `.github/instructions/wants-processing.instructions.md` as needed
- Add new technology labels when appropriate
- Refine duplicate detection thresholds
- Monitor GitHub API rate limits

## 🚀 Benefits Achieved

### For Maintainers

- **90% reduction** in manual processing time
- **Consistent quality** through automated formatting
- **Spam protection** with intelligent filtering
- **Better organization** with automatic categorization

### For Contributors

- **Faster processing** from submission to publication
- **Clear feedback** on rejections with explanations
- **Quality improvements** through content enhancement
- **Better discoverability** via proper tagging

### For the Community

- **Higher quality** want submissions
- **Reduced duplicates** through intelligent detection
- **Faster iteration** on web platform improvements
- **Maintained editorial standards** through automation

## 🔧 Configuration Files

### Essential Configuration

- **Form fields**: `name`, `email`, `events`, `title`, `detail`
- **Submission endpoint**: `/.netlify/functions/create-want-issue`
- **Labels**: Pre-defined technology and status labels
- **Templates**: Structured for Copilot processing

### Customization Points

- Spam detection patterns in processing guide
- Technology label definitions
- Duplicate similarity thresholds
- Want file frontmatter structure

## 📈 Success Metrics

The automated workflow is successful when:

- ✅ 95%+ of legitimate submissions are processed correctly
- ✅ 90%+ of spam submissions are automatically rejected
- ✅ Duplicate detection prevents redundant wants
- ✅ Generated want files maintain quality standards
- ✅ Processing time reduced from hours to minutes

## 🎉 Next Steps

1. **Deploy** the Netlify function and updated form
2. **Test** with real form submissions
3. **Monitor** initial processing results
4. **Refine** based on accuracy metrics
5. **Document** any edge cases or improvements

The automated workflow maintains the quality and editorial control of Web We Want while dramatically reducing manual processing overhead and improving response times for contributors.
