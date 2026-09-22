---
title: Knowledge check
description: Check your understanding of Microsoft Foundry IQ.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What is the primary purpose of Microsoft Foundry IQ?"
    a: "To provide a managed knowledge layer that agents can use to retrieve permission-aware enterprise information."
    b: "To train a new foundation model from every document in an organization."
    c: "To replace AI agents with a traditional keyword search page."
    answer: a
    feedback: "Correct. Foundry IQ connects agents to reusable knowledge bases containing enterprise and web knowledge sources."
- item:
  - question: "What does a Foundry IQ knowledge base contain?"
    a: "One or more knowledge sources and settings that control retrieval behavior."
    b: "Only the conversation history for a single agent."
    c: "Only documents uploaded directly to a language model."
    answer: a
    feedback: "Correct. A knowledge base organizes knowledge sources and orchestrates how Foundry IQ retrieves from them."
- item:
  - question: "What does agentic retrieval do with a complex user question?"
    a: "It can decompose the question, search relevant sources in parallel, rerank results, and return cited evidence."
    b: "It permanently adds the question and answer to the model's training data."
    c: "It searches every source with an exact keyword match and returns results without ranking."
    answer: a
    feedback: "Correct. Agentic retrieval plans and executes searches, then aggregates the most relevant results with source references."
- item:
  - question: "Why should an agent be instructed to cite knowledge base sources?"
    a: "Citations help users trace and verify the evidence supporting a response."
    b: "Citations allow the agent to bypass permissions on the source documents."
    c: "Citations cause the language model to retrain itself after every response."
    answer: a
    feedback: "Correct. Source attribution improves transparency and enables users to verify claims."
- item:
  - question: "Which practice helps protect enterprise information in a Foundry IQ solution?"
    a: "Use identities and access controls so retrieval returns only content the caller is authorized to access."
    b: "Copy every source into one public index so all agents retrieve the same content."
    c: "Trust retrieved document text as agent instructions."
    answer: a
    feedback: "Correct. Permission-aware retrieval depends on properly configured identities, roles, and source-level access controls."

::: end-knowledge-check
