---
title: Knowledge check
description: Knowledge check for transforming data using notebooks.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "A data team wants to run Spark SQL queries in a PySpark notebook. What do they need to add at the top of a cell to run SQL?"
    a: "`%spark`"
    b: "`%%sql`"
    c: "`%%pyspark`"
    answer: b
    feedback: "Correct. The `%%sql` magic command lets you run Spark SQL queries in a cell, even when the notebook's default language is PySpark."
- item:
  - question: "An analytics engineer needs to replace null values in a discount column with zero using PySpark. Which method should they use?"
    a: "`df.dropna(subset=[\"discount\"])`"
    b: "`df.fillna({\"discount\": 0})`"
    c: "`df.filter(col(\"discount\").isNotNull())`"
    answer: b
    feedback: "Correct. The `fillna()` method replaces null values with the specified value for the given column."
- item:
  - question: "A team writes a nightly transformation that replaces all data in a gold-layer table with freshly processed results. Which write mode should they use?"
    a: "`append`"
    b: "`overwrite`"
    c: "`merge`"
    answer: b
    feedback: "Correct. Overwrite mode replaces the entire table with new data, which is appropriate for a full-refresh transformation."
- item:
  - question: "What does a window function provide that a standard GROUP BY aggregation does not?"
    a: "It calculates aggregated values while keeping the individual row detail."
    b: "It runs faster than GROUP BY on large datasets."
    c: "It supports more aggregation functions than GROUP BY."
    answer: a
    feedback: "Correct. Window functions calculate values across a set of related rows without collapsing the data. Each original row is preserved in the output alongside the calculated value."
- item:
  - question: "A table has grown to contain many small Parquet files after weeks of incremental appends. Which command consolidates these files to improve query performance?"
    a: "`VACUUM`"
    b: "`OPTIMIZE`"
    c: "`ANALYZE TABLE`"
    answer: b
    feedback: "Correct. OPTIMIZE performs bin compaction by consolidating small files into larger ones, which improves query performance."

::: end-knowledge-check
