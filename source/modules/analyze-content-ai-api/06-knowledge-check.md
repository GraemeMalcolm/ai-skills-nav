---
title: Module assessment
description: Check your knowledge.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What configuration values are needed to use the Azure Content Understanding API?"
    a: "The name of the resource group where the Azure service is deployed."
    b: "The Azure subscription ID and tenant ID."
    c: "The endpoint and key for the Foundry resource."
    answer: c
    feedback: "Correct. The endpoint and key are required to use the API."
- item:
  - question: "What must be specified when calling the *analyze* method to extract fields from content?"
    a: "The name of the Foundry resource."
    b: "The name of the analyzer."
    c: "The Operation-Location returned when the analyzer was created."
    answer: b
    feedback: "Correct. The name of the analyzer is required to extract fields from content."
- item:
  - question: "How are the extracted fields returned?"
    a: "As type-specific values."
    b: "As a list of strings."
    c: "As a single blob."
    answer: a
    feedback: "Correct. Each field in the results is of a specific data type."

::: end-knowledge-check
