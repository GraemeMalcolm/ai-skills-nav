---
title: Knowledge check
description: Verify your knowledge of governance, guardrails, and operations.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What is the best way to allow a terminal agent to perform a low-risk, read-only task like summarizing recent commits without granting broad capabilities?"
    a: "Allow all tools so the agent never prompts for approval"
    b: "Scope tool access to only what is required for read-only Git inspection"
    c: "Grant write access by default and rely on audits afterward"
    d: "Deny all shell access and require manual copy/paste of commit history"
    answer: b
    feedback: "Correct! Tool-scoped autonomy limits the agent to only the minimum read-only capability needed, reducing blast radius and preventing accidental high-risk actions."
- item:
  - question: "Which GitHub-native control is most effective for requiring explicit approval before production workflows access production secrets?"
    a: "A PR template that asks for review"
    b: "A repository README policy statement"
    c: "A protected environment with required reviewers"
    d: "A label applied by the agent"
    answer: c
    feedback: "Correct! Protected environments enforce approvals and can scope secrets so they are only released after authorization."
- item:
  - question: "What is the recommended least-privilege pattern for GITHUB_TOKEN permissions in agent-driven workflows?"
    a: "Set write permissions globally so any job can push if needed"
    b: "Default to read-only and elevate permissions only for the job that performs write operations"
    c: "Disable permissions entirely and store a PAT in the repository"
    d: "Grant all permissions during business hours only"
    answer: b
    feedback: "Correct! Read-only defaults prevent unintended writes across the workflow, and job-level elevation limits high-risk capability to the smallest necessary scope."
- item:
  - question: "Which configuration helps prevent overlapping production deployments and cancels in-progress deployments when a newer run starts?"
    a: "Using larger runners"
    b: "Adding more approvals"
    c: "Concurrency with a shared group and cancel-in-progress"
    d: "Disabling workflow_dispatch"
    answer: c
    feedback: "Correct! Concurrency serializes deployments by group, and cancel-in-progress prevents overlapping deployments that can create inconsistent production state."
- item:
  - question: "What is the best GitHub-native mechanism to route required review for sensitive paths like .github/workflows/ and infra/?"
    a: "Asking reviewers in chat"
    b: "CODEOWNERS (with required reviews policy)"
    c: "Adding labels and milestones"
    d: "Squashing commits before merge"
    answer: b
    feedback: "Correct! CODEOWNERS routes review based on file paths and, when required, ensures sensitive changes cannot merge without the correct approvals."

::: end-knowledge-check
