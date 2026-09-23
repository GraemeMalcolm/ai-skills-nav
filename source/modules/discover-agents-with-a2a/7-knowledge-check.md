---
title: Module assessment
description: Check your learning on discovering Azure AI Agents using the A2A (Agent-to-Agent) protocol.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What is the primary role of an A2A server?"
    a: "It executes business logic for the agent directly."
    b: "It routes requests between clients and connected agents."
    c: "It stores static agent responses for reuse."
    answer: b
    feedback: "Correct. The A2A server acts as a routing layer that delegates requests to the appropriate agent."
- item:
  - question: "What does the Agent Executor do in an A2A agent?"
    a: "Manages network connections between clients and servers."
    b: "Processes incoming requests and generates responses or events."
    c: "Provides a GUI for monitoring agent activity."
    answer: b
    feedback: "Correct. The executor contains the core logic for handling requests and sending responses or event updates."
- item:
  - question: "What is an agent card used for in A2A?"
    a: "It stores the agent's API key for authentication."
    b: "It provides metadata about the agent, such as its capabilities and available functions."
    c: "It visualizes the agent's workflow in a GUI dashboard."
    answer: b
    feedback: "Correct. Agent cards describe what an agent can do and help clients discover and interact with it."

::: end-knowledge-check
