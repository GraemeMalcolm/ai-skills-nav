---
title: Module assessment
description: Knowledge check.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "A cloud security engineer needs to control who can create or modify Microsoft Foundry resources. Which configuration establishes these permissions?"
    a: "Microsoft Entra ID role-based access control (RBAC)"
    b: "Project-level roles in the Foundry portal"
    c: "Azure Policy initiatives"
    d: "Private Link connections"
    answer: a
    feedback: "Correct: Microsoft Entra ID RBAC defines Azure resource-level permissions, including who can create, configure, or delete Foundry resources."
- item:
  - question: "An engineer wants developers to deploy models in a Foundry project but prevent them from modifying project settings or user access. Which role assignment meets this requirement?"
    a: "Azure AI Project Manager"
    b: "Azure AI Account Owner"
    c: "Azure AI User"
    d: "Key Vault Administrator"
    answer: a
    feedback: "Correct: Azure AI Project Managers can create and deploy models but can't modify access assignments or project-level settings."
- item:
  - question: "To prevent credentials from being stored in code or configuration files, what should the engineering team implement?"
    a: "Private Link connections only"
    b: "User-assigned access keys in storage accounts"
    c: "Custom environment variables in project settings"
    d: "Azure Key Vault with managed identities"
    answer: d
    feedback: "Correct: Key Vault stores secrets securely, and managed identities allow Foundry workloads to retrieve them without embedding credentials."
- item:
  - question: "The team wants all traffic between Foundry and connected Azure services to stay on the private Azure backbone. Which approach achieves this?"
    a: "Service endpoints with firewall rules"
    b: "Managed virtual networks with Private Link"
    c: "Network Security Groups (NSGs) only"
    d: "ExpressRoute without private endpoints"
    answer: b
    feedback: "Correct: Managed virtual networks define who can access the service, and Private Link keeps communication private within Azure's backbone."
- item:
  - question: "After configuration is complete, the team needs visibility into access events and configuration changes across Foundry and connected resources. What should they enable?"
    a: "Microsoft Sentinel analytic rules"
    b: "Diagnostic logging"
    c: "Defender for Cloud AI workloads plan"
    d: "Azure Policy compliance reports"
    answer: b
    feedback: "Correct: Diagnostic logging records management actions, access events, and service health data for auditing and investigation."

::: end-knowledge-check
