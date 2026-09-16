---
title: Module assessment
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What are the three core concepts that make up an ontology in Fabric IQ?"
    a: "Tables, columns, and foreign keys"
    b: "Things (entity types), facts (properties), and connections (relationships)"
    c: "Lakehouses, warehouses, and semantic models"
    answer: b
    feedback: "Correct. An ontology is made up of the things in your environment (entity types), their facts (properties), and the ways they connect (relationships)."
- item:
  - question: "What is the primary role of a Fabric data agent?"
    a: "To move data from lakehouses to warehouses"
    b: "To visualize relationships between entities in a graph"
    c: "To process natural language questions and generate queries grounded in ontology definitions"
    answer: c
    feedback: "Correct. Data agents use Azure OpenAI to process natural language questions, identify relevant data sources, and generate appropriate queries (SQL, DAX, or KQL) based on ontology vocabulary."
- item:
  - question: "How does data binding in ontology modeling differ from traditional ETL processes?"
    a: "Data binding copies data into a centralized warehouse, while ETL leaves data in place"
    b: "Data binding creates a semantic layer that references data in place, while ETL copies and transforms data into a warehouse"
    c: "Data binding and ETL are the same process with different names"
    answer: b
    feedback: "Correct. Data binding connects ontology definitions to existing data sources in OneLake without copying data, unlike ETL which extracts, transforms, and loads data into a centralized warehouse."
- item:
  - question: "Which Fabric IQ component uses GQL (Graph Query Language) for querying?"
    a: "Ontology items"
    b: "Data agents"
    c: "Graph in Microsoft Fabric"
    answer: c
    feedback: "Correct. Graph in Microsoft Fabric uses GQL (Graph Query Language), an international standard for graph queries, to traverse relationships and analyze connected data."
- item:
  - question: "What makes entity types different from traditional database tables?"
    a: "Entity types are tied to specific databases and schemas"
    b: "Entity types are reusable logical models that exist independently of any storage system"
    c: "Entity types can only contain static data, not time-series data"
    answer: b
    feedback: "Correct. Entity types are reusable logical models elevated above any single table, allowing the same concept to be bound to multiple data sources while maintaining consistent business meaning."

::: end-knowledge-check
