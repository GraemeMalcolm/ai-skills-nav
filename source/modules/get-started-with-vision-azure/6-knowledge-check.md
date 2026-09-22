---
title: Module assessment
description: Knowledge check
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What is a multimodal model?"
    a: "A model that can only process images but not text."
    b: "A model that can understand and work with more than one type of data, such as text and images."
    c: "A model that generates video content only."
    answer: b
    feedback: "Multimodal models are designed to handle multiple types of input at the same time, such as text and images. "
- item:
  - question: "How can developers programmatically generate images using Foundry image generation models?"
    a: "By sending text prompts through the OpenAI Responses API using a deployed image model"
    b: "By uploading images through the Foundry Playground UI."
    c: "By calling the GPT-4.1 model endpoint."
    answer: a
    feedback: " Developers can submit text prompts and retrieve generated images from Foundry models using the OpenAI Responses API."
- item:
  - question: "When you generate images programmatically using the OpenAI Python SDK with Microsoft Foundry, which value should you pass as the model parameter in the request?"
    a: "The original base model name (for example, gpt-image-1.5)."
    b: "The deployment name you gave the image generation model in your Foundry resource."
    c: "The name you gave your Foundry resource."
    answer: b
    feedback: "In Microsoft Foundry, API calls reference the deployment name, which is the name you gave the model."
- item:
  - question: "Why is video generation with Sora models in Microsoft Foundry handled as an asynchronous job?"
    a: "Because video generation requires user interaction during rendering."
    b: "Because the REST API doesn't support synchronous requests."
    c: "Because video generation is resource‑intensive and takes time to complete."
    answer: c
    feedback: "Video generation is computationally intensive and can take several minutes to complete. For this reason, Foundry runs video generation as an asynchronous process where you create a job, poll for its status, and download the video once it's finished."

::: end-knowledge-check
