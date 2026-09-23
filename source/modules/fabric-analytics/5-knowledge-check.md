---
title: Module assessment
description: Knowledge Check
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What is a key benefit of using Microsoft Fabric in data projects?"
    a: "It allows data professionals to work independently, without collaboration."
    b: "It requires duplicating data across systems to ensure availability."
    c: "It provides a single, integrated environment for collaboration on data projects."
    answer: c
    feedback: "Correct. Fabric provides a unified environment for data professionals and the business to collaborate effectively."
- item:
  - question: "What is the default storage format for Fabric's OneLake?"
    a: "Delta-Parquet"
    b: "JSON"
    c: "CSV"
    answer: a
    feedback: "Correct. OneLake uses Delta Parquet as its default storage format, ensuring reliability and performance."
- item:
  - question: "Which Fabric experience is used to move and transform data?"
    a: "Data Science"
    b: "Data Warehousing"
    c: "Data Factory"
    answer: c
    feedback: "Correct. The Data Factory workload is used to ingest, transform, and orchestrate data."
- item:
  - question: "Why is OneLake's unified storage model important for AI capabilities in Fabric?"
    a: "It requires all data to be converted to a proprietary format for AI processing."
    b: "AI tools like Copilot and data agents can access the same governed data without separate preparation pipelines."
    c: "It stores AI models alongside the data they process."
    answer: b
    feedback: "Correct. Because all Fabric workloads store data in OneLake using an open format, AI capabilities can access the same governed data used by reports and dashboards."

::: end-knowledge-check
