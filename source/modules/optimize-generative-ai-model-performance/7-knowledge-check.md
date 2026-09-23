---
title: Module assessment
description: Knowledge check about optimizing generative AI model performance.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What is the primary purpose of a system message in a prompt?"
    a: "To define the model's role, behavior, and output constraints."
    b: "To provide training data that permanently changes the model."
    c: "To retrieve data from an external data source."
    answer: a
    feedback: "Correct. A system message sets instructions that guide the model's responses, including its role, tone, format, and boundaries."
- item:
  - question: "When should you use Retrieval Augmented Generation (RAG) instead of relying on prompt engineering alone?"
    a: "When you want the model to respond in a consistent style and format."
    b: "When the model needs access to domain-specific or current data that it wasn't trained on."
    c: "When you want to reduce the length of prompts sent to the model."
    answer: b
    feedback: "Correct. RAG retrieves relevant data from external sources at query time, enabling the model to generate accurate responses based on specific, current, or private data."
- item:
  - question: "What does the temperature parameter control in a language model?"
    a: "The maximum number of tokens the model can generate."
    b: "The randomness and creativity of the model's responses."
    c: "The speed at which the model processes requests."
    answer: b
    feedback: "Correct. A higher temperature produces more random and creative responses, while a lower temperature produces more focused and deterministic output."
- item:
  - question: "What does fine-tuning optimize in a language model?"
    a: "The factual accuracy of responses by connecting to external data."
    b: "The consistency of the model's behavior, style, and output format."
    c: "The number of tokens the model can process in a single request."
    answer: b
    feedback: "Correct. Fine-tuning trains the model on examples that demonstrate the desired style, tone, and format, maximizing the consistency of the model's behavior."
- item:
  - question: "You're building a chat application that needs to answer questions using your company's product catalog while maintaining a specific brand voice. Which combination of strategies is most appropriate?"
    a: "Prompt engineering only, with detailed system messages."
    b: "RAG for the product catalog data, fine-tuning for the brand voice, and prompt engineering for conversation-specific instructions."
    c: "Fine-tuning only, with the product catalog included in the training data."
    answer: b
    feedback: "Correct. RAG grounds the model in your actual product data, fine-tuning ensures consistent brand voice, and prompt engineering adds per-conversation guidance. These strategies are complementary."

::: end-knowledge-check
