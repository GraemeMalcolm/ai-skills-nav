---
title: Module assessment
description: Check your knowledge.
---

Test your knowledge.

::: knowledge-check type="chat" show-answers="true" allow-retry="false"

- item:
  - question: "Which tool should you use when a model needs to answer questions from your own uploaded policy documents?"
    a: "web_search"
    b: "file_search"
    c: "code_interpreter"
    answer: b
    feedback: "Correct. The file_search tool retrieves relevant passages from files in your vector store."
- item:
  - question: "In a function-calling workflow, what should your application do after the model returns a function_call item?"
    a: "Wait for the model to run the function automatically"
    b: "Run the function in your code and send a function_call_output back to the model"
    c: "Convert the function call into a web_search request"
    answer: b
    feedback: "Correct. Your app runs the function and then returns the output so the model can complete the response."
- item:
  - question: "Which statement about the code_interpreter tool is correct?"
    a: "It can run Python code in a sandboxed runtime to help solve tasks"
    b: "It can browse external websites directly during code execution"
    c: "It only supports file uploads and can't perform calculations"
    answer: a
    feedback: "Correct. code_interpreter provides a Python runtime the model can use to run code and return results."

::: end-knowledge-check
