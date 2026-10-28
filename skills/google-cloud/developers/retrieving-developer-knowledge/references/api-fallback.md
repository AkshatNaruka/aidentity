# Developer Knowledge REST API Fallback Guide

When the Developer Knowledge MCP server tools (`search_documents`, `get_documents`, `answer_query`) are not declared or available in your runtime environment, you MUST use the Developer Knowledge REST API to search and retrieve official documentation. Do NOT guess commands or rely on unverified pretraining memory.

## Service Overview

- **Base URL**: `https://developerknowledge.googleapis.com`
- **API Versions**: `v1` (GA) and `v1alpha`
- **Output Format**: JSON (with Markdown content chunks)

## Authentication Protocol

Before issuing REST requests, resolve authentication credentials using one of the following methods in order of precedence:

1. **API Key (Recommended)**:
   Check the environment for `DEVELOPERKNOWLEDGE_API_KEY` or `GOOGLE_API_KEY`.
   - Pass via query parameter: `?key=${DEVELOPERKNOWLEDGE_API_KEY}`
   - Or pass via header: `-H "X-Goog-Api-Key: ${DEVELOPERKNOWLEDGE_API_KEY}"`

2. **OAuth 2.0 Access Token**:
   If an API key is not set but `gcloud` or ambient Google Cloud credentials are present:
   - Obtain access token: `ACCESS_TOKEN=$(gcloud auth print-access-token)`
   - Pass via header: `-H "Authorization: Bearer ${ACCESS_TOKEN}"`

---

## Endpoints & Operations

### 1. `answerQuery` (Broad Conceptual Q&A & Multi-Step Guides)

Use for conceptual guides, architectural comparisons, product overviews, and how-to workflows.

- **Method & Path**: `POST https://developerknowledge.googleapis.com/v1:answerQuery`
- **Headers**:
  - `Content-Type: application/json`
  - `X-Goog-Api-Key: ${DEVELOPERKNOWLEDGE_API_KEY}` (or query param `?key=...`)
- **Request Body**:
  ```json
  {
    "query": "How do I configure public read access on a Cloud Storage bucket?"
  }
  ```
- **Example `curl`**:
  ```bash
  curl -s -X POST "https://developerknowledge.googleapis.com/v1:answerQuery?key=${DEVELOPERKNOWLEDGE_API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"query": "How do I create a custom metric in Cloud Logging?"}'
  ```

---

### 2. `searchDocumentChunks` (Exact Syntax, IAM Permissions & Flags)

Use to find specific CLI flags, IAM permissions (`service.resource.verb`), API parameter names, or code snippets.

- **Method & Path**: `GET https://developerknowledge.googleapis.com/v1/documents:searchDocumentChunks`
- **Query Parameters**:
  - `query`: URL-encoded search term (e.g., `gcloud+logging+metrics+create`).
  - `filter` (optional): Filter by domain (e.g., `data_source = "docs.cloud.google.com"`).
  - `pageSize` (optional): Maximum number of chunks to return (default: 10).
  - `key`: API Key.
- **Example `curl`**:
  ```bash
  curl -s "https://developerknowledge.googleapis.com/v1/documents:searchDocumentChunks?query=gcloud+logging+metrics+create&key=${DEVELOPERKNOWLEDGE_API_KEY}"
  ```

---

### 3. `get` Document (Full Document Retrieval)

Use to retrieve the full Markdown content of a specific documentation page when you have its parent resource name or known URI.

- **Method & Path**: `GET https://developerknowledge.googleapis.com/v1/documents/{URI_WITHOUT_SCHEME}`
- **Resource Name Format**: `documents/docs.cloud.google.com/run/docs/overview/what-is-cloud-run` (stripped of `https://`).
- **Example `curl`**:
  ```bash
  curl -s "https://developerknowledge.googleapis.com/v1/documents/docs.cloud.google.com/run/docs/overview/what-is-cloud-run?key=${DEVELOPERKNOWLEDGE_API_KEY}"
  ```

---

### 4. `batchGet` Documents (Multiple Document Retrieval)

Use to retrieve multiple documentation pages in a single roundtrip.

- **Method & Path**: `POST https://developerknowledge.googleapis.com/v1/documents:batchGet`
- **Request Body**:
  ```json
  {
    "names": [
      "documents/docs.cloud.google.com/run/docs/overview/what-is-cloud-run",
      "documents/docs.cloud.google.com/run/docs/configuring/services/environment-variables"
    ]
  }
  ```
- **Example `curl`**:
  ```bash
  curl -s -X POST "https://developerknowledge.googleapis.com/v1/documents:batchGet?key=${DEVELOPERKNOWLEDGE_API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"names": ["documents/docs.cloud.google.com/run/docs/overview/what-is-cloud-run"]}'
  ```

---

## Response Processing & Synthesis Guidelines

1. **Extract Content**: Parse the returned JSON payload (`answer`, `documentChunks[].content`, or `document.content`).
2. **Authoritative Precedence**: Treat retrieved documentation as 100% authoritative over pretraining knowledge.
3. **Context Defense**: Synthesize only the required technical solution (code snippet, configuration, or CLI command) without dumping raw API response envelopes.
