---
title: Knowledge check
description: Test your knowledge of Foundry IQ and knowledge-enhanced AI agents.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What is the primary advantage of Retrieval Augmented Generation (RAG) over simple AI agents?"
    a: "RAG eliminates the need for large language models by relying entirely on document retrieval."
    b: "RAG enables agents to ground responses in current organizational information and provide source transparency."
    c: "RAG automatically retrains the language model whenever organizational documents change."
    answer: b
    feedback: "Correct. RAG delivers three critical advantages: real-time updates that keep agents current, source transparency that shows which documents informed each response, and factual grounding that eliminates fabricated information."
- item:
  - question: "Which data source option provides real-time access to SharePoint content with Microsoft 365 governance?"
    a: "SharePoint Indexed, which pre-processes SharePoint content into Azure AI Search."
    b: "SharePoint Remote, which queries SharePoint sites and libraries in real-time."
    c: "Azure Blob Storage, which connects to SharePoint files stored as blobs."
    answer: b
    feedback: "Correct. SharePoint Remote provides real-time queries to SharePoint without pre-indexing, respects existing SharePoint permissions, and always accesses current content."
- item:
  - question: "What is the purpose of scoring profiles in Foundry IQ knowledge bases?"
    a: "To encrypt sensitive fields and protect confidential information during retrieval."
    b: "To boost specific fields or attributes so more important results surface first."
    c: "To configure how documents are chunked and embedded for semantic search."
    answer: b
    feedback: "Correct. Scoring profiles let you define field weights (like boosting title matches 3x over content matches) and freshness functions (like prioritizing documents modified within the last 90 days) to influence ranking."
- item:
  - question: "Why is it critical to specify retrieval behavior in agent instructions?"
    a: "Without proper instructions, agents might answer from training data instead of the knowledge base, provide unverifiable responses, or fail to cite sources."
    b: "Instructions determine the semantic ranking algorithm that Foundry IQ applies to search results."
    c: "Instructions enable the agent to automatically update knowledge base content when it detects outdated information."
    answer: a
    feedback: "Correct. Effective instructions specify when to retrieve (always use the knowledge base), how to cite (exact format for source attribution), and what to do when unsure (fallback behavior when information isn't found)."

::: end-knowledge-check
