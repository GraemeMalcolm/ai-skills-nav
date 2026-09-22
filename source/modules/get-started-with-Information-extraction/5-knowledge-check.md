---
title: Module assessment
description: Knowledge check
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What is the key advantage of using Azure Content Understanding over basic Optical Character Recognition (OCR)?"
    a: "Azure Content Understanding extracts text faster by skipping image preprocessing."
    b: "Azure Content Understanding understands document structure and maps extracted data to a defined schema."
    c: "Azure Content Understanding extracts structured data, while OCR extracts the relationship between words in text."
    answer: b
    feedback: "Azure Content Understanding goes beyond basic OCR by using schema‑based extraction, allowing it to identify fields (such as invoice number or total) and map values even when labels vary or are missing."
- item:
  - question: "What is the primary role of an analyzer in Azure Content Understanding?"
    a: "It defines how content is processed and what structured data is returned."
    b: "It stores extracted data in a database."
    c: "It converts JSON output into human‑readable text."
    answer: a
    feedback: "Analyzers are the core components that define how content is processed, including extraction settings, schemas, and model deployments."
- item:
  - question: "When you use the Azure Content Understanding Python SDK, what happens after you submit content for analysis?"
    a: "The results are returned immediately in the same request."
    b: "The analyzer retrains itself on the submitted content."
    c: "You must poll a URL until the analysis job completes."
    answer: c
    feedback: "Content analysis is handled as a long‑running asynchronous operation. After submitting content, you poll the Operation-Location (or use the SDK poller) until the job completes and returns results."

::: end-knowledge-check
