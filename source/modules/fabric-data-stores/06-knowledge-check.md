---
title: Knowledge check
---

::: knowledge-check type="chat" show-answers="false" allow-retry="true"

- item:
  - question: A data science team needs to analyze structured transaction data and semi-structured clickstream logs by using Python and Apache Spark. Which Fabric data store should they choose?
    a: Warehouse
    b: Lakehouse
    c: Eventhouse
    answer: b
    feedback: A lakehouse supports structured and semi-structured data and provides Apache Spark access for analysis with Python, Scala, SQL, or R.
- item:
  - question: Which Fabric data store provides full T-SQL DML and DDL support with multi-table ACID transactions?
    a: Warehouse
    b: Eventhouse
    c: Lakehouse
    answer: a
    feedback: A warehouse provides full T-SQL DML and DDL operations with multi-table ACID transactions for structured analytical workloads.
- item:
  - question: An operations team needs near real-time analysis of continuously arriving IoT sensor data, including anomaly detection over time. Which Fabric data store is the best fit?
    a: Lakehouse
    b: Warehouse
    c: Eventhouse
    answer: c
    feedback: An eventhouse is optimized for continuously arriving event and time-series data, with KQL support for near real-time analysis and anomaly detection.

::: end-knowledge-check
