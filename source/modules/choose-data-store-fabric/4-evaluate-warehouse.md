---
title: Evaluate warehouse capabilities
description: >-
  Evaluate when to choose a warehouse in Microsoft Fabric. Understand full T-SQL support, multi-table ACID transactions,
  schema-on-write governance, and ideal use cases for BI reporting and dimensional modeling.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "A BI team with 10+ years of SQL Server experience needs to build dimensional models with daily dimension updates. They need to support complex multi-table joins for Power BI reports. Is warehouse the right choice?"
    a: "Yes, warehouse is ideal for this scenario"
    b: "No, choose a different store"
    answer: a
    feedback: "Correct. SQL Server expertise translates directly to warehouse T-SQL, dimensional models are optimized in warehouse, transactional updates work for dimension maintenance, and Power BI Direct Lake provides optimal performance."
- item:
  - question: "An analytics team works entirely in T-SQL and needs to query data across multiple sources: two different warehouses and Delta tables from a lakehouse. They don't want to copy or move data. Is warehouse the right choice for their queries?"
    a: "Yes, warehouse is ideal for this scenario"
    b: "No, choose a different store"
    answer: a
    feedback: "Correct. Warehouse cross-database queries support three-part naming to join data across multiple warehouses and lakehouse SQL analytics endpoints without copying data. This is exactly what the team needs."

::: end-knowledge-check
