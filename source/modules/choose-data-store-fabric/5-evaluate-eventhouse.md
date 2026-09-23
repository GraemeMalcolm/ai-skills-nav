---
title: Evaluate eventhouse capabilities
description: >-
  Evaluate when to choose an eventhouse in Microsoft Fabric. Understand streaming ingestion, KQL analytics, time-series
  optimization, and ideal use cases for IoT telemetry and real-time monitoring.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "A reporting team needs to analyze sales data that's updated once per day in batch. They build star schema dimensional models and write complex T-SQL queries with multi-table joins. Is eventhouse the right choice?"
    a: "Yes, eventhouse is ideal for this scenario"
    b: "No, choose a different store"
    answer: b
    feedback: "Correct. Warehouse is the right choice for batch-updated dimensional models with T-SQL analytics and BI reporting."
- item:
  - question: "A team collects application log data continuously but only analyzes it weekly to identify trends and errors. They're comfortable learning KQL if it provides benefits. Is eventhouse the right choice?"
    a: "Yes, eventhouse is ideal for this scenario"
    b: "No, choose a different store"
    answer: a
    feedback: "Correct. Even though analysis is weekly, continuous log ingestion and log data's time-series nature make eventhouse a strong fit. KQL's text parsing and pattern matching work well for log analysis."

::: end-knowledge-check
