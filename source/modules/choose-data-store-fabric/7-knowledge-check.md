---
title: Module assessment
description: >-
  Test your understanding of choosing data stores in Microsoft Fabric, including decision criteria for lakehouse,
  warehouse, and eventhouse.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "Which analytical data store in Microsoft Fabric provides full multi-table ACID transaction support through T-SQL?"
    a: "Lakehouse"
    b: "Warehouse"
    c: "Eventhouse"
    answer: b
    feedback: "Correct. The warehouse provides full multi-table ACID transaction support through T-SQL, including INSERT, UPDATE, DELETE, and MERGE operations across multiple tables."
- item:
  - question: "A data science team needs to explore a mix of structured transaction data and semi-structured web logs using Python notebooks. Which data store is the best fit?"
    a: "Lakehouse"
    b: "Warehouse"
    c: "Eventhouse"
    answer: a
    feedback: "Correct. The lakehouse supports both structured and semi-structured data, and provides native Apache Spark access through Python notebooks for data exploration and machine learning."
- item:
  - question: "What is the primary query language used by the eventhouse for time-series analytics?"
    a: "T-SQL"
    b: "Spark SQL"
    c: "KQL (Kusto Query Language)"
    answer: c
    feedback: "Correct. KQL is the primary query language for the eventhouse, purpose-built for time-series analysis with operators for time-window aggregations, anomaly detection, and pattern matching."
- item:
  - question: "An organization needs to build a star schema with dimension tables that require frequent updates. Which data store best supports this requirement?"
    a: "Warehouse"
    b: "Lakehouse"
    c: "Eventhouse"
    answer: a
    feedback: "Correct. The warehouse provides full T-SQL DML support including UPDATE, DELETE, and MERGE operations with multi-table ACID transactions, which is essential for maintaining slowly changing dimensions in a star schema."
- item:
  - question: "Which feature allows data in one Fabric data store to be accessed from another store without copying or moving the data?"
    a: "Cross-database queries and shortcuts"
    b: "Data pipelines"
    c: "Streaming ingestion"
    answer: a
    feedback: "Correct. Shortcuts let you reference data in one store from another without duplication, and cross-database queries in the warehouse let you join data from multiple warehouses and lakehouse SQL analytics endpoints using three-part naming."

::: end-knowledge-check
