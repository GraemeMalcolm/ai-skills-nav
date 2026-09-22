---
title: Knowledge check
description: This unit provides a knowledge check on Microsoft Foundry's generative AI models and agents.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What best describes Foundry's model catalog?"
    a: "A catalog consisting of only Microsoft-exclusive foundation models"
    b: "A central hub to discover, filter, compare, and test many generative AI models from multiple providers"
    c: "A tool that replaces the need for an Azure subscription"
    answer: b
    feedback: "Foundry's model catalog is described as a central hub where you can browse, filter, compare, and evaluate a wide variety of generative AI models."
- item:
  - question: "Which statement best describes a foundation model in Microsoft Foundry"
    a: "A small, task‑specific model that must be fine‑tuned before it can perform any useful function"
    b: "A benchmarking tool used to compare different model families"
    c: "A large, pretrained model that provides general capabilities and can be used immediately or customized"
    answer: c
    feedback: "Foundation models are large, pretrained models that offer broad language, reasoning, or multimodal abilities out of the box. They can be deployed immediately or fine‑tuned."
- item:
  - question: "In the Foundry portal, what is the primary benefit of using the Model Playground before writing code?"
    a: "It lets you test prompts, compare models, and capture working settings that you can reuse in code."
    b: "It deploys the model for you and removes the need to use an API."
    c: "It replaces system instructions by automatically generating the best system prompt for every scenario."
    answer: a
    feedback: " The Playground is described as the easiest way to interact with a deployed model and a bridge to code: you can try prompts, compare models, tune key parameters (temperature, max output tokens, system instructions), and then reuse those same values in your client application."
- item:
  - question: "What is the primary outcome of publishing an agent in Microsoft Foundry?"
    a: "It converts the agent into a managed Azure resource with a stable endpoint that you can share and integrate without exposing your Foundry project or source code."
    b: "It automatically reduces costs by making the agent free to run, regardless of model tokens, tools, or connected data services."
    c: "It replaces the need for the Project API by allowing the agent to be called only through the Foundry portal UI."
    answer: a
    feedback: "Publishing promotes an agent from a saved development asset to a managed Azure resource with a stable endpoint. "
- item:
  - question: "In the Python example, which line is responsible for calling the published agent (rather than calling a model deployment directly) when generating a response?"
    a: "`agent = project_client.agents.get(agent_name=myAgent)`"
    b: "`openai_client = project_client.get_openai_client()`"
    c: "`response = openai_client.responses.create(input=[{'role': 'user', 'content': 'Tell me what you can help with.''}], extra_body={'agent': {'name': agent.name, 'type': 'agent_reference'}},)`"
    answer: c
    feedback: "This is the actual request that produces output. The key detail is the extra_body field with 'type': 'agent_reference', which tells the API to route the request to the agent (by referencing it), rather than treating it as a normal model-only call."

::: end-knowledge-check
