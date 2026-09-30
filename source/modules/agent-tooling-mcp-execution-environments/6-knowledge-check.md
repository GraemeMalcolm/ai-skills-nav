---
title: Module assessment
description: Verify your knowledge of tool selection, MCP, and safe agent execution.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "Where do agents execute tasks when working with GitHub repositories?"
    a: "Directly on the developer's local machine."
    b: "Within workflows powered by GitHub Actions."
    c: "Inside the GitHub web interface without workflows."
    d: "On external servers without using GitHub workflows."
    answer: b
    feedback: "Correct! Agent tasks are executed through workflows."
- item:
  - question: "How are agent-generated code changes isolated before review?"
    a: "By committing directly to the default branch."
    b: "By creating and working within a separate branch."
    c: "By storing changes in a temporary external system."
    d: "By applying changes only after deployment."
    answer: b
    feedback: "Correct! Changes are isolated on a branch before review."
- item:
  - question: "What determines what an agent can do during workflow execution?"
    a: "The number of contributors in the repository."
    b: "Workflow permissions and the GITHUB_TOKEN scope."
    c: "The size of the repository."
    d: "The number of workflow runs completed."
    answer: b
    feedback: "Correct! Permissions define allowed actions."
- item:
  - question: "What is the purpose of a pull request in agent workflows?"
    a: "To automatically merge agent changes into the default branch."
    b: "To provide a place to review and validate changes before merging."
    c: "To bypass workflow execution."
    d: "To execute code changes immediately without checks."
    answer: b
    feedback: "Correct! Pull requests enable review and validation."
- item:
  - question: "How can workflows be triggered after an agent updates code?"
    a: "Only manually by a repository administrator."
    b: "Through events such as push or pull request."
    c: "Only when a repository is forked."
    d: "Only when code is downloaded locally."
    answer: b
    feedback: "Correct! Events trigger workflow runs."
- item:
  - question: "What is the role of an MCP server?"
    a: "To replace GitHub workflows."
    b: "To expose tools and services that agents can use."
    c: "To store repository code."
    d: "To execute workflows instead of GitHub Actions."
    answer: b
    feedback: "Correct! MCP servers provide access to tools."
- item:
  - question: "What controls which MCP servers an agent can use?"
    a: "Repository size limits."
    b: "Registries and allow lists."
    c: "Workflow execution time limits."
    d: "The number of commits in the repository."
    answer: b
    feedback: "Correct! Registries provide discovery and allow lists enforce usage."
- item:
  - question: "Why are environment protections used in GitHub workflows?"
    a: "To increase workflow execution speed."
    b: "To require approvals and protect sensitive operations."
    c: "To automatically merge pull requests."
    d: "To disable workflows on certain branches."
    answer: b
    feedback: "Correct! Environments enforce approvals and access control."
- item:
  - question: "What is the effect of using least-privilege permissions in workflows?"
    a: "It gives agents full access to all resources."
    b: "It limits actions to only what is required."
    c: "It prevents workflows from running."
    d: "It automatically approves pull requests."
    answer: b
    feedback: "Correct! Permissions are restricted to necessary actions."
- item:
  - question: "How are agent actions kept visible and reviewable?"
    a: "By hiding logs and restricting access."
    b: "Through workflow logs and pull request review."
    c: "By executing actions outside GitHub."
    d: "By skipping validation steps."
    answer: b
    feedback: "Correct! Logs and PRs provide visibility."

::: end-knowledge-check
