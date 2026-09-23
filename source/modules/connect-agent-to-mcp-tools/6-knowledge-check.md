---
title: Module assessment
description: Check your learning on connecting Model Context Protocol (MCP) tools to Azure AI Agents.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What role does the MCP server play in the MCP agent tool integration?"
    a: "Runs the AI agent and processes user prompts directly."
    b: "Manages network connections between multiple agents."
    c: "Hosts tool definitions and makes them available for discovery by the client."
    answer: c
    feedback: "Correct. The MCP server acts as a central registry for tool definitions."
- item:
  - question: "How does an MCP client retrieve available tools from the MCP server?"
    a: "By calling `session.list_tools()` to get the current tool catalog."
    b: "By reading a static JSON file from the server directory."
    c: "By subscribing to server events via a WebSocket connection."
    answer: a
    feedback: "Correct. The client uses `list_tools()` to discover tools dynamically."
- item:
  - question: "Why should MCP tools be wrapped in async functions on the client-side?"
    a: "To allow the agent to wait for user input."
    b: "To enable asynchronous invocation so the agent can call tools without blocking."
    c: "To convert the functions into REST API endpoints automatically."
    answer: b
    feedback: "Async functions let the agent invoke tools efficiently."

::: end-knowledge-check
