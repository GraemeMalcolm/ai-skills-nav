---
title: Module assessment
description: Knowledge check
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "Which type of table should an insurance company use to store supplier attribute details for aggregating claims?"
    a: "Fact table."
    b: "Dimension table."
    c: "Staging table."
    answer: b
    feedback: "Correct. A dimension table stores attributes used to group numeric measures."
- item:
  - question: "What is a semantic model in the data warehouse experience?"
    a: "A semantic model is a business-oriented data model that provides a consistent and reusable representation of data across the organization."
    b: "A semantic model is a physical data model that describes the structure of the data stored in the data warehouse."
    c: "A semantic model is a machine learning model that is used to make predictions based on data in the data warehouse."
    answer: a
    feedback: "Correct. A semantic model in the data warehouse experience provides a way to organize and structure data in a way that is meaningful to business users, enabling them to easily access and analyze data."
- item:
  - question: "What is the purpose of item permissions in a workspace?"
    a: "To grant access to all items within a workspace."
    b: "To grant access to specific columns within a table."
    c: "To grant access to individual warehouses for downstream consumption."
    answer: c
    feedback: "Correct.  By granting access to a single data warehouse using item permissions, you can enable downstream consumption of data."
- item:
  - question: "What capability does a Fabric data warehouse provide that a SQL analytics endpoint does not?"
    a: "Writing data using INSERT, UPDATE, DELETE, and MERGE statements."
    b: "Reading data from tables and views using SELECT statements."
    c: "Connecting with SQL client tools like SQL Server Management Studio."
    answer: a
    feedback: "Correct. A Fabric data warehouse supports full T-SQL DML, including INSERT, UPDATE, DELETE, and MERGE. A SQL analytics endpoint provides read-only access to lakehouse data."

::: end-knowledge-check
