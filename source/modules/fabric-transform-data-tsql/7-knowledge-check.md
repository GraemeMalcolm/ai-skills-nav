---
title: Knowledge check
description: Knowledge check for transforming data using T-SQL
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "A data engineer needs to combine order data from a staging table with customer names from a dimension table and calculate a running total of sales per customer. Which T-SQL feature calculates the running total without collapsing the result set?"
    a: "A GROUP BY clause with SUM"
    b: "A window function with SUM ... OVER"
    c: "A common table expression (CTE)"
    answer: b
    feedback: "Correct. Window functions with SUM ... OVER (PARTITION BY ... ORDER BY ...) calculate running totals across a set of related rows without reducing the number of rows in the result."
- item:
  - question: "A team queries the same complex join and aggregation logic from multiple reports and semantic models. What is the primary benefit of implementing this logic as a view instead of repeating the query?"
    a: "Views store pre-computed results that load faster than running the query directly."
    b: "Views define the query once so it can be referenced by name, reducing duplication and simplifying maintenance."
    c: "Views enforce foreign key constraints between the tables they reference."
    answer: b
    feedback: "Correct. A view saves the query definition as a database object. Multiple consumers reference the view by name, so changes to the logic only need to be made in one place."
- item:
  - question: "A data engineer builds a stored procedure that accepts year and month parameters to refresh a summary table. The procedure deletes existing rows for that period and inserts freshly aggregated data. Which loading pattern does this procedure implement?"
    a: "Merge (upsert)"
    b: "Incremental load"
    c: "Full refresh of a partition"
    answer: c
    feedback: "Correct. The procedure replaces all data for the specified period by deleting existing rows and inserting fresh results. This is a full refresh scoped to a time-based partition."
- item:
  - question: "When loading a fact table from staging data, the INSERT statement joins staging.orders with dim.customer using the filter is_current = 1. What does this filter accomplish?"
    a: "It restricts the load to only the most recent orders in the staging table."
    b: "It links each fact row to the current version of the customer dimension record."
    c: "It prevents duplicate rows from being inserted into the fact table."
    answer: b
    feedback: "Correct. In an SCD Type 2 dimension, multiple rows can exist for the same customer. Filtering on is_current = 1 ensures the fact row references the active customer record."
- item:
  - question: "A data engineer needs to test transformation logic against production warehouse data without risking changes to the original tables. Which Fabric feature supports this scenario with minimal storage overhead?"
    a: "Create a view over the production table"
    b: "Create a table clone of the production table"
    c: "Create a stored procedure that wraps the production table in a transaction"
    answer: b
    feedback: "Correct. A table clone creates a zero-copy reference to the source table's data. You can test write operations on the clone without affecting the original, and only changed data consumes extra storage."

::: end-knowledge-check
