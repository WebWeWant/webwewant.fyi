#!/usr/bin/env node

/**
 * Convert GitHub Issue to Discussion
 *
 * Uses the GitHub GraphQL API to convert an issue to a discussion in the
 * WebWeWant/webwewant.fyi repository.
 *
 * Usage:
 *   node scripts/convert-to-discussion.mjs <issue-number> [category-name]
 *   npm run convert-to-discussion -- <issue-number> [category-name]
 *
 * Arguments:
 *   issue-number   Required. The GitHub issue number to convert.
 *   category-name  Optional. The discussion category name to use (default: "Wants").
 *                  Falls back to "General" if the named category is not found.
 *
 * Environment:
 *   GITHUB_TOKEN   Required. A token with `issues: write` and `discussions: write` scopes.
 *
 * Exit codes:
 *   0 - Conversion succeeded; prints the new discussion URL
 *   1 - Error (missing args, missing token, API error)
 *
 * Examples:
 *   GITHUB_TOKEN=ghp_... node scripts/convert-to-discussion.mjs 850
 *   GITHUB_TOKEN=ghp_... node scripts/convert-to-discussion.mjs 850 "General"
 */

const OWNER = "WebWeWant";
const REPO = "webwewant.fyi";
const GRAPHQL_URL = "https://api.github.com/graphql";

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const [, , issueArg, categoryArg] = process.argv;

if (!issueArg || !/^[1-9]\d*$/.test(issueArg.trim())) {
  console.error("Error: issue number must be a positive integer.");
  console.error("Usage: node scripts/convert-to-discussion.mjs <issue-number> [category-name]");
  console.error("Example: node scripts/convert-to-discussion.mjs 850");
  process.exit(1);
}

const issueNumber = parseInt(issueArg.trim(), 10);
const preferredCategory = categoryArg ? categoryArg.trim() : "Wants";

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error("Error: GITHUB_TOKEN environment variable is not set.");
  console.error("The token needs issues:write and discussions:write scopes.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// GraphQL helper
// ---------------------------------------------------------------------------

async function graphql(query, variables = {}) {
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "webwewant-convert-to-discussion/1.0",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API HTTP error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();

  if (json.errors && json.errors.length > 0) {
    const messages = json.errors.map((e) => e.message).join("; ");
    throw new Error(`GitHub GraphQL error: ${messages}`);
  }

  return json.data;
}

// ---------------------------------------------------------------------------
// Step 1: Resolve the issue node ID
// ---------------------------------------------------------------------------

async function getIssueNodeId(issueNum) {
  const data = await graphql(
    `query GetIssueNodeId($owner: String!, $repo: String!, $number: Int!) {
      repository(owner: $owner, name: $repo) {
        issue(number: $number) {
          id
          title
          state
        }
      }
    }`,
    { owner: OWNER, repo: REPO, number: issueNum }
  );

  const issue = data?.repository?.issue;
  if (!issue) {
    throw new Error(`Issue #${issueNum} not found in ${OWNER}/${REPO}.`);
  }
  if (issue.state === "CLOSED") {
    console.warn(`⚠  Issue #${issueNum} is already closed — proceeding anyway.`);
  }
  return { id: issue.id, title: issue.title };
}

// ---------------------------------------------------------------------------
// Step 2: Resolve the discussion category node ID
// ---------------------------------------------------------------------------

async function getCategoryNodeId(preferred) {
  const data = await graphql(
    `query GetDiscussionCategories($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        discussionCategories(first: 25) {
          nodes {
            id
            name
          }
        }
      }
    }`,
    { owner: OWNER, repo: REPO }
  );

  const categories = data?.repository?.discussionCategories?.nodes ?? [];

  if (categories.length === 0) {
    throw new Error("No discussion categories found in this repository.");
  }

  // Try exact (case-insensitive) match on the preferred name first
  let category = categories.find(
    (c) => c.name.toLowerCase() === preferred.toLowerCase()
  );

  if (!category) {
    console.warn(`⚠  Category "${preferred}" not found. Available categories:`);
    categories.forEach((c) => console.warn(`   • ${c.name}`));

    // Fall back to "General" if that exists
    category = categories.find((c) => c.name.toLowerCase() === "general");
    if (category) {
      console.warn(`   Falling back to "General".`);
    } else {
      // Last resort: use the first category
      category = categories[0];
      console.warn(`   Falling back to first available category: "${category.name}".`);
    }
  }

  return { id: category.id, name: category.name };
}

// ---------------------------------------------------------------------------
// Step 3: Convert the issue to a discussion
// ---------------------------------------------------------------------------

async function convertIssueToDiscussion(issueId, categoryId) {
  const data = await graphql(
    `mutation ConvertIssueToDiscussion($issueId: ID!, $categoryId: ID!) {
      convertIssueToDiscussion(input: { issueId: $issueId, categoryId: $categoryId }) {
        discussion {
          number
          url
          title
        }
      }
    }`,
    { issueId, categoryId }
  );

  const discussion = data?.convertIssueToDiscussion?.discussion;
  if (!discussion) {
    throw new Error("Mutation returned no discussion object. Conversion may have failed.");
  }
  return discussion;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

(async () => {
  try {
    console.log(`\n🔄 Converting issue #${issueNumber} to a discussion in ${OWNER}/${REPO}…`);

    const { id: issueId, title } = await getIssueNodeId(issueNumber);
    console.log(`✓ Found issue: "${title}" (node ID: ${issueId})`);

    const { id: categoryId, name: categoryName } = await getCategoryNodeId(preferredCategory);
    console.log(`✓ Using discussion category: "${categoryName}" (node ID: ${categoryId})`);

    const discussion = await convertIssueToDiscussion(issueId, categoryId);

    console.log(`\n✅ Success! Issue #${issueNumber} converted to discussion #${discussion.number}`);
    console.log(`   Title: ${discussion.title}`);
    console.log(`   URL:   ${discussion.url}`);
    console.log(`\n📝 Next step: update the 'discussion' field in the corresponding`);
    console.log(`   wants/<UUID>.md file to:\n   ${discussion.url}`);
  } catch (err) {
    console.error(`\n❌ ${err.message}`);
    process.exit(1);
  }
})();
