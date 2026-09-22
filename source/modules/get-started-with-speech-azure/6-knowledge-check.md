---
title: Module assessment
description: Knowledge check
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "Why would a developer use the Azure Speech‑to‑Text SDK instead of only using the Foundry playground?"
    a: "The SDK replaces the need for Azure Speech models."
    b: "The SDK is required to upload audio files to the Foundry portal."
    c: "The SDK allows speech recognition to be added directly into application code."
    answer: c
    feedback: "The Speech‑to‑Text SDK is designed for use in applications, handling tasks like audio streaming, authentication, and receiving transcription results in code."
- item:
  - question: "What does the Azure Text‑to‑Speech SDK handle for developers?"
    a: "Only selecting the voice and writing audio files manually"
    b: "Authentication, network communication, and audio generation"
    c: "Storing synthesized audio permanently in Azure Storage"
    answer: b
    feedback: "The Text‑to‑Speech SDK handles authentication, network communication, audio formatting, and playback, allowing developers to focus on application logic."
- item:
  - question: "What role does the Voice Live Python SDK (azure-ai-voicelive) play in a voice‑enabled agent?"
    a: " It stores audio recordings permanently in Azure Storage"
    b: "It replaces the need for microphones and speakers on the user’s device"
    c: "It opens a real‑time connection, streams audio, and handles spoken responses and interruptions"
    answer: c
    feedback: "The Voice Live SDK opens a WebSocket session, streams microphone audio to the service, receives spoken responses, and supports interruptions for natural conversations."

::: end-knowledge-check
