/**
 * Netlify Function to create GitHub issues directly from form submissions
 * Uses modern Netlify Functions V2 API with Request/Response objects
 */

import crypto from 'node:crypto';

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

const MAX_FIELD_LENGTHS = {
  name: 100,
  email: 254,
  github: 39,
  events: 200,
  title: 200,
  detail: 5000
};

class SubmissionValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SubmissionValidationError';
    this.status = 400;
  }
}

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

function createFallbackSubmissionId() {
  return `netlify-${crypto.randomUUID()}`;
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

function toHtmlErrorResponse(title, message, status = 500) {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      <p>${message}</p>
      <p><a href="/">Return to the form</a></p>
    </main>
  </body>
</html>`;

  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

function validateLength(value, fieldName) {
  if (value.length > MAX_FIELD_LENGTHS[fieldName]) {
    throw new SubmissionValidationError(
      `${fieldName} must be ${MAX_FIELD_LENGTHS[fieldName]} characters or less`
    );
  }
}

function validateSubmission(submission) {
  if (!submission.name) {
    throw new SubmissionValidationError('name is required');
  }
  validateLength(submission.name, 'name');

  if (!submission.email) {
    throw new SubmissionValidationError('email is required');
  }
  validateLength(submission.email, 'email');

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(submission.email)) {
    throw new SubmissionValidationError('email must be a valid email address');
  }

  if (!submission.events) {
    throw new SubmissionValidationError('events is required');
  }
  validateLength(submission.events, 'events');

  if (!submission.title) {
    throw new SubmissionValidationError('title is required');
  }
  if (submission.title.length < 5) {
    throw new SubmissionValidationError('title must be at least 5 characters');
  }
  validateLength(submission.title, 'title');

  if (!submission.detail) {
    throw new SubmissionValidationError('detail is required');
  }
  if (submission.detail.length < 20) {
    throw new SubmissionValidationError('detail must be at least 20 characters');
  }
  validateLength(submission.detail, 'detail');

  if (submission.github) {
    validateLength(submission.github, 'github');
    if (!/^[A-Za-z0-9-]+$/.test(submission.github)) {
      throw new SubmissionValidationError('github must contain only letters, numbers, and hyphens');
    }
  }
}

function extractSubmission(rawPayload, requestMetadata = {}) {
  const payload = rawPayload?.data ? rawPayload.data : rawPayload;
  const privacy = isChecked(payload?.privacy);

  return {
    submissionId: normalizeText(rawPayload?.id || payload?.id, createFallbackSubmissionId()),
    title: normalizeText(payload?.title),
    detail: normalizeText(payload?.detail),
    name: normalizeText(payload?.name),
    email: normalizeText(payload?.email),
    events: normalizeText(payload?.events),
    privacy,
    github: privacy ? '' : normalizeText(payload?.github).replace(/^@+/, ''),
    website: normalizeText(payload?.website),
    botField: normalizeText(payload?.['bot-field']),
    timestamp: normalizeText(rawPayload?.created_at || payload?.created_at, new Date().toISOString()),
    formName: normalizeText(rawPayload?.form_name || payload?.['form-name'], 'problems'),
    siteUrl: normalizeText(rawPayload?.site_url || payload?.site_url),
    referrer: normalizeText(
      rawPayload?.referrer || rawPayload?.referer || payload?.referrer || payload?.referer || requestMetadata.referrer,
      'Direct'
    ),
    userAgent: normalizeText(rawPayload?.user_agent || payload?.user_agent || requestMetadata.userAgent, 'Unknown')
  };
}

async function parseSubmission(request) {
  const contentType = request.headers.get('content-type') || '';
  const isBrowserForm = contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data');

  if (!isBrowserForm) {
    throw new SubmissionValidationError(
      'Only form-encoded submissions are supported. Submit the request as application/x-www-form-urlencoded or multipart/form-data so the private contact record can be stored before creating a GitHub issue.'
    );
  }

  const formData = await request.formData();
  const rawPayload = Object.fromEntries(formData.entries());
  const requestMetadata = {
    referrer: request.headers.get('referer') || request.headers.get('referrer') || '',
    userAgent: request.headers.get('user-agent') || ''
  };

  return {
    isBrowserForm: true,
    rawPayload,
    submission: extractSubmission(rawPayload, requestMetadata)
  };
}

async function persistNetlifySubmission(request, submission) {
  if (!submission.email) {
    return {
      attempted: false,
      persisted: false,
      reason: 'No email address was provided.'
    };
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
      return {
        attempted: true,
        persisted: false,
        reason: `Netlify returned ${response.status} ${response.statusText}`
      };
    }

    return {
      attempted: true,
      persisted: true,
      reason: ''
    };
  } catch (error) {
    console.warn('Unable to persist Netlify form submission:', error);
    return {
      attempted: true,
      persisted: false,
      reason: error.message
    };
  }
}

function getContactStatusMessage(contactRecord) {
  if (contactRecord.persisted) {
    return '**Contact:** Maintainers can follow up using the private Netlify form submission.';
  }

  if (contactRecord.attempted) {
    return `**Contact:** Warning: private contact persistence failed, so no private follow-up record is available in Netlify. Reason: ${contactRecord.reason}`;
  }

  return `**Contact:** Warning: no private Netlify contact record was created for this submission. Reason: ${contactRecord.reason}`;
}

function buildIssueBody(submission, spamFlags, contactRecord) {
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
    getContactStatusMessage(contactRecord),
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

  let isBrowserForm = false;

  try {
    const parsedRequest = await parseSubmission(request);
    isBrowserForm = parsedRequest.isBrowserForm;
    const { submission } = parsedRequest;
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
        ? toHtmlErrorResponse(
            'Submission Error',
            'The submission service is not configured correctly right now. Please try again later or contact the maintainers.',
            500
          )
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
      return toRedirectResponse('/submitted/');
    }

    validateSubmission(submission);

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

    const contactRecord = await persistNetlifySubmission(request, submission);

    const issueBody = buildIssueBody(submission, spamFlags, contactRecord);

    // Prepare labels
    const labels = ['want'];

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
        return toHtmlErrorResponse(
          'Submission Error',
          'Your submission could not be saved to GitHub. Please try again later or contact the maintainers if the problem continues.',
          502
        );
      }

      return toJsonResponse({ 
        error: 'Failed to create GitHub issue',
        status: issueResponse.status,
        details: errorText 
      }, 500);
    }

    const issue = await issueResponse.json();
    console.log('Successfully created GitHub issue:', issue.number);

    return toRedirectResponse('/submitted/');

  } catch (error) {
    console.error('Error processing form submission:', error);
    if (error instanceof SubmissionValidationError) {
      return isBrowserForm
        ? toHtmlErrorResponse('Invalid Submission', error.message, error.status)
        : toJsonResponse({ error: error.message }, error.status);
    }

    if (isBrowserForm) {
      return toHtmlErrorResponse(
        'Submission Error',
        'Your submission could not be processed. Please try again later or contact the maintainers if the problem continues.',
        500
      );
    }

    return toJsonResponse({ 
      error: 'Internal server error',
      message: error.message 
    }, 500);
  }
};