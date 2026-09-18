---
title: Knowledge check
description: Check your understanding of Azure Databricks architecture, workloads, concepts, and governance.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: Your organization requires custom networking and connectivity to on-premises systems. Which Azure Databricks workspace type should you choose?
    a: Serverless
    b: Hybrid
    c: Free Edition
    answer: b
    feedback: A Hybrid workspace provisions compute and storage in your Azure subscription, making it appropriate when you need custom networking or connectivity to on-premises systems.
- item:
  - question: A data analyst needs to run ad-hoc SQL queries and build dashboards over lakehouse data. Which compute resource is designed for this workload?
    a: A SQL warehouse
    b: A Lakeflow Job
    c: An MLflow experiment
    answer: a
    feedback: SQL warehouses are compute resources optimized for Databricks SQL analytics, including queries, dashboards, visualizations, and BI workloads.
- item:
  - question: How do Unity Catalog and Microsoft Purview work together to govern Azure Databricks data?
    a: Unity Catalog manages Databricks access, discovery, and lineage, while Purview can ingest its metadata for governance across the wider data estate
    b: Unity Catalog replaces Databricks compute, while Purview runs notebooks and SQL queries
    c: Unity Catalog stores only CSV files, while Purview converts them to Delta tables
    answer: a
    feedback: Unity Catalog provides centralized governance for data and AI assets in Azure Databricks. Microsoft Purview can scan Unity Catalog metadata to support discovery, classification, and lineage across on-premises, multicloud, and SaaS data sources.

::: end-knowledge-check
