---
title: Knowledge check
description: This unit contains a knowledge check, which can help learners reinforce their understanding of the material.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What are the key steps to create a Microsoft Foundry Agent using the Microsoft Agent Framework?"
    a: "Deploy a custom AI model before creating an agent definition in the Azure portal."
    b: "Initialize the agent by defining a model in the `AgentThread` constructor."
    c: "Create an `AzureAIAgentClient`, define a ChatAgent with instructions and tools, and create an `AgentThread` for conversations."
    answer: c
    feedback: "Correct. These components are needed to create a functional Microsoft Foundry Agent that can handle conversations and use tools."
- item:
  - question: "Which component in the Microsoft Agent Framework manages conversation state and stores messages?"
    a: "AgentThread"
    b: "ChatAgent"
    c: "AzureAIAgentClient"
    answer: a
    feedback: "Correct. `AgentThread` automatically maintains conversation history between agents and users, managing the conversation state across multiple interactions."
- item:
  - question: "How do you add custom functionality to a Microsoft Foundry Agent in the Microsoft Agent Framework?"
    a: "Configure custom functions in the Azure portal and link them to the agent through connection strings."
    b: "Create Python functions with proper type annotations and descriptions, then pass them to the ChatAgent's tools parameter."
    c: "Modify the AI model's architecture to integrate the custom functionality directly."
    answer: b
    feedback: "Correct. Custom tools are created as regular Python functions with type annotations and Field descriptions, then registered with the agent through the tools parameter."

::: end-knowledge-check
