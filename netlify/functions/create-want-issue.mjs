/**
 * Netlify Function to create GitHub issues directly from form submissions
 * Uses modern Netlify Functions V2 API with Request/Response objects
 */

const SPAM_KEYWORDS = [
  'buy now',
  'click here',
  'earn money',
  'free money',
  'get rich',
  'weight loss',
  'casino',
  'poker',
  'viagra',
  'cialis',
  'cryptocurrency',
  'bitcoin investment',
  'trading bot',
  'make money online',
  'work from home',
  'business opportunity'
];

function normalizeText(value, fallback = '') {
  if (value === undefined || value === null) {
    return fallback;
  }

  const text = String(value).trim();
  return text === '' ? fallback : text;
}

function isChecked(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function toJsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function toRedirectResponse(location) {
  return new Response(null, {
    status: 303,
    headers: { Location: location }
  });
}

function extractSubmission(rawPayload) {
  const payload = rawPayload?.data ? rawPayload.data : rawPayload;
  const privacy = isChecked(payload?.privacy);

  return {
    submissionId: normalizeText(rawPayload?.id || payload?.id, `netlify-${Date.now()}`),
    title: normalizeText(payload?.title, 'New Want Submission'),
    detail: normalizeText(payload?.detail),
    name: normalizeText(payload?.name, 'Anonymous'),
    email: normalizeText(payload?.email),
    events: normalizeText(payload?.events, 'Not specified'),
    privacy,
    github: privacy ? '' : normalizeText(payload?.github).replace(/^@+/, ''),
    website: normalizeText(payload?.website),
    botField: normalizeText(payload?.['bot-field']),
    timestamp: normalizeText(rawPayload?.created_at || payload?.created_at, new Date().toISOString()),
    formName: normalizeText(rawPayload?.form_name || payload?.['form-name'], 'problems'),
    siteUrl: normalizeText(rawPayload?.site_url || payload?.site_url),
    referrer: normalizeText(rawPayload?.referrer || payload?.referrer, 'Direct'),
    userAgent: normalizeText(rawPayload?.user_agent || payload?.user_agent, 'Unknown')
  };
}

async function parseSubmission(request) {
  const contentType = request.headers.get('content-type') || '';
  const isBrowserForm = contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data');

  if (isBrowserForm) {
    const formData = await request.formData();
    const payload = Object.fromEntries(formData.entries());
    return {
      isBrowserForm: true,
      rawPayload: payload,
      submission: extractSubmission(payload)
    };
  }

  const rawPayload = await request.json();
  return {
    isBrowserForm: false,
    rawPayload,
    submission: extractSubmission(rawPayload)
  };
}

async function persistNetlifySubmission(request, submission) {
  if (!submission.email) {
    return false;
  }

  try {
    const origin = new URL(request.url).origin;
    const formPayload = new URLSearchParams({
      'form-name': submission.formName,
      name: submission.name,
      email: submission.email,
      github: submission.github,
      events: submission.events,
      privacy: submission.privacy ? 'on' : '',
      title: submission.title,
      detail: submission.detail,
      website: submission.website,
      'bot-field': submission.botField
    });

    const response = await fetch(origin, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formPayload.toString()
    });

    if (!response.ok) {
      console.warn('Unable to persist Netlify form submission:', response.status, response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.warn('Unable to persist Netlify form submission:', error);
    return false;
  }
}

function buildIssueBody(submission, spamFlags, hasPrivateContactRecord) {
  const submitter = submission.privacy ? 'Anonymous' : submission.name;
  const details = [
    '## Want Submission',
    '',
    `**Submission ID:** ${submission.submissionId}`,
    `**Submitted:** ${submission.timestamp}`,
    `**Submitter:** ${submitter}`,
    `**Privacy requested:** ${submission.privacy ? 'Yes' : 'No'}`,
    submission.github ? `**GitHub:** @${submission.github}` : '',
    `**Event Preference:** ${submission.events}`,
    hasPrivateContactRecord
      ? '**Contact:** Maintainers can follow up using the private Netlify form submission.'
      : '**Contact:** An email address was provided privately to the form handler.',
    '',
    '## Want Details',
    '',
    `**Title:** ${submission.title}`,
    '',
    '**Description:**',
    submission.detail || 'Not provided',
    '',
    '---',
    '',
    '## Submission Metadata',
    '',
    `**Form:** ${submission.formName}`,
    `**Referrer:** ${submission.referrer}`,
    `**User Agent:** ${submission.userAgent}`
  ].filter(Boolean);

  if (spamFlags.length > 0) {
    details.push('', '---', '', '## Spam Detection Alerts', '', ...spamFlags);
  }

  details.push(
    '',
    '---',
    '',
    '*This issue was automatically created from a Netlify form submission. GitHub Actions will assign it to Copilot for triage using `.github/instructions/wants-processing.instructions.md`.*'
  );

  return details.join('\n');
}

export default async (request, context) => {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return toJsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const { isBrowserForm, submission } = await parseSubmission(request);
    console.log('Received form submission:', {
      submissionId: submission.submissionId,
      title: submission.title,
      formName: submission.formName,
      isBrowserForm
    });

    // Get GitHub token from environment using process.env
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      console.error('GITHUB_TOKEN environment variable not set');
      return isBrowserForm
        ? toRedirectResponse('/submitted/?status=error')
        : toJsonResponse({ error: 'Server configuration error' }, 500);
    }

    // SPAM DETECTION: Check honeypot field
    if (submission.website || submission.botField) {
      console.log('Honeypot triggered - spam detected:', {
        website: submission.website,
        botField: submission.botField,
        submissionId: submission.submissionId
      });
      // Return success to fool bots, but don't create issue
      const payload = {
        success: true,
        message: 'Submission received',
        submission_id: submission.submissionId,
        issue_number: 0 // Fake issue number
      };

      return isBrowserForm ? toRedirectResponse('/submitted/') : toJsonResponse(payload);
    }

    // SPAM DETECTION: Check for excessive links (likely promotional)
    const textToCheck = `${submission.title} ${submission.detail}`;
    const linkRegex = /https?:\/\/[^\s]+/gi;
    const links = textToCheck.match(linkRegex) || [];
    
    if (links.length > 2) {
      console.log('Potential spam detected - excessive links:', { 
        linkCount: links.length, 
        links: links.slice(0, 5), // Log first 5 links
        submissionId: submission.submissionId 
      });
      // Flag for manual review rather than auto-rejecting
    }

    // SPAM DETECTION: Check for abusive/promotional keywords
    const textLower = textToCheck.toLowerCase();
    const containsSpamKeywords = SPAM_KEYWORDS.some(keyword => textLower.includes(keyword));
    
    if (containsSpamKeywords) {
      console.log('Potential spam detected - suspicious keywords:', {
        submissionId: submission.submissionId
      });
      // Flag for manual review rather than auto-rejecting
    }

    // Prepare spam detection flags
    const spamFlags = [];
    if (links.length > 2) {
      spamFlags.push(`⚠️ **Potential Spam**: Contains ${links.length} external links`);
    }
    if (containsSpamKeywords) {
      spamFlags.push(`⚠️ **Potential Spam**: Contains suspicious keywords`);
    }

    const hasPrivateContactRecord = isBrowserForm
      ? await persistNetlifySubmission(request, submission)
      : false;

    const issueBody = buildIssueBody(submission, spamFlags, hasPrivateContactRecord);

    // Prepare labels
    const labels = ['want'];
    if (spamFlags.length > 0) {
      labels.push('potential-spam');
    }

    // Create GitHub issue using modern fetch API
    const issueResponse = await fetch('https://api.github.com/repos/WebWeWant/webwewant.fyi/issues', {
      method: 'POST',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'WebWeWant-Netlify-Function-V2'
      },
      body: JSON.stringify({
        title: `New Want Submission: ${submission.title}`,
        body: issueBody,
        labels: labels,
        assignees: []  // Note: Cannot directly assign to bots, will be handled by workflow
      })
    });

    if (!issueResponse.ok) {
      const errorText = await issueResponse.text();
      console.error('GitHub API error:', issueResponse.status, errorText);
      if (isBrowserForm) {
        return toRedirectResponse('/submitted/?status=error');
      }

      return toJsonResponse({ 
        error: 'Failed to create GitHub issue',
        status: issueResponse.status,
        details: errorText 
      }, 500);
    }

    const issue = await issueResponse.json();
    console.log('Successfully created GitHub issue:', issue.number);

    if (isBrowserForm) {
      return toRedirectResponse('/submitted/');
    }

    return toJsonResponse({ 
      success: true, 
      message: 'Want submission processed successfully',
      submission_id: submission.submissionId,
      issue_number: issue.number,
      issue_url: issue.html_url
    });

  } catch (error) {
    console.error('Error processing form submission:', error);
    return toJsonResponse({ 
      error: 'Internal server error',
      message: error.message 
    }, 500);
  }
};