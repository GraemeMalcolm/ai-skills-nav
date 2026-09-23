---
title: Module assessment
description: Knowledge check
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What is a Microsoft Fabric lakehouse?"
    a: "A relational database based on the Microsoft SQL Server database engine."
    b: "A hierarchy of folders and files in Azure Data Lake Store Gen2."
    c: "An analytical store that combines the file storage flexibility of a data lake with the SQL-based query capabilities of a data warehouse."
    answer: c
    feedback: "Correct. Lakehouses combine data lake and data warehouse features."
- item:
  - question: "What is the main difference between the lakehouse explorer and SQL analytics endpoint?"
    a: "The lakehouse explorer provides read-only access, while the SQL analytics endpoint allows data modifications."
    b: "Lakehouse explorer enables interaction with tables, files, and folders, while SQL analytics endpoint provides read-only T-SQL querying of Delta tables."
    c: "Both provide identical functionality with different user interfaces."
    answer: b
    feedback: "Correct. Lakehouse explorer supports data management operations, while SQL analytics endpoint is read-only SQL access."
- item:
  - question: "You want to include data in an external Azure Data Lake Store Gen2 location in your lakehouse, without the requirement to copy the data. What should you do?"
    a: "Create a Data pipeline that uses a Copy Data activity to load the external data into a file."
    b: "Create a shortcut."
    c: "Create a Dataflow Gen2 that extracts the data and loads it into a table."
    answer: b
    feedback: "Correct. A shortcut enables you to include external data in the lakehouse without copying it."
- item:
  - question: "You have CSV files in your lakehouse Files area and want to create Delta tables without writing code. What should you use?"
    a: "A notebook with PySpark code"
    b: "Load to tables"
    c: "The SQL analytics endpoint"
    answer: b
    feedback: "Correct. Load to tables is a no-code option that creates Delta tables from Parquet or CSV files directly in the lakehouse explorer."
- item:
  - question: "You want to use Apache Spark to interactively explore data in a file in the lakehouse. What should you do?"
    a: "Create a notebook."
    b: "Switch to the SQL analytics endpoint mode."
    c: "Create a Dataflow Gen2."
    answer: a
    feedback: "Correct. A notebook enables interactive Spark coding with PySpark or Spark SQL."
- item:
  - question: "What connection mode does Power BI use by default when connecting to a lakehouse semantic model?"
    a: "Import mode, which copies data into Power BI."
    b: "DirectQuery mode, which queries the source in real-time."
    c: "Direct Lake mode, which reads directly from Delta Lake files without copying data."
    answer: c
    feedback: "Correct. Direct Lake provides fast query performance while ensuring reports always reflect current lakehouse data."

::: end-knowledge-check
