---
title: Knowledge check
description: >-
  This unit provides a knowledge check to assess your understanding of the concepts covered in the previous units. Test
  your knowledge of Azure and its capabilities for AI development.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "Which statement best explains the relationship between AI and ML?"
    a: "AI and ML are interchangeable terms; both refer to systems that mimic human intelligence without distinction."
    b: "ML focuses exclusively on generative tasks like creating text and images, whereas AI is limited to decision-making and planning."
    c: "AI is the overarching goal of creating systems that exhibit human-like intelligence, while ML is a data-driven method used to achieve AI by learning patterns from data."
    answer: c
    feedback: "AI aims to mimic human intelligence, and ML enables AI by using algorithms that learn from data without explicit programming."
- item:
  - question: "How does Microsoft Foundry relate to Azure?"
    a: "Foundry is built on top of Azure and uses Azure resources such as compute, networking, identity, and security to host and operate AI applications."
    b: "Foundry runs independently from Azure and doesn't require Azure resources to deploy models or agents."
    c: "Foundry replaces Azure services entirely, serving as a standalone cloud platform for running AI workloads."
    answer: a
    feedback: "Foundry is an enterprise-grade platform built on Azure, using Azure’s compute, networking, identity (Entra ID), security, and resource management. You can't run Foundry without Azure."
- item:
  - question: "Which statement best describes how keys, secrets, and endpoints work together in an Azure‑based AI application?"
    a: "The key is the location where model responses are stored, and the endpoint retrieves those responses from Azure Key Vault."
    b: "The endpoint stores sensitive values for an AI application, and the key determines how much data the endpoint can return."
    c: "The endpoint is a URL for calling a deployed model, and the key (stored as a secret in Azure Key Vault) authenticates the request made to that endpoint."
    answer: c
    feedback: "An endpoint is the URL used to call a deployed model. A key is a type of secret that authenticates the request. Keys and secrets should be stored in Azure Key Vault, not in code. The application retrieves the secret at runtime and uses it to securely call the endpoint."
- item:
  - question: "Which statement best describes a client application in the context of an AI solution built with Foundry?"
    a: "A client application is the environment that hosts the model, runs inference, and returns results."
    b: "A client application is a program the user interacts with—such as a web app or mobile app—that sends requests to a model endpoint and displays the response."
    c: "A client application is a standalone Azure service that automatically generates API keys for model deployments."
    answer: b
    feedback: "A client application is the user-facing program (web, mobile, desktop, CLI) that collects input, sends it to the model endpoint, and shows the result."

::: end-knowledge-check
