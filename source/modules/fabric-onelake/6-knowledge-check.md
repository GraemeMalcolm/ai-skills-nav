---
title: Knowledge check
description: Knowledge check for discovering and connecting to data in OneLake
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What is the primary benefit of OneLake being a tenant-wide data lake?"
    a: "It automatically backs up data to multiple regions."
    b: "All Fabric workloads read from and write to the same storage location, eliminating data silos."
    c: "It requires separate configuration for each workspace."
    answer: b
    feedback: "Correct. OneLake provides a single copy of data that all workloads share, reducing duplication and ensuring everyone sees the same updated data."
- item:
  - question: "An analytics engineer needs read-only access to tables in a lakehouse managed by another team. Which approach provides T-SQL query access without copying data?"
    a: "Create a shortcut to the lakehouse tables."
    b: "Use the lakehouse's SQL analytics endpoint."
    c: "Copy the tables to a new lakehouse."
    answer: b
    feedback: "Correct. The SQL analytics endpoint provides read-only T-SQL access to lakehouse tables, making it ideal for querying data without modification."
- item:
  - question: "Where would an analytics engineer discover eventstreams and streaming data sources in Microsoft Fabric?"
    a: "OneLake catalog"
    b: "Real-Time hub"
    c: "Data Factory pipelines"
    answer: b
    feedback: "Correct. Real-Time hub is the centralized discovery experience for all eventstreams and streaming data across Microsoft Fabric."
- item:
  - question: "What is the purpose of shortcuts in OneLake?"
    a: "To compress data and reduce storage costs."
    b: "To reference data from other workspaces or external locations without copying it."
    c: "To automatically synchronize data between lakehouses."
    answer: b
    feedback: "Correct. Shortcuts let you reference data in other OneLake locations, Azure Data Lake Storage, or Amazon S3 without creating duplicate copies."
- item:
  - question: "How does well-cataloged data in OneLake support AI capabilities in Microsoft Fabric?"
    a: "It automatically trains machine learning models."
    b: "Copilot and Fabric IQ use the same catalog to search and locate relevant data for queries."
    c: "It prevents unauthorized access to AI features."
    answer: b
    feedback: "Correct. Copilot and Fabric IQ agents search the OneLake catalog to find data. Clear names, descriptions, and metadata help AI provide more accurate results."

::: end-knowledge-check
