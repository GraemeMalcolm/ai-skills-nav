---
title: Knowledge Check
description: >-
  Test your understanding of agentic AI in the SDLC, GitHub as a system of record, controls, risks, and the contributor
  model.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "Which is the best indicator that an AI system is acting as an agent in GitHub?"
    a: "It suggests code snippets in chat."
    b: "It opens a pull request from a branch it created."
    c: "It summarizes documentation."
    d: "It explains an error message."
    answer: b
    feedback: "Correct! An agent doesn't only generate suggestions-it can take goal-driven actions in the SDLC. Creating a branch and opening a pull request are concrete, durable repository actions that move work forward through standard GitHub workflows."
- item:
  - question: "Why is GitHub considered a system of record for agent workflows?"
    a: "It prevents all bugs."
    b: "It stores plans, commits, pull request discussion, and workflow evidence."
    c: "It replaces CI/CD."
    d: "It automatically approves changes."
    answer: b
    feedback: "Correct! GitHub captures the artifacts that document what the agent intended, what changed, and what evidence was produced-such as pull requests, commit history, reviews, and workflow runs. This creates an auditable record of agent activity."
- item:
  - question: "Which GitHub control is most directly used to require the right reviewers for sensitive paths?"
    a: "Issues"
    b: "CODEOWNERS"
    c: "Stars"
    d: "Forks"
    answer: b
    feedback: "Correct! CODEOWNERS maps file paths to owners and automatically requests reviews when those paths change. When combined with required reviews, it helps ensure the appropriate teams review high-risk or high-impact changes."
- item:
  - question: "Which scenario is an example of hidden reasoning?"
    a: "The plan is included in the pull request description."
    b: "The change is proposed via a pull request."
    c: "The agent provides a diff but no plan, assumptions, or execution context."
    d: "The agent reruns a failing workflow after a test fix."
    answer: c
    feedback: "Correct! Hidden reasoning occurs when reviewers can see the output but can't see the intermediate decision-making artifacts such as plans, assumptions, constraints, or context."
- item:
  - question: "Under the contributor model, what should reviewers evaluate first?"
    a: "Whether the author is human or AI."
    b: "Whether the change meets the repo's definition of done (scope, checks, review, policy)."
    c: "Whether the pull request is small."
    d: "Whether the agent is popular."
    answer: b
    feedback: "Correct! The contributor model treats agent output like any other contribution. Review starts with whether the change meets the repository's standards rather than focusing on who or what authored it."

::: end-knowledge-check
