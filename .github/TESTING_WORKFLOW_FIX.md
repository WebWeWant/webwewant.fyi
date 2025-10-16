# Testing the Workflow Fix

This document explains how to test the workflow trigger fix that was implemented to resolve the issue where `/process` commands were not triggering the workflow.

## Changes Made

### 1. Expanded Trigger Conditions

The workflow `if` condition was updated from requiring both `@github-copilot[bot]` AND `process-want` to accepting any of:
- `/process`
- `@github-copilot`
- `@github-copilot[bot]` with `process`

### 2. Added Comprehensive Logging

Added logging at multiple points:
- Initial trigger information
- Issue processing details
- Copilot assignment status
- Completion summary

### 3. Updated Documentation

- Created `.github/workflows/README.md` explaining triggers
- Created `.github/WORKFLOW_DEBUGGING.md` explaining the fix
- Updated `docs/MANUAL_PROCESSING.md` with all trigger options

## Manual Testing Steps

### Test 1: Simple `/process` Command

1. Create or find a test issue
2. Add a comment: `/process`
3. Check Actions tab for workflow run
4. Verify "Log workflow trigger" step shows the comment
5. Confirm workflow completes successfully

**Expected Result:** Workflow triggers and processes the issue

### Test 2: Copilot Mention

1. Create or find a test issue
2. Add a comment: `@github-copilot please process this want`
3. Check Actions tab for workflow run
4. Verify workflow detects the mention

**Expected Result:** Workflow triggers due to Copilot mention

### Test 3: Full Bot Mention

1. Create or find a test issue
2. Add a comment: `@github-copilot[bot] process this submission`
3. Check Actions tab for workflow run

**Expected Result:** Workflow triggers due to bot mention with process keyword

### Test 4: Verify Logging Output

For any of the above tests, check the workflow logs:

1. Go to Actions tab
2. Click on the workflow run
3. Expand "Log workflow trigger" step
4. Verify it shows:
   - Event name: `issue_comment`
   - Comment author
   - Issue number
   - Issue title
   - Comment body (first 200 chars)

**Expected Result:** All information is logged clearly

### Test 5: Verify Copilot Assignment

1. After triggering with any command
2. Check the issue comments
3. Verify a "Manual Processing Triggered" comment was added
4. Verify a Copilot assignment comment was added

**Expected Result:** Two automated comments are added to the issue

## Automated Verification

You can verify the YAML syntax using:

```bash
# Install yamllint if not already installed
pip install yamllint

# Validate the workflow file
yamllint .github/workflows/process-want-submission.yml
```

Or use GitHub's workflow validation:

```bash
# Using GitHub CLI
gh workflow view "Process Want Submission"
```

## Checking Workflow Runs

To see if the workflow was triggered:

```bash
# List recent workflow runs
gh run list --workflow="Process Want Submission"

# View details of a specific run
gh run view <run-id>

# View logs for a specific run
gh run view <run-id> --log
```

## Debugging Failed Runs

If a workflow run is skipped or fails:

1. **Check the `if` condition:**
   - Look at the workflow file lines 20-27
   - Verify your trigger matches one of the conditions

2. **Review the trigger log:**
   - Check the "Log workflow trigger" step
   - Verify the event type and comment body

3. **Check console logs:**
   - Look for `console.log()` output in JavaScript steps
   - Verify issue number resolution
   - Check comment creation status

4. **Verify permissions:**
   - Ensure GitHub Actions has write permissions
   - Check repository settings → Actions → General → Workflow permissions

## Known Limitations

1. **Bot Comments:** Comments from bots may not trigger the workflow depending on GitHub Actions settings
2. **Case Sensitivity:** Trigger keywords are case-sensitive (`/process` vs `/Process`)
3. **Partial Matches:** The trigger uses `contains()` so `/processing` would also match

## Success Criteria

The fix is successful if:
- ✅ `/process` command triggers the workflow
- ✅ Workflow logs show trigger information
- ✅ Issue receives processing comments
- ✅ Copilot assignment comment is created
- ✅ Workflow completes without errors

## Rollback Plan

If the changes cause issues:

1. The previous workflow trigger condition was:
   ```yaml
   (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@github-copilot[bot]') && contains(github.event.comment.body, 'process-want'))
   ```

2. Logging can be reduced by removing the console.log statements
3. Documentation changes are safe and can remain

## Related Files

- `.github/workflows/process-want-submission.yml` - Main workflow file
- `.github/workflows/README.md` - Workflow documentation
- `.github/WORKFLOW_DEBUGGING.md` - Debugging guide
- `docs/MANUAL_PROCESSING.md` - Manual processing instructions
- `.github/instructions/wants-processing.instructions.md` - Copilot instructions
