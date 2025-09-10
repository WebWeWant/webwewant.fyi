# Netlify Forms Webhook Configuration

This document provides step-by-step instructions for configuring your Netlify form to trigger the GitHub workflow for automatic want processing.

## Prerequisites

1. **GitHub Repository Setup**
   - The workflow files are already in place in `.github/workflows/`
   - Repository has necessary permissions for GitHub Actions
   - GitHub Copilot is enabled for the repository

2. **GitHub Token** (if using custom authentication)
   - The workflow uses `GITHUB_TOKEN` by default
   - For enhanced permissions, create a Personal Access Token with `repo` scope

## Netlify Configuration Steps

### Step 1: Create or Update Your Netlify Form

Ensure your Netlify form includes the necessary fields for want processing:

```html
<form name="problems" method="POST" data-netlify="true" action="/thanks">
  <input type="hidden" name="form-name" value="problems" />
  
  <div>
    <label for="name">Your Name (optional):</label>
    <input type="text" id="name" name="name" />
  </div>
  
  <div>
    <label for="email">Email (optional, for follow-up):</label>
    <input type="email" id="email" name="email" />
  </div>
  
  <div>
    <label for="events">Event attendance:</label>
    <select id="events" name="events">
      <option value="I'm not attending an event, but am open to my submission being shared at one">Not attending, but open to sharing</option>
      <option value="I'm attending an event and would like this shared">Attending and want this shared</option>
      <option value="I'm not attending and don't want this shared">Not attending, don't share</option>
    </select>
  </div>
  
  <div>
    <label for="privacy">Privacy:</label>
    <input type="checkbox" id="privacy" name="privacy" value="I agree to the privacy policy" required />
    <label for="privacy">I agree to the privacy policy</label>
  </div>
  
  <div>
    <label for="title">Want Title:</label>
    <input type="text" id="title" name="title" required 
           placeholder="e.g., Flexbox sizing should factor in the width of wrapped text" />
  </div>
  
  <div>
    <label for="detail">Describe your want in detail:</label>
    <textarea id="detail" name="detail" required rows="8"
              placeholder="Explain what you want added to the web platform, why it would be useful, and provide examples or links to demonstrations..."></textarea>
  </div>
  
  <button type="submit">Submit Want</button>
</form>
```

**Important Field Names:**
- `name` - Submitter's name
- `email` - Contact email (optional)
- `events` - Event attendance preference
- `privacy` - Privacy policy agreement
- `title` - Want title/summary
- `detail` - Detailed want description (main content)

### Step 2: Set Up Netlify Function (Required)

Since Netlify webhooks cannot set custom headers like `Authorization`, we use a Netlify function as a bridge to GitHub.

1. **Function Files Already Created**
   - Modern ES module function: `netlify/functions/create-want-issue.mjs`
   - Dependencies: `netlify/functions/package.json` (includes `@netlify/functions`)
   - These will be automatically deployed when you push to your Netlify-connected branch

2. **Configure Environment Variable**
   - In your Netlify dashboard, go to **Site settings** → **Environment variables**
   - Add a new variable:
     ```
     Key: GITHUB_TOKEN
     Value: [PROTECTED]
     Scope: All scopes (or at minimum: Functions)
     ```

### Step 3: Configure Netlify Webhook

1. **Access Netlify Admin Panel**
   - Go to your site dashboard on Netlify
   - Navigate to **Settings** → **Forms**

2. **Set Up Form Notifications**
   - Click **Add notification**
   - Select **Webhook** as the notification type

3. **Configure Webhook Settings**
   ```
   Event to listen for: New form submission
   URL to notify: https://YOUR_NETLIFY_SITE.netlify.app/.netlify/functions/create-want-issue
   JWS secret token: (leave empty or use a random string for security)
   Form: problems
   ```

   **Replace `YOUR_NETLIFY_SITE` with your actual Netlify site name**

   For example: `https://webwewant.netlify.app/.netlify/functions/create-want-issue`

### Step 3: GitHub Token Setup

The GitHub token needs to be configured as an environment variable in Netlify, not as a JWS token.

#### Configure in Netlify Dashboard

1. **Add Environment Variable**
   - Go to your Netlify site dashboard
   - Navigate to **Site settings** → **Environment variables**
   - Click **Add a variable**
   - Set:
     ```
     Key: GITHUB_TOKEN
     Value: [YOUR_GITHUB_TOKEN]
     ```

2. **Verify Token Permissions**
   Your token should have these scopes:
   - `repo` (to create issues)
   - `write:discussion` (optional, for enhanced features)

**Important**: The JWS secret token field in the Netlify webhook configuration is for webhook security validation, not for GitHub authentication. You can leave it empty or set any random string.

### Step 4: Test the Integration

#### Test the Netlify Function

You can test the function directly using curl:

