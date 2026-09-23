---
title: Module Assessment
description: Test your knowledge of building workflows using Microsoft Foundry.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "Which type of node in a Foundry workflow is used to invoke an AI agent?"
    a: "Logic node"
    b: "Agent node"
    c: "Data transformation node"
    answer: b
    feedback: "Correct. Agent nodes are used to invoke AI agents within a workflow."
- item:
  - question: "Which node type would you use to handle multiple tickets in a workflow without duplicating nodes?"
    a: "If/Else node"
    b: "For-Each node"
    c: "Send message node"
    answer: b
    feedback: "Correct. For-Each nodes loop over collections, allowing workflows to process multiple inputs efficiently."
- item:
  - question: "Which of the following best describes how structured agent outputs are used in workflows?"
    a: "They are ignored once generated, since agents always handle routing automatically"
    b: "They provide predictable data that can be stored in variables, evaluated with conditions, and trigger workflow steps"
    c: "They replace the need for loops and If/Else nodes"
    answer: b
    feedback: "Correct. Structured outputs allow workflows to make decisions programmatically, route requests, and escalate as needed."

::: end-knowledge-check
