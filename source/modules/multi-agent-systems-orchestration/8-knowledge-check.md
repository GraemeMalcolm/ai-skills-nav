---
title: Knowledge Check
description: >-
  Test your understanding of multi-agent coordination, GitHub-native controls, workflow isolation, and deployment
  governance.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "What is the most effective coordination primitive for multi-agent work in GitHub?"
    a: "Private agent-to-agent messaging"
    b: "Pull requests and surrounding artifacts (checks, reviews, history)"
    c: "A shared spreadsheet"
    d: "A single long-running workflow without branches"
    answer: b
    feedback: "Correct! Pull requests define the boundary of change and expose the evidence needed for review, validation, and auditing."
- item:
  - question: "Which configuration helps prevent repeated overlapping workflow runs when a PR is updated frequently?"
    a: "Larger runners"
    b: "Concurrency with cancel-in-progress"
    c: "Removing required checks"
    d: "Disabling PR triggers"
    answer: b
    feedback: "Correct! Concurrency reduces workflow noise and prevents overlapping runs from creating instability."
- item:
  - question: "What is the best GitHub-native mechanism to route review for sensitive paths touched by agent pull requests?"
    a: "Asking reviewers in chat"
    b: "CODEOWNERS (with required reviews policy)"
    c: "Adding more labels"
    d: "Squashing commits"
    answer: b
    feedback: "Correct! CODEOWNERS routes review based on file paths and ensures consistent and enforceable review ownership."
- item:
  - question: "Which is an example of a coordination failure rather than an individual agent failure?"
    a: "A single unit test fails once"
    b: "Two agent pull requests repeatedly conflict because they change the same files"
    c: "A reviewer requests changes"
    d: "A workflow run finishes successfully"
    answer: b
    feedback: "Correct! Persistent pull request conflicts indicate missing isolation or coordination rules between agents."
- item:
  - question: "What is a safe pattern for high-risk actions like production deployments?"
    a: "Auto-deploy after tests pass"
    b: "Use environments with required reviewers so jobs pause for approval"
    c: "Allow direct pushes to main"
    d: "Disable workflow approvals"
    answer: b
    feedback: "Correct! Environment approvals separate preparation from authorization, ensuring high-risk actions require explicit review."

::: end-knowledge-check