```bash
curl -X POST https://YOUR_NETLIFY_SITE.netlify.app/.netlify/functions/create-want-issue \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-submission-001",
    "created_at": "2024-01-15T10:30:00Z",
    "form_name": "problems",
    "site_url": "https://webwewant.fyi",
    "data": {
      "name": "Test User",
      "email": "test@example.com",
      "events": "I'\''m not attending an event, but am open to my submission being shared at one",
      "privacy": "I agree to the privacy policy",
      "title": "Better CSS debugging tools",
      "detail": "I want browser DevTools to provide better visual debugging for CSS Grid and Flexbox layouts, similar to Firefox but with more detailed information about spacing and alignment."
    },
    "ip": "127.0.0.1",
    "user_agent": "Mozilla/5.0 (Test Browser)",
    "referrer": "https://webwewant.fyi/"
  }'
```

#### Form Submission Test

1. Submit a test want through your Netlify form
2. Check that the webhook fires in Netlify's form dashboard
3. Verify that a new issue is created in your GitHub repository
4. Confirm that GitHub Copilot is assigned and begins processing

## Webhook Payload Structure

The webhook will send data in this format to GitHub (matching actual Netlify structure):

```json
{
  "event_type": "netlify-form-submission",
  "client_payload": {
    "submission_id": "5e52722b13def22bf8bfd348",
    "timestamp": "2020-02-23T12:38:03.929Z",
    "form_name": "problems",
    "origin_site_url": "https://webwewant.fyi",
    "data_name": "Daniel Tonon",
    "data_email": "daniel.tonon.503@gmail.com",
    "data_events": "I'm not attending an event, but am open to my submission being shared at one",
    "data_privacy": "I agree to the privacy policy",
    "data_title": "Flexbox sizing should factor in the width of wrapped text",
    "data_detail": "I've made this code pen to demonstrate and explain the issue more deeply:\n\nhttps://codepen.io/daniel-tonon/pen/VwLmqvb\n\nThe best work around that I can think of for this is to apply a fixed width container...",
    "data_ip": "203.217.49.116",
    "data_user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:73.0) Gecko/20100101 Firefox/73.0",
    "data_referrer": "https://webwewant.fyi/"
  }
}
```

## Troubleshooting

### Common Issues

1. **Netlify Function not found (404)**
   - Ensure the function is deployed: check your Netlify deployment logs
   - Verify the URL format: `https://webwewant.fyi/.netlify/functions/create-want-issue`
   - Make sure the function file is in `netlify/functions/` directory

2. **GitHub authentication error**
   - Verify `GITHUB_TOKEN` environment variable is set in Netlify
   - Check that your GitHub token has `repo` permissions
   - Ensure the token is not expired

3. **Issue not created**
   - Check Netlify function logs for errors
   - Verify the webhook is firing in Netlify's form dashboard
   - Test the function directly using the curl command above

4. **Copilot not responding**
   - Verify GitHub Copilot is enabled for the repository
   - Check that the bot is mentioned correctly in the issue
   - Review processing guide format in `.github/instructions/wants-processing.instructions.md`

### Netlify Function Logs

To debug function issues:
1. Go to your Netlify dashboard
2. Click **Functions** tab
3. Click on `create-want-issue` function
4. View the **Function log** for error details

### Function Architecture

The function uses:
- **Modern Netlify Functions V2 API**: Request/Response objects instead of legacy event/context
- **ES Modules**: `.mjs` extension with modern `import`/`export` syntax
- **Native Fetch API**: No additional dependencies for HTTP requests
- **Netlify.env API**: Modern environment variable access

### Webhook Validation

Check webhook execution:
1. Go to **Netlify Dashboard** → **Settings** → **Forms**
2. Click on your form name
3. Check **Submissions** and **Notifications** tabs for errors

### GitHub Actions Logs

Monitor workflow execution:
1. Go to your repository
2. Click **Actions** tab
3. Look for "Process Want Submission" workflows
4. Click on individual runs to see detailed logs

## Security Considerations

1. **Token Security**
   - Use repository secrets for sensitive tokens
   - Regularly rotate access tokens
   - Use minimal required permissions

2. **Spam Protection**
   - The workflow includes automated spam detection
   - Consider adding CAPTCHA to your form
   - Monitor for unusual submission patterns

3. **Rate Limiting**
   - GitHub API has rate limits
   - Netlify forms have submission limits
   - Monitor usage to avoid hitting limits

## Maintenance

### Regular Tasks

1. **Monitor Processing**
   - Review auto-generated issues weekly
   - Check for false positives in spam detection
   - Verify tag classification accuracy

2. **Update Processing Guidelines**
   - Update `.github/COPILOT_PROCESSING_GUIDE.md` as needed
   - Add new technology labels when appropriate
   - Refine duplicate detection criteria

3. **Review Automation Quality**
   - Assess want file quality
   - Check for consistent formatting
   - Validate related links are appropriate

## Support

If you encounter issues with the webhook setup:

1. Check the troubleshooting section above
2. Review GitHub Actions logs for specific errors
3. Test with the manual API call to isolate issues
4. Verify all configuration steps were completed correctly

The automation should significantly reduce manual processing while maintaining quality standards for want submissions.