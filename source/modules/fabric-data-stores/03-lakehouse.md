---
title: Evaluate lakehouse capabilities
---

A lakehouse in Microsoft Fabric combines the scalability of a data lake with the querying capabilities of a data warehouse. You store structured, semi-structured, and unstructured data in a single location, manage it with Delta Lake, and analyze it with both Apache Spark and SQL. This flexibility makes the lakehouse the most versatile of the three analytical data stores.

In the retail scenario, the data science team needs to explore a mix of transaction data and web clickstream logs using Python. The lakehouse is a strong candidate for this workload. This unit examines the lakehouse's capabilities so you can evaluate when it fits your scenarios.

Lakehouse architecture and capabilities
A lakehouse organizes data into two top-level areas: Tables for managed Delta tables and Files for unstructured or non-Delta data. When you place data in the Tables area, Fabric automatically validates the file, extracts metadata, and registers the table in the metastore. This managed file-to-table experience means you don't need to write CREATE TABLE statements manually for data you place in the managed area.

![Screenshot of Lakehouse explorer.](./media/lakehouse-explorer.gif)

The lakehouse provides two access paths for the same data:

- Apache Spark for read/write operations. Data engineers and data scientists use notebooks with Python, Scala, SQL, or R to ingest, transform, and analyze data.
- SQL analytics endpoint for read-only T-SQL queries. Analysts and report builders query Delta tables with familiar SQL syntax and connect Power BI through DirectLake mode.

This dual-access model is one of the lakehouse's defining characteristics. A single copy of data serves both engineering and analytics workloads, with no data movement required.
