---
title: Knowledge Check
description: Test your understanding of agent architecture, governance controls, and SDLC integration in GitHub.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What is the most reliable way to prevent planless execution from being merged?"
    a: "Ask the agent to be careful."
    b: "Require a plan template only."
    c: "Make a plan check a required status check and require pull request reviews."
    d: "Allow direct pushes but require tests."
    answer: c
    feedback: "Correct! Templates encourage good behavior, but required checks and required reviews enforce it. This converts plan required into a guaranteed merge condition."
- item:
  - question: "Which GitHub feature most directly routes reviews based on changed file paths?"
    a: "Issues"
    b: "CODEOWNERS"
    c: "Actions artifacts"
    d: "Releases"
    answer: b
    feedback: "Correct! CODEOWNERS maps paths to owners so the right experts are automatically requested for review and can be enforced with required review policies."
- item:
  - question: "In a plan-act-evaluate architecture, where should evaluation evidence primarily live?"
    a: "Only inside the agent's private logs"
    b: "In PR comments only"
    c: "In GitHub-native artifacts like workflow runs, checks, and uploaded artifacts"
    d: "In a separate external document"
    answer: c
    feedback: "Correct! Workflow runs, checks, and artifacts are durable, reviewable, and auditable. They provide objective evidence independent of the agent."
- item:
  - question: "Which design best expresses risk-based autonomy for production deployments?"
    a: "Let the agent deploy after tests pass"
    b: "Use GitHub Environments with required reviewers for production"
    c: "Allow direct pushes to main"
    d: "Disable workflow approvals"
    answer: b
    feedback: "Correct! Environments create a human approval gate for high-risk execution and can restrict access to protected secrets and deployments."
- item:
  - question: "Which is an architectural anti-pattern in agent design?"
    a: "Clear success criteria"
    b: "Required checks"
    c: "Mixed planning and execution with no inspectable plan"
    d: "Uploading artifacts"
    answer: c
    feedback: "Correct! Without an inspectable plan, reviewers can't validate intent or scope. This increases hidden reasoning and reduces reliability."

::: end-knowledge-check
