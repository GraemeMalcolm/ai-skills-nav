---
title: Module assessment
description: Knowledge check
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "You need to analyze text where the same input must return structured results based on statistical techniques. Which approach is most appropriate?"
    a: "The OpenAI responses API, because it can follow natural language instructions."
    b: "The Azure Language SDK, because it returns deterministic, structured output."
    c: "The chat playground in Foundry, because it supports follow-up questions."
    answer: b
    feedback: "Correct. The Azure Language SDK uses purpose-built analyzers that return consistent, structured results for the same input, making it well-suited for automated pipelines."
- item:
  - question: "What is the purpose of the client object in the Azure Language SDK?"
    a: "It stores the application's user interface settings."
    b: "It helps application code communicate with the Azure Language service."
    c: "The client object stores the text that needs to be analyzed."
    answer: b
    feedback: "The client object is the tool your code uses to communicate with a service, holding the endpoint, credentials, and providing methods to interact with the service."
- item:
  - question: "What is the main purpose of the Azure Language MCP server?"
    a: "To automatically generate website layouts for an agent."
    b: "To replace all generative AI models inside an agent."
    c: "To expose Azure Language capabilities to agents through the Model Context Protocol."
    answer: c
    feedback: "Correct. The MCP server allows agents to access Azure Language capabilities in a structured way through the Model Context Protocol."

::: end-knowledge-check
