---
title: Knowledge check
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: Which component defines an AI agent's role, goals, constraints, and preferred response style?
    a: Instructions
    b: Knowledge
    c: Action tools
    answer: a
    feedback: Instructions define the agent's role and behavior. Knowledge grounds responses in information, while action tools enable the agent to perform tasks.
- item:
  - question: What is the best way to test whether a prompt agent behaves reliably before using it in an application?
    a: Test only one successful prompt in the preview interface
    b: Increase the model size without reviewing any responses
    c: Try representative, follow-up, ambiguous, and unexpected prompts, then inspect traces and refine the configuration
    answer: c
    feedback: Varied prompts reveal gaps in instructions and tool behavior. Tracing and evaluation can then help you refine and retest the agent.
- item:
  - question: What sequence should a client application use to interact with a deployed Foundry agent?
    a: Authenticate to the endpoint, submit a prompt through the Responses API, and process the response
    b: Download the agent's model, run it locally, and upload the result to Foundry
    c: Connect directly to the agent's knowledge source without authenticating
    answer: a
    feedback: A client authenticates with an identity that has permission, connects to the agent's OpenAI-compatible endpoint, submits input through the Responses API, and handles the returned response.

::: end-knowledge-check
