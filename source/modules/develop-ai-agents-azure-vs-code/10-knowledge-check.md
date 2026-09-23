---
title: Knowledge check
description: Check your knowledge of AI agent development with Microsoft Foundry.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What is the primary benefit of using Microsoft Foundry Agent Service compared to building agents with standard APIs?"
    a: "It provides access to more powerful AI models"
    b: "It requires no Azure subscription"
    c: "It handles tool calling, state management, and infrastructure automatically"
    d: "It only works with the Azure portal"
    answer: c
    feedback: "Correct. Microsoft Foundry Agent Service manages the complexity of tool calling, conversation state, and infrastructure, reducing development effort."
- item:
  - question: "How does Microsoft Foundry Agent Service handle conversation state?"
    a: "By requiring developers to manually manage conversation history"
    b: "Through external database connections"
    c: "Through the Responses API which automatically manages conversation context"
    d: "Using local file storage on the client device"
    answer: c
    feedback: "Correct. The Responses API handles conversation context automatically, removing the need for manual state management."
- item:
  - question: "Which of the following is NOT a recommended security practice for AI agents?"
    a: "Using role-based access controls"
    b: "Implementing prompt filtering and validation"
    c: "Maintaining comprehensive logging and traceability"
    d: "Allowing agents unrestricted access to all enterprise data"
    answer: d
    feedback: "Correct. This is NOT recommended. Agents should follow least privilege principles with restricted access based on their specific needs."
- item:
  - question: "What happens when an agent determines it needs a tool to respond to a user request?"
    a: "The agent asks the user for permission to use the tool"
    b: "The agent stops processing and waits for developer input"
    c: "The agent automatically invokes the tool, processes results, and incorporates them into its response"
    d: "The agent sends the request to a separate processing queue"
    answer: c
    feedback: "Correct. Microsoft Foundry Agent Service handles the complete tool-calling lifecycle automatically."

::: end-knowledge-check
