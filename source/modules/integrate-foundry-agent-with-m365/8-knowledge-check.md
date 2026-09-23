---
title: Knowledge check
description: Check your knowledge of integrating Microsoft Foundry agents with Microsoft 365.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What Azure resource does the Foundry portal automatically create when you publish an agent to Microsoft Teams?"
    a: "Azure Functions"
    b: "Azure Bot Service"
    c: "Azure Cosmos DB"
    d: "Azure Logic Apps"
    answer: b
    feedback: "Correct. The publishing process automatically creates an Azure Bot Service resource that routes messages between Microsoft Teams and your Foundry agent."
- item:
  - question: "What is the main difference between shared scope and organization scope when publishing an agent?"
    a: "Shared scope requires more Azure resources"
    b: "Organization scope requires admin approval before the agent is available to all users"
    c: "Shared scope only works in the Foundry playground"
    d: "Organization scope provides better agent performance"
    answer: b
    feedback: "Correct. Organization scope requires an administrator to approve the agent in the Microsoft 365 admin center before it becomes available organization-wide."
- item:
  - question: "What happens to tool permissions when you publish an agent from Foundry to Teams?"
    a: "Permissions are automatically transferred to the published agent"
    b: "Tools are disabled after publishing"
    c: "The published agent gets a new identity and needs permissions reassigned"
    d: "Permissions only work in organization scope"
    answer: c
    feedback: "Correct. The published agent uses its own distinct identity, so any RBAC permissions for Azure resources must be assigned to this new identity."
- item:
  - question: "What is Microsoft Work IQ?"
    a: "A machine learning model for workplace analytics"
    b: "A CLI and MCP server that connects AI agents to Microsoft 365 data"
    c: "A replacement for Microsoft Teams"
    d: "A Visual Studio Code extension for building agents"
    answer: b
    feedback: "Correct. Work IQ is a command-line interface and Model Context Protocol server that enables AI agents to access Microsoft 365 data like emails, meetings, and documents."
- item:
  - question: "When should you consider using the Microsoft 365 Agents Toolkit instead of direct publishing from Foundry?"
    a: "For all production deployments"
    b: "When you need custom SSO, middleware logic, or multi-environment deployment"
    c: "When publishing to shared scope"
    d: "When your agent doesn't use any tools"
    answer: b
    feedback: "Correct. The Agents Toolkit is valuable for complex scenarios requiring custom single sign-on, middleware processing, or sophisticated deployment pipelines."

::: end-knowledge-check
