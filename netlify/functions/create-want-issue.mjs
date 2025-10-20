/**
 * Netlify Function to create GitHub issues directly from form submissions
 * Uses modern Netlify Functions V2 API with Request/Response objects
 */

export default async (request, context) => {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Parse the form submission data from Netlify
    const formData = await request.json();
    console.log('Received form submission:', formData);

    // Get GitHub token from environment using process.env
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      console.error('GITHUB_TOKEN environment variable not set');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extract submission data
    const submissionId = formData.id || `netlify-${Date.now()}`;
    const title = formData.data?.title || 'New Want Submission';
    const detail = formData.data?.detail || '';
    const name = formData.data?.name || 'Anonymous';
    const email = formData.data?.email || '';
    const events = formData.data?.events || '';
    const privacy = formData.data?.privacy || '';
    const github = formData.data?.github || '';
    const website = formData.data?.website || ''; // Honeypot field
    const timestamp = formData.created_at || new Date().toISOString();

    // SPAM DETECTION: Check honeypot field
    if (website && website.trim() !== '') {
      console.log('Honeypot triggered - spam detected:', { website, submissionId });
      // Return success to fool bots, but don't create issue
      return new Response(JSON.stringify({
        success: true,
        message: 'Submission received',
        submission_id: submissionId,
        issue_number: 0 // Fake issue number
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // SPAM DETECTION: Check for excessive links (likely promotional)
    const textToCheck = `${title} ${detail}`;
    const linkRegex = /https?:\/\/[^\s]+/gi;
    const links = textToCheck.match(linkRegex) || [];
    
    if (links.length > 2) {
      console.log('Potential spam detected - excessive links:', { 
        linkCount: links.length, 
        links: links.slice(0, 5), // Log first 5 links
        submissionId 
      });
      // Flag for manual review rather than auto-rejecting
    }

    // SPAM DETECTION: Check for abusive/promotional keywords
    const spamKeywords = [
      'buy now', 'click here', 'earn money', 'free money', 'get rich',
      'weight loss', 'casino', 'poker', 'viagra', 'cialis',
      'cryptocurrency', 'bitcoin investment', 'trading bot',
      'make money online', 'work from home', 'business opportunity'
    ];
    
    const textLower = textToCheck.toLowerCase();
    const containsSpamKeywords = spamKeywords.some(keyword => textLower.includes(keyword));
    
    if (containsSpamKeywords) {
      console.log('Potential spam detected - suspicious keywords:', { submissionId });
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

    // Create issue body with structured data
    let issueBody = `## Want Submission

**Submission ID:** ${submissionId}
**Submitted:** ${timestamp}
**Submitter:** ${name}
${email ? `**Email:** ${email}` : ''}
${github ? `**GitHub:** ${github}` : ''}

## Want Details

**Title:** ${title}

**Description:**
${detail}

---

## Submission Metadata

**Event Preference:** ${events}
**Privacy Agreement:** ${privacy ? 'Yes' : 'No'}
**Form:** ${formData.form_name || 'problems'}
**Site:** ${formData.site_url || 'https://webwewant.fyi'}
**User Agent:** ${formData.user_agent || 'Unknown'}
**IP:** ${formData.ip || 'Unknown'}
**Referrer:** ${formData.referrer || 'Direct'}`;

    // Add spam detection warnings if any
    if (spamFlags.length > 0) {
      issueBody += `\n\n---\n\n## Spam Detection Alerts\n\n${spamFlags.join('\n')}`;
    }

    issueBody += `\n\n---\n\n*This issue was automatically created from a Netlify form submission. @github-copilot[bot] please process this want submission following the instructions in \`.github/want-submission-triage.md\`.*`;

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
        title: `New Want Submission: ${title}`,
        body: issueBody,
        labels: labels,
        assignees: []  // Note: Cannot directly assign to bots, will be handled by workflow
      })
    });

    if (!issueResponse.ok) {
      const errorText = await issueResponse.text();
      console.error('GitHub API error:', issueResponse.status, errorText);
      return new Response(JSON.stringify({ 
        error: 'Failed to create GitHub issue',
        status: issueResponse.status,
        details: errorText 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const issue = await issueResponse.json();
    console.log('Successfully created GitHub issue:', issue.number);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Want submission processed successfully',
      submission_id: submissionId,
      issue_number: issue.number,
      issue_url: issue.html_url
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error processing form submission:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};