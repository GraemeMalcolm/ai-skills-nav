---
title: Module assessment
description: Module assessment
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What are the two authentication methods supported by the Voice Live API?"
    a: "OAuth 2.0 and JWT (JSON Web Tokens)"
    b: "Basic authentication and API keys"
    c: "Microsoft Entra (keyless) and API key"
    answer: c
    feedback: "Microsoft Entra (keyless) and API key are both supported authentication methods for the Voice Live API."
- item:
  - question: "Which protocol is used for avatar streaming integration in Voice Live API?"
    a: "HTTP/2"
    b: "WebRTC"
    c: "gRPC"
    answer: b
    feedback: "The Voice live API supports WebRTC-based avatar streaming for interactive applications"
- item:
  - question: "How do you configure and test Voice Live agent integration in the Foundry Portal?"
    a: "You can't - Voice Live is only accessible through the REST API or Python SDK."
    b: "In the Azure Speech in Foundry Tools Voice Live playground"
    c: "Enable Voice mode in the agent playground"
    answer: c
    feedback: "Enabling Voice mode in the agent playground enables you to configure and test Voice Live agent integration."
- item:
  - question: "How can you stop audio playback when a user interrupts the voice agent?"
    a: "You can't - the user must wait for the agent to finish."
    b: "Handle the ServerEventType.INPUT_AUDIO_BUFFER_SPEECH_STARTED event"
    c: "Reset the Voice Live session and clear the conversation history"
    answer: b
    feedback: "This event can be used to stop audio playback, and cancel any current response."

::: end-knowledge-check
