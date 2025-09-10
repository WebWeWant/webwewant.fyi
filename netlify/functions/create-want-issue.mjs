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

    // Get GitHub token from environment using new Netlify.env API
    const githubToken = Netlify.env.get('GITHUB_TOKEN');
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
    const timestamp = formData.created_at || new Date().toISOString();

    // Create issue body with structured data
    const issueBody = `## Want Submission

**Submission ID:** ${submissionId}
**Submitted:** ${timestamp}
**Submitter:** ${name}
${email ? `**Email:** ${email}` : ''}

## Want Details

${detail}

---

## Submission Metadata

**Event Preference:** ${events}
**Privacy Agreement:** ${privacy}
**Form:** ${formData.form_name || 'problems'}
**Site:** ${formData.site_url || 'https://webwewant.fyi'}
**User Agent:** ${formData.user_agent || 'Unknown'}
**IP:** ${formData.ip || 'Unknown'}
**Referrer:** ${formData.referrer || 'Direct'}

---

*This issue was automatically created from a Netlify form submission. @github-copilot[bot] please process this want submission following the instructions in \`.github/instructions/wants-processing.instructions.md\`.*`;

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
        title: `[Auto] New Want: ${title}`,
        body: issueBody,
        labels: ['needs-review', 'auto-generated'],
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