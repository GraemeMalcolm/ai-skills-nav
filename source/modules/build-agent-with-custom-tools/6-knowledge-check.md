---
title: Module assessment
description: Check your knowledge of building an agent with custom tools.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What are custom tools, and how can they help you develop effective agents with Microsoft Foundry Agent Service?"
    a: "Callable functions that an agent can use to extend its capabilities."
    b: "Extensions for Visual Studio Code that make it easier to create and deploy agents."
    c: "Fine-tuned models that the agent can use to generate custom output."
    answer: a
    feedback: "Correct. Custom tools extend the capabilities of your agents by enabling them to call external functions."
- item:
  - question: "You need to integrate functionality from an OpenAPI 3.0-based web service into an agent solution. What should you do?"
    a: "Add the JSON schema of the web service to the agent's instructions."
    b: "Rewrite the web service as a Python function and hard-code it in your agent app."
    c: "Add the web service as an OpenAPI specification tool to the agent definition"
    answer: c
    feedback: "Correct. OpenAPI specification tools enable scalable interoperability with external services."
- item:
  - question: "Your agent application code includes a local function that you want the agent to call. What kind of tool should you add to the agent's definition?"
    a: "Function calling"
    b: "Code interpreter"
    c: "Azure Functions"
    answer: a
    feedback: "Correct. Use a Function calling tool to access functions in your application code."

::: end-knowledge-check
