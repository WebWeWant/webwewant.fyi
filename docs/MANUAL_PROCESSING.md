# Manual Processing of Existing Want Submissions

This guide explains how to manually trigger the automated want processing workflow for existing GitHub issues that haven't been processed yet.

## When to Use Manual Processing

Use manual processing for:
- Existing issues that were created before the automation was implemented
- Issues that failed during automated processing and need to be retried
- Issues that need re-evaluation due to updated criteria

## How to Trigger Manual Processing

### Method 1: Issue Comment Trigger

1. Navigate to the GitHub issue you want to process
2. Add a comment with one of these trigger commands:
   - `/process` - Simple slash command
   - `/process-want` - Alternative slash command
   - `@github-copilot` - Mention Copilot directly
   - `@github-copilot[bot] please process this want` - Full mention with instruction
3. The workflow will automatically trigger and process the issue

### Method 2: Repository Dispatch (for bulk processing)

For processing multiple issues at once, you can use the GitHub API:

```bash
curl -X POST \
  https://api.github.com/repos/WebWeWant/webwewant.fyi/dispatches \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -d '{
    "event_type": "manual-want-processing",
    "client_payload": {
      "issue_numbers": [123, 124, 125],
      "reason": "Bulk processing of backlog items"
    }
  }'
```

## What Happens During Manual Processing

When you trigger manual processing, the workflow will:

1. **Detect the trigger**: Recognize that this is a manual processing request
2. **Add processing comment**: Post a detailed comment explaining what will happen
3. **Assign to Copilot**: Tag `@github-copilot[bot]` to begin automated processing
4. **Follow standard process**: Execute the same 5-step process as new submissions:
   - Spam detection
   - Relevance checking
   - Technology classification
   - Duplicate detection
   - Want file creation and PR generation

## Monitoring Progress

After triggering manual processing:

1. **Check the issue comments**: The workflow adds status updates as comments
2. **Watch for Copilot assignment**: Look for the automated comment tagging Copilot
3. **Monitor for PRs**: Successful processing will result in a new pull request
4. **Review labels**: Appropriate technology labels will be added to the issue

## Processing Results

The manual processing can result in several outcomes:

### ✅ Successful Processing
- Issue gets appropriate technology labels
- New want file is created in `/wants/` directory
- Pull request is opened for review
- Issue remains open for discussion

### ⚠️ Spam Detection
- Issue is labeled as `spam`
- Issue is closed automatically
- No want file is created

### ⚠️ Off-Topic Detection
- Issue is labeled as `off-topic`
- Issue is closed with explanation
- No want file is created

### ⚠️ Duplicate Detection
- Issue is labeled as `duplicate`
- Issue is closed with reference to existing want
- No new want file is created

## Troubleshooting

### Workflow Doesn't Trigger
- Ensure you have proper repository permissions
- Check that the comment contains a trigger phrase (e.g., `/process`, `@github-copilot`)
- Verify the workflow file is present and valid
- Check the Actions tab to see if the workflow was skipped and review the logs
- Review `.github/workflows/README.md` for trigger requirements

### Processing Fails
- Check the Actions tab for error details
- Ensure Copilot has access to the repository
- Verify the issue format is compatible

### No PR is Created
- Check if the want was marked as spam, off-topic, or duplicate
- Review Copilot's processing comments for details
- Ensure the `/wants/` directory is writable

## Bulk Processing Script

For processing many existing issues at once, you can use the test script with modifications:

```javascript
// scripts/bulkProcessExisting.js
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

async function processExistingIssues(issueNumbers) {
  for (const issueNumber of issueNumbers) {
    try {
      // Add trigger comment to each issue
      await octokit.rest.issues.createComment({
        owner: 'WebWeWant',
        repo: 'webwewant.fyi',
        issue_number: issueNumber,
        body: '/process-want - Manual bulk processing trigger'
      });
      
      console.log(`Triggered processing for issue #${issueNumber}`);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to process issue #${issueNumber}:`, error);
    }
  }
}

// Example usage:
// processExistingIssues([123, 124, 125, 126]);
```

## Best Practices

1. **Process in batches**: Don't trigger too many at once to avoid overwhelming the system
2. **Monitor progress**: Keep an eye on the Actions tab during bulk processing
3. **Review results**: Check each generated want file for quality before merging
4. **Update documentation**: Keep track of which issues have been processed

## Getting Help

If you encounter issues with manual processing:

1. Check the [GitHub Actions logs](https://github.com/WebWeWant/webwewant.fyi/actions)
2. Review the workflow file: `.github/workflows/process-want-submission.yml`
3. Consult the processing instructions: `.github/instructions/wants-processing.instructions.md`
4. Open an issue for technical problems with the automation itself