---
title: Module assessment
description: Knowledge check.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "The administrator wants to see how Microsoft Foundry's built-in protections handle potentially harmful or ungrounded content before creating custom configurations. Which workspace feature should they use?"
    a: "Model catalog"
    b: "Try it out"
    c: "Deployments"
    d: "Activity log"
    answer: b
    feedback: "Correct: The Try it out page in the Guardrails + controls workspace lets you test built-in moderation, Prompt Shields, groundedness, and protected-material detection before creating custom guardrails."
- item:
  - question: "During testing, the administrator notices that users occasionally include internal code names and credentials in prompts. Which feature can block these terms before they reach the model?"
    a: "Groundedness detection"
    b: "Content filter"
    c: "Blocklist"
    d: "Protected-material detection"
    answer: c
    feedback: "Correct: Blocklists restrict sensitive or restricted terms such as project names or credentials from being used in prompts or model outputs."
- item:
  - question: "After deployment, the administrator wants to ensure that the model doesn't return copyrighted or non-Microsoft code. Which control should be enabled in the output filter?"
    a: "Prompt Shields"
    b: "Blocklist"
    c: "Moderation categories"
    d: "Protected-material detection"
    answer: d
    feedback: "Correct: Protected-material detection scans model outputs for proprietary or non-Microsoft content and can annotate or block those results."
- item:
  - question: "The administrator receives feedback that some harmless prompts are being blocked. To improve usability, what is the best way to adjust enforcement?"
    a: "Disable the content filter to collect unrestricted results"
    b: "Remove Prompt Shields to reduce interference with prompts"
    c: "Start with moderate thresholds and use annotation before blocking"
    d: "Increase all harm category thresholds to maximum blocking"
    answer: c
    feedback: "Correct: Using moderate thresholds and annotation first allows teams to observe false positives and tune enforcement without interrupting productivity."
- item:
  - question: "After the guardrails are active, the administrator wants to confirm that they continue working as intended and remain aligned with organizational policy. Which action supports continuous assurance?"
    a: "Rely solely on Defender for Cloud recommendations"
    b: "Disable existing guardrails during compliance reviews"
    c: "Review logs and detections in the Guardrails + controls workspace"
    d: "Delete and recreate all filters each month"
    answer: c
    feedback: "Correct: Reviewing logs and detections verifies how often guardrails trigger and helps refine configurations to match policy and reduce false positives."

::: end-knowledge-check
