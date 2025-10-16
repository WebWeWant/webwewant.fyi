# GitHub Workflows

This directory contains automated workflows for the Web We Want project.

## Process Want Submission Workflow

The `process-want-submission.yml` workflow automates the processing of Want submissions.

### Triggers

The workflow is triggered by:

1. **Netlify Form Submission** (`repository_dispatch` event)
   - Automatically creates an issue from form submissions
   - No manual intervention required

2. **New Want Issue Opened** (`issues` event)
   - Automatically processes issues with title starting with `[Auto] New Want:`
   
3. **Manual Processing via Comment** (`issue_comment` event)
   - Any of the following commands in an issue comment will trigger the workflow:
     - `/process` - Simple slash command
     - `@github-copilot` - Mention Copilot
     - `@github-copilot[bot] process` - Full mention with process keyword

4. **PR Merged** (`pull_request` event with `closed` and `merged=true`)
   - Converts the related issue to a discussion after a want PR is merged

### Manual Processing

To manually trigger want processing on an existing issue, add a comment with any of these commands:

```
/process
```

or

```
@github-copilot please process this want
```

The workflow will:
1. Log trigger information for debugging
2. Create a processing trigger comment
3. Assign the issue to GitHub Copilot
4. Copilot will follow the instructions in `.github/instructions/wants-processing.instructions.md`

### Debugging

If the workflow doesn't run as expected:

1. Check the workflow run logs in the Actions tab
2. Look for the "Log workflow trigger" step to see what event triggered the workflow
3. Verify the issue title matches the expected pattern (for auto-generated issues)
4. Ensure your comment contains one of the trigger keywords (for manual processing)

### Workflow Steps

1. **Log workflow trigger** - Logs information about what triggered the workflow
2. **Checkout repository** - Checks out the code
3. **Setup Node.js** - Installs Node.js environment
4. **Install dependencies** - Installs npm packages
5. **Create issue from webhook** - For Netlify form submissions
6. **Process existing issue** - For manual triggers via comments
7. **Assign to Copilot** - Creates a comment to trigger Copilot processing
8. **Log completion** - Logs completion status

### Processing Instructions

The detailed processing instructions for GitHub Copilot are located in:
`.github/instructions/wants-processing.instructions.md`

This includes:
- Spam detection
- Relevance checking
- Technology classification
- Duplicate detection
- Want file creation
