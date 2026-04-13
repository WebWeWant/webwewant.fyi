# GitHub Workflows

This directory contains automated workflows for the Web We Want project.

## Want Submission Workflows

The current automation is split across two workflows:

- `triage-submission.yml` handles new want issues created by the Netlify function.
- `process-submission.yml` handles issues that have been approved for want-file creation.

### Triggers

The current flow is triggered by:

1. **Netlify Form Submission**
   - The public form posts directly to `/.netlify/functions/create-want-issue`
   - The function creates a GitHub issue labeled `want`
   - `triage-submission.yml` picks up the newly opened issue automatically

2. **Issue Triage** (`issues.opened` or `/triage` comment)
   - Adds `triage-needed`
   - Adds the canonical processing instructions comment
   - Assigns the issue to GitHub Copilot
3. **Approved Submission Processing** (`issues.labeled` with `approved` or `/process` comment)
   - Adds the processing instructions comment
   - Assigns the issue to GitHub Copilot for want-file creation

### Manual Processing

To manually trigger triage on an existing want issue, add:

```text
/triage
```

To manually trigger approved-processing on an existing want issue, add:

```text
/process
```

The workflows will assign the issue to GitHub Copilot, which follows `.github/instructions/wants-processing.instructions.md`.

### Debugging

If the workflow doesn't run as expected:

1. Check the workflow run logs in the Actions tab
2. Verify the issue was created with the `want` label
3. Confirm the repository secret `COPILOT_PAT` is set
4. Ensure your comment contains `/triage` or `/process` when using the manual path

### Workflow Summary

1. The Netlify function creates the GitHub issue directly.
2. `triage-submission.yml` labels it and assigns it to Copilot.
3. A maintainer approves or rejects the issue.
4. `process-submission.yml` assigns approved issues back to Copilot for want-file creation.

### Processing Instructions

The detailed processing instructions for GitHub Copilot are located in:
`.github/instructions/wants-processing.instructions.md`

This includes:

- Spam detection
- Relevance checking
- Technology classification
- Duplicate detection
- Want file creation
