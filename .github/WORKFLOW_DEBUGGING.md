# Workflow Debugging Guide

## Problem Summary

The automated workflow was not running when users added `/process` to trigger it. The workflow run was being skipped.

## Root Cause

The workflow had overly restrictive trigger conditions that required:
1. The comment body to contain `@github-copilot[bot]` AND
2. The comment body to contain `process-want`

When users naturally typed `/process`, the workflow would not trigger because it didn't match these specific conditions.

## Solution

### 1. More Flexible Trigger Conditions

Changed the `if` condition from:
```yaml
(github.event_name == 'issue_comment' && contains(github.event.comment.body, '@github-copilot[bot]') && contains(github.event.comment.body, 'process-want'))
```

To:
```yaml
(github.event_name == 'issue_comment' && (
  contains(github.event.comment.body, '/process') ||
  contains(github.event.comment.body, '@github-copilot') ||
  (contains(github.event.comment.body, '@github-copilot[bot]') && contains(github.event.comment.body, 'process'))
))
```

This now accepts any of:
- `/process` - Simple slash command
- `@github-copilot` - Any mention of Copilot
- `@github-copilot[bot] process` - Full mention with process keyword

### 2. Enhanced Logging

Added comprehensive logging throughout the workflow:

#### Initial Trigger Logging
```yaml
- name: Log workflow trigger
  run: |
    echo "=== Workflow Trigger Information ==="
    echo "Event name: ${{ github.event_name }}"
    echo "Triggered by: ${{ github.actor }}"
    echo "Repository: ${{ github.repository }}"
    if [ "${{ github.event_name }}" = "issue_comment" ]; then
      echo "Comment author: ${{ github.event.comment.user.login }}"
      echo "Issue number: ${{ github.event.issue.number }}"
      echo "Issue title: ${{ github.event.issue.title }}"
      echo "Comment body (first 200 chars): ${{ github.event.comment.body }}" | head -c 200
    fi
    echo "==================================="
```

#### Process Issue Logging
Added console.log statements throughout the JavaScript steps:
- Event name and issue number
- Issue title and body length
- Submission ID extraction
- Comment creation status

#### Copilot Assignment Logging
Added logging for:
- Event type identification
- Issue number resolution
- Comment creation confirmation

#### Completion Logging
Enhanced final logging to include:
- Event details
- Triggered by information
- Next steps for users

### 3. Documentation

Created `.github/workflows/README.md` with:
- Overview of workflow triggers
- Manual processing instructions
- Debugging guide
- Step-by-step workflow explanation

## Testing the Fix

To test the changes:

1. Create a test issue (or use an existing one)
2. Add a comment with `/process`
3. Check the Actions tab for the workflow run
4. Review the "Log workflow trigger" step to see trigger information
5. Verify the workflow proceeds through all steps

## Expected Behavior

When a user comments `/process` on an issue:

1. **Workflow triggers** due to the flexible condition
2. **Initial log** shows trigger information
3. **Processing trigger comment** is created
4. **Copilot is assigned** via comment
5. **Completion log** shows success and next steps

## Debugging Steps

If the workflow still doesn't run:

1. Check the Actions tab for the run
2. Look for the "Log workflow trigger" step output
3. Verify the `if` condition is being satisfied
4. Check if the workflow file has syntax errors
5. Verify GitHub Actions permissions are correct

## Additional Notes

- The workflow uses `github.event_name` and `context.eventName` interchangeably - both are valid
- The workflow has proper error handling with console.log for debugging
- All trigger patterns are case-sensitive
- Comments from bots may not trigger the workflow depending on GitHub Actions configuration
