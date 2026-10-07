---
title: Module assessment
description: Check your learning on analyzing images with Azure Content Understanding.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What is the purpose of grounding in Content Understanding?"
    a: "To connect Content Understanding to Azure storage"
    b: "To identify the specific regions in content where each value was extracted"
    c: "To filter out harmful content from images"
    answer: b
    feedback: "Correct. Grounding allows users to trace extracted values back to their origin in the source content for verification."
- item:
  - question: "What does a confidence score of 0.95 indicate for an extracted field?"
    a: "The extraction failed and needs manual review"
    b: "The value can be trusted for automated processing"
    c: "The field was classified rather than extracted"
    answer: b
    feedback: "Correct. High confidence scores (0.9+) indicate accurate data extraction that can be used in automated workflows."
- item:
  - question: "Which prebuilt analyzer would you use to extract vendor names and item totals from a purchase receipt?"
    a: "prebuilt-image"
    b: "prebuilt-invoice"
    c: "prebuilt-receipt"
    answer: c
    feedback: "Correct. The prebuilt-receipt analyzer is optimized to extract vendor names, items, totals, and dates from receipt images."

::: end-knowledge-check
