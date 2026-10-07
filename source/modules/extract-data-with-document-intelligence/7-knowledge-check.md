---
title: Module assessment
description: Knowledge check for extracting data with Azure Document Intelligence.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "You need to extract text and table structure from a set of documents that have varying formats. You don't need to identify specific labeled fields. Which Document Intelligence model should you use?"
    a: "The read model."
    b: "The layout model."
    c: "The invoice model."
    answer: b
    feedback: "Correct. The layout model extracts text, tables, selection marks, and document structure information, making it ideal for documents with varying formats where you need structural data."
- item:
  - question: "You're building a custom model in Azure Document Intelligence. What training artifacts are required when training with the REST API?"
    a: "Only the sample form documents in a blob container."
    b: "Sample forms along with ocr.json, labels.json, and fields.json files in a blob container."
    c: "A minimum of 100 labeled forms and a trained classifier."
    answer: b
    feedback: "Correct. You need an ocr.json file for each sample form, a labels.json file for each form mapping fields to locations, and a single fields.json file describing the fields to extract."
- item:
  - question: "A company processes both invoices and receipts. They want a single endpoint that routes each document to the correct extraction model. What should they use?"
    a: "A custom neural model."
    b: "A prebuilt read model."
    c: "A composed model or a custom classifier paired with extraction models."
    answer: c
    feedback: "Correct. A composed model combines multiple custom models into a single endpoint and classifies each document to the appropriate component model. Alternatively, a custom classifier can identify the document type before routing to the correct extraction model."

::: end-knowledge-check
