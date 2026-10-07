---
title: Module assessment
description: Knowledge check
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What information do you need from your Microsoft Foundry resource to consume it using the Azure Speech SDK?"
    a: "The endpoint and key"
    b: "The primary and secondary keys"
    c: "The Azure subscription ID and resource group name"
    answer: a
    feedback: "Correct. The Azure Speech SDK requires the endpoint and a key to connect to the Azure Speech service."
- item:
  - question: "Which object should you use to specify that the speech input to be transcribed to text is in an audio file?"
    a: "SpeechConfig"
    b: "AudioConfig"
    c: "SpeechRecognizer"
    answer: b
    feedback: "Correct. Use an AudioConfig to specify the input source for speech."
- item:
  - question: "How can you change the voice used in speech synthesis?"
    a: "Specify a SpeechSynthesisOutputFormat enumeration in the SpeechConfig object."
    b: "Set the speech_synthesis_voice_name property of the SpeechConfig object to the desired voice name."
    c: "Specify a filename in the AudioConfig object."
    answer: b
    feedback: "Correct. To set a voice, set the speech_synthesis_voice_name property of the SpeechConfig to a voice name, such as \"en-GB-George\"."

::: end-knowledge-check
