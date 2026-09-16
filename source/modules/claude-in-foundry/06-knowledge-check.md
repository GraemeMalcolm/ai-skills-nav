---
title: Module assessment
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "You need to process thousands of simple classification tasks quickly and cost-effectively. Which Claude model should you start with?"
    a: "Claude Opus"
    b: "Claude Sonnet"
    c: "Claude Haiku"
    answer: c
    feedback: "Correct. Haiku is built for speed and volume, making it ideal for simple tasks like classification, extraction, and routing."
- item:
  - question: "When making API calls to Claude on Microsoft Foundry, what does the 'model' parameter specify?"
    a: "The Claude model name"
    b: "Your model deployment name in Foundry"
    c: "Your Azure subscription ID"
    answer: b
    feedback: "Correct. On Foundry, the model parameter refers to your deployment name, which may or may not match the model ID."
- item:
  - question: "Which authentication method is recommended for production deployments of Claude on Microsoft Foundry?"
    a: "API keys stored in environment variables"
    b: "Microsoft Entra ID"
    c: "Hard-coded API keys in source code"
    answer: b
    feedback: "Correct. Microsoft Entra ID provides keyless authentication with role-based access control and eliminates the risk of leaked credentials."

::: end-knowledge-check
