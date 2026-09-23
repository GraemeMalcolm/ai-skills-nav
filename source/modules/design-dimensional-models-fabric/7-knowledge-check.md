---
title: Knowledge check
description: Knowledge check for designing dimensional models
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "Which schema type is recommended for most analytics workloads in Microsoft Fabric?"
    a: "Snowflake schema"
    b: "Star schema"
    c: "Normalized schema"
    answer: b
    feedback: "Correct. Star schema is the recommended approach. It delivers fewer joins for better query performance, an intuitive structure that maps to business concepts, and a foundation for Power BI semantic models."
- item:
  - question: "What is the most important design decision when creating a fact table?"
    a: "Choosing the naming convention for the table"
    b: "Selecting which measures to include"
    c: "Defining the grain"
    answer: c
    feedback: "Correct. The grain specifies what one row in the fact table represents. It determines which dimension keys and measures belong in the table and should be defined before other design decisions."
- item:
  - question: "Why are surrogate keys recommended for dimension tables?"
    a: "They store meaningful business values that users can interpret"
    b: "They insulate the data warehouse from source system changes and support historical tracking"
    c: "They eliminate the need for natural keys in the dimension"
    answer: b
    feedback: "Correct. Surrogate keys consolidate data from multiple sources, replace multi-column keys with a single column, and enable slowly changing dimension type 2 tracking with multiple versions of the same entity."
- item:
  - question: "An organization needs to analyze sales by the region a salesperson was assigned to at the time of each sale. Which SCD type should the organization use for the region attribute?"
    a: "Type 1, which overwrites the current value"
    b: "Type 2, which adds a new version row"
    c: "Type 3, which adds a column for the previous value"
    answer: b
    feedback: "Correct. Type 2 inserts a new row for each change, maintaining full history with effective dates. Each version of the salesperson has its own surrogate key, so historical facts link to the correct region at the time of each sale."
- item:
  - question: "A periodic snapshot fact table records end-of-day inventory levels. Which measure type best describes the inventory balance?"
    a: "Additive"
    b: "Semi-additive"
    c: "Non-additive"
    answer: b
    feedback: "Correct. Semi-additive measures can be summed across some dimensions but not all. An inventory balance can be summed across products or locations, but not across time periods, because each snapshot represents a point-in-time state."

::: end-knowledge-check
