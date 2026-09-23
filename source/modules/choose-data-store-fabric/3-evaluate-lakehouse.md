---
title: Evaluate lakehouse capabilities
description: >-
  Evaluate when to choose a lakehouse in Microsoft Fabric. Understand lakehouse architecture, dual Spark and SQL access,
  schema flexibility, and ideal use cases for data engineering and data science.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "A data science team needs to process 50 TB of mixed structured CSV files and semi-structured JSON web logs using Python notebooks for exploratory analysis and ML model training. Is lakehouse the right choice?"
    a: "Yes, lakehouse is ideal for this scenario"
    b: "No, choose a different store"
    answer: a
    feedback: "Correct. Mixed data formats (CSV and JSON), Python/Spark notebooks for processing, exploratory analysis with evolving schema, and big data scale (50 TB) are all core lakehouse strengths."
- item:
  - question: "A finance team needs to build a star schema where dimension tables require daily UPDATE operations via T-SQL to maintain slowly changing dimensions. Is lakehouse the right choice?"
    a: "Yes, lakehouse is ideal for this scenario"
    b: "No, choose a different store"
    answer: b
    feedback: "Correct. The warehouse provides full T-SQL DML support including UPDATE, DELETE, and MERGE operations for maintaining dimensional models with transactional consistency."

::: end-knowledge-check
