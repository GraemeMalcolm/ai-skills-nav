---
title: Module assessment
description: Knowledge check.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "Which layer of an AI workload handles user input, connects it to the model, and returns responses?"
    a: "Application layer"
    b: "Retrieval layer"
    c: "Orchestration layer"
    d: "Data layer"
    answer: a
    feedback: "Correct: The application layer manages user interaction, routes prompts to the model, and delivers responses. In AI workloads, this layer often integrates APIs or copilots that connect to model endpoints."
- item:
  - question: "Which type of risk occurs when attackers manipulate a model through crafted inputs or malicious documents?"
    a: "Data exfiltration"
    b: "Prompt injection"
    c: "Model drift"
    d: "Model overfitting"
    answer: b
    feedback: "Correct: Prompt injection is an attempt to alter a model's instructions directly or indirectly through malicious input. Security engineers should account for this in their threat models."
- item:
  - question: "Contoso wants to prevent its AI assistant from producing harmful or ungrounded responses. Which Azure control addresses this concern?"
    a: "Content Safety"
    b: "Prompt Shields"
    c: "Network isolation"
    d: "Azure Policy"
    answer: a
    feedback: "Correct: Content Safety evaluates model outputs and filters harmful, ungrounded, or sensitive responses before delivery. It complements infrastructure controls like network isolation and access management."
- item:
  - question: "Which Azure service helps the cloud security engineer identify misconfigurations and threats across the AI infrastructure?"
    a: "Microsoft Entra ID"
    b: "Microsoft Defender for Cloud"
    c: "Microsoft Foundry"
    d: "Microsoft Purview"
    answer: b
    feedback: "Correct: Microsoft Defender for Cloud provides cloud security posture management (CSPM) and workload protection. It helps engineers assess AI infrastructure, detect threats, and align configurations with best practices."
- item:
  - question: "To achieve a complete protection strategy for Contoso's AI assistant, which combination of tools should the engineer use?"
    a: "Microsoft Foundry and Microsoft Defender for Cloud"
    b: "Microsoft Purview and Microsoft Entra ID"
    c: "Microsoft Foundry and Azure AI Search"
    d: "Microsoft Purview, Microsoft Foundry, Microsoft Defender for Cloud, and Microsoft Entra ID"
    answer: d
    feedback: "Correct: Together, these tools provide unified coverage across data governance, model guardrails, workload posture, and identity protection. Microsoft Entra ID enforces access through RBAC and conditional access, while Defender for Cloud extends CSPM to AI workloads."

::: end-knowledge-check
