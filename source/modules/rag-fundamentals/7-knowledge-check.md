---
title: Module assessment
description: Check your understanding of the concepts covered in this module.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What is the main purpose of retrieval-augmented generation (RAG)?"
    a: "To retrain a language model whenever source information changes."
    b: "To ground generated responses in relevant information retrieved from a data source."
    c: "To replace a language model with a search engine."
    answer: b
    feedback: "Correct! RAG adds retrieved information to the prompt so the model can generate a grounded response."
- item:
  - question: "Why are large documents commonly divided into chunks before they're indexed?"
    a: "So the solution can retrieve focused passages that fit efficiently into a prompt."
    b: "So every chunk can be used to train a separate language model."
    c: "So the original documents no longer need to be stored."
    answer: a
    feedback: "Correct! Chunking enables retrieval of focused, relevant passages instead of entire documents."
- item:
  - question: "What does an embedding represent in a RAG solution?"
    a: "A numerical vector that captures semantic characteristics of content."
    b: "A set of instructions that defines the model's behavior."
    c: "A final answer generated for a user."
    answer: a
    feedback: "Correct! Embeddings enable a solution to compare the semantic similarity of queries and content."
- item:
  - question: "Which search approach can find a passage about 'company travel costs' when the query asks about 'business trip expenses,' even if the words differ?"
    a: "Semantic vector search."
    b: "An exact filename match."
    c: "Random document selection."
    answer: a
    feedback: "Correct! Vector search can match content based on semantic similarity rather than exact words alone."
- item:
  - question: "A RAG response is fluent but contains an incorrect policy limit. What should be examined first?"
    a: "Whether the correct and current policy passage was retrieved and supplied as context."
    b: "Whether the language model can produce a longer response."
    c: "Whether more unrelated documents can be added to the prompt."
    answer: a
    feedback: "Correct! RAG quality depends first on retrieving appropriate source content, and then on generating an answer that follows it."

::: end-knowledge-check
