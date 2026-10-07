---
title: Knowledge check
description: Check your understanding of the Azure Language MCP server and agent integration.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What is the primary role of the Azure Language MCP server?"
    a: "To train and fine-tune custom language models for use by AI agents."
    b: "To expose Azure Language text analysis capabilities as MCP tools for agents."
    c: "To deploy and manage large language models in an Azure subscription."
    answer: b
    feedback: "Correct. The Azure Language MCP server makes NLP capabilities such as entity recognition, sentiment analysis, and summarization available as MCP tools."
- item:
  - question: "How does an agent determine which Azure Language MCP tool to call when processing a user's prompt?"
    a: "The developer writes routing logic to direct each prompt to a specific tool."
    b: "The agent matches the prompt to tool descriptions received from the MCP server."
    c: "The MCP server analyzes the prompt and automatically routes it to a tool."
    answer: b
    feedback: "Correct. Through dynamic tool discovery, the agent receives tool descriptions and uses them to determine which tool best matches the user's request."
- item:
  - question: "When building a Python client application, how do you reference a Foundry agent when calling the OpenAI Responses API?"
    a: "By passing the agent's API key as a request header to the endpoint."
    b: "By specifying the agent name in the agent_reference field in extra_body."
    c: "By passing the agent's endpoint URL as the model parameter value."
    answer: b
    feedback: "Correct. You include an agent_reference with the agent's name and type in the extra_body parameter of the responses.create() call."
- item:
  - question: "What authentication method is used when connecting the Azure Language MCP server to a Foundry agent?"
    a: "OAuth 2.0 authentication with a client certificate and tenant ID."
    b: "Key-based authentication using the Ocp-Apim-Subscription-Key credential."
    c: "Anonymous access that requires no authentication or credentials."
    answer: b
    feedback: "Correct. The Azure Language MCP server uses key-based authentication, where the resource key is provided in the Ocp-Apim-Subscription-Key header."

::: end-knowledge-check
