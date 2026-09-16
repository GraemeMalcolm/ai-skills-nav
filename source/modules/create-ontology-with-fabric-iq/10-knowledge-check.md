---
title: Module assessment
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What is the main advantage of generating an ontology from a Power BI semantic model compared to building manually?"
    a: "It creates relationship data bindings automatically"
    b: "It automatically creates entity types, properties, keys, and entity data bindings from existing model structure"
    c: "It allows you to use business-friendly names from the start"
    answer: b
    feedback: "Correct. Generating from a semantic model automates the creation of entity types (from tables), properties (from columns), keys, and entity data bindings, saving significant setup time compared to manual creation."
- item:
  - question: "What must you configure for an entity type before you can bind it to data sources?"
    a: "Relationship types connecting it to other entities"
    b: "An entity type key using one or more string or integer properties"
    c: "At least one time series property"
    answer: b
    feedback: "Correct. Every entity type needs a key that uniquely identifies each instance. The key must use string or integer properties and is required before binding the entity type to data sources."
- item:
  - question: "How does a time series binding differ from a static binding?"
    a: "Time series bindings connect to eventhouse streams with a timestamp column, while static bindings connect to lakehouse tables"
    b: "Time series bindings can be added before static bindings"
    c: "Time series bindings don't require a key property"
    answer: a
    feedback: "Correct. Static bindings connect entity properties to lakehouse tables containing data that changes infrequently. Time series bindings connect to eventhouse streams containing continuously arriving observations, requiring a timestamp column to order the measurements."
- item:
  - question: "What information do you need to configure a relationship data binding?"
    a: "The source table containing identifying information for both entity types and the columns that match each entity type's key"
    b: "Only the source entity type and target entity type"
    c: "The primary key and foreign key columns from your database schema"
    answer: a
    feedback: "Correct. Relationship configuration requires selecting a source table where each row contains values identifying both the source and target entity instances, and mapping columns to the keys of both entity types."

::: end-knowledge-check
