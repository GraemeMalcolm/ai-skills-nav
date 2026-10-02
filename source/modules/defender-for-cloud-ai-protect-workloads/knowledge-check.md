---
title: Module assessment
description: Knowledge check.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "After discovering that an AI model endpoint was left publicly accessible, what's the first step the Contoso security team should take to begin assessing AI-related risks in Microsoft Defender for Cloud?"
    a: "Enable the AI workloads plan to discover AI services and configurations across the environment."
    b: "Enable Defender for Storage to scan data repositories for malware."
    c: "Use Cloud Workload Protection (CWP) to detect runtime threats."
    d: "Create an automation rule in Microsoft Defender XDR to handle alerts."
    answer: a
    feedback: "Correct: Enabling the AI workloads plan allows Defender for Cloud to automatically discover AI resources and build the foundation for posture assessment and threat detection."
- item:
  - question: "After enabling the AI workloads plan, the team reviews the **Data & AI security** dashboard and sees an exposed storage account linked to the AI model. Which Defender for Cloud feature should they use next to analyze and fix configuration issues?"
    a: "Cloud Workload Protection (CWP)"
    b: "Cloud Security Posture Management (CSPM)"
    c: "Azure Policy"
    d: "Microsoft Defender XDR"
    answer: b
    feedback: "Correct: CSPM provides recommendations and attack path analysis to identify and remediate misconfigurations such as public endpoints or exposed storage accounts."
- item:
  - question: "While reviewing CSPM findings, the team wants to understand how exposed storage accounts and unsecured endpoints could be exploited together. Which Defender for Cloud capability provides this visualization?"
    a: "AI closer look"
    b: "Top issues panel"
    c: "Attack path analysis"
    d: "Cloud Security Explorer"
    answer: c
    feedback: "Correct: Attack path analysis connects related configuration risks across resources and shows potential routes attackers could take to reach sensitive AI assets."
- item:
  - question: "Later, Defender for Cloud detects suspicious behavior in the AI container and generates an alert for a possible prompt injection attempt. Which Defender for Cloud capability provides this detection?"
    a: "Microsoft Purview"
    b: "Cloud Workload Protection (CWP)"
    c: "Cloud Security Posture Management (CSPM)"
    d: "Data & AI security dashboard"
    answer: b
    feedback: "Correct: CWP analyzes runtime activity and detects threats such as prompt injections, data exfiltration, or compromised containers affecting AI workloads."
- item:
  - question: "The alert is correlated with other activity and surfaces as an incident in Microsoft Defender XDR. The team wants to confirm what triggered the alert. Where can they view the captured portion of the suspicious prompt?"
    a: "In Cloud Security Explorer"
    b: "In Azure Policy"
    c: "In the Data & AI security dashboard"
    d: "In Microsoft Defender XDR under the Prompt Suspicious Segment field"
    answer: d
    feedback: "Correct: Defender XDR displays the captured prompt segment from AI-related alerts, helping analysts identify malicious or manipulated inputs."

::: end-knowledge-check
