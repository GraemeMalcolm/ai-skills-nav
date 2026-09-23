---
title: Knowledge check
description: Knowledge check for transforming data using Dataflows Gen2
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What is the primary purpose of a dataflow in Microsoft Fabric?"
    a: "To create visualizations and reports from raw data"
    b: "To extract, transform, and load data using a low-code Power Query interface"
    c: "To manage workspace security and access permissions"
    answer: b
    feedback: "Correct. Dataflows provide a cloud-based ETL experience using Power Query Online, allowing you to connect to data sources, apply transformations, and load results to destinations like lakehouses and warehouses."
- item:
  - question: "What is query folding?"
    a: "The process of combining multiple queries into a single query for efficiency"
    b: "The process of pushing transformation logic to the data source for execution instead of processing it in the Power Query engine"
    c: "The process of organizing applied steps into folders for better readability"
    answer: b
    feedback: "Correct. Query folding translates M steps into native query language (like SQL) that the data source executes, returning only the transformed results. This reduces data transfer and improves performance."
- item:
  - question: "Which transformation combines rows from two queries into a single query, similar to a SQL JOIN?"
    a: "Append queries"
    b: "Group by"
    c: "Merge queries"
    answer: c
    feedback: "Correct. Merge queries joins two queries by matching values in selected columns, similar to a SQL JOIN operation. You can choose different join types like left outer, inner, and full outer."
- item:
  - question: "How can you check whether a specific applied step folds to the data source?"
    a: "Open the Advanced Editor and look for SQL syntax in the M code"
    b: "Right-click the step in the Applied Steps pane and check if View Native Query is available"
    c: "Run the dataflow and check the refresh history for folding status"
    answer: b
    feedback: "Correct. If View Native Query is available, the step folds to the data source and you can see the native query that would be sent. If it's grayed out, the step doesn't fold."
- item:
  - question: "When is a notebook a better choice than a dataflow for data transformation?"
    a: "When the team prefers a visual drag-and-drop interface"
    b: "When transformations involve filtering rows and removing columns"
    c: "When transformations require complex logic or large-scale distributed processing"
    answer: c
    feedback: "Correct. Notebooks with Apache Spark provide more flexibility for complex algorithms, advanced data science workloads, and large-scale data processing that benefits from distributed compute."

::: end-knowledge-check
