---
title: Knowledge Check
description: Verify your knowledge of agent memory, state management, evaluation, and failure analysis.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "Which type of memory is considered the most reliable source of truth in agent workflows?"
    a: "Short-term memory stored in prompts."
    b: "Long-term memory stored in cached responses."
    c: "External memory stored in GitHub artifacts such as issues and pull requests."
    d: "Logs that are automatically deleted after execution."
    answer: c
    feedback: "Correct. External memory is durable and serves as the source of truth."
- item:
  - question: "What is the primary role of a pull request in agent workflows?"
    a: "To automatically deploy changes to production."
    b: "To act as a central place to track progress, decisions, and validation results."
    c: "To store workflow logs permanently."
    d: "To replace issues as the source of requirements."
    answer: b
    feedback: "Correct. Pull requests serve as a state anchor for agent workflows."
- item:
  - question: "What is context drift in agent workflows?"
    a: "When workflows exceed their execution time."
    b: "When the agent’s actions no longer align with the original goal or prior decisions."
    c: "When logs are deleted after retention expires."
    d: "When a branch is merged into the default branch."
    answer: b
    feedback: "Correct. Context drift occurs when alignment is lost."
- item:
  - question: "Which GitHub feature ensures validation must pass before merging changes?"
    a: "Workflow logs."
    b: "Required status checks."
    c: "Issue comments."
    d: "Commit messages."
    answer: b
    feedback: "Correct. Required checks must pass before merging."
- item:
  - question: "Which GitHub artifacts are most useful for analyzing agent failures?"
    a: "Workflow logs, workflow runs, and pull requests."
    b: "Repository stars and watchers."
    c: "Branch names only."
    d: "Issue labels."
    answer: a
    feedback: "Correct. These provide execution and decision history."
- item:
  - question: "How can agent behavior be improved after identifying a failure?"
    a: "By rerunning the workflow without changes."
    b: "By adjusting prompts, memory structure, or workflow configuration."
    c: "By deleting the pull request."
    d: "By ignoring the failure."
    answer: b
    feedback: "Correct. Improvements should target the root cause."

::: end-knowledge-check
