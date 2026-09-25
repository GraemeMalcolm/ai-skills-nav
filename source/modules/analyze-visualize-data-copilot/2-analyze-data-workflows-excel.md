---
title: Analyze data workflows in Excel  with Copilot
description: Analyze data workflows in Excel using Microsoft Copilot.
---

As a business professional at a growing retail organization, you receive a dataset with quarterly sales figures and product performance. Your manager asks you to analyze the data, identify trends, and create charts for a leadership presentation—all under a tight deadline. You're juggling spreadsheets and deliverables, but you have a powerful assistant at your side: Copilot in Excel.

In this unit, you'll explore how to use Copilot in Excel to analyze data, analyze text columns for themes and sentiments, and generate charts. Along the way, you'll learn how to guide Copilot with effective prompts and choose the right tools to streamline your workflow.

> **IMPORTANT**: Copilot in Excel can only work with files that are saved on OneDrive. Additionally, your data must be formatted as a table or a supported range for Copilot to read. You don't need to select specific data before prompting—Copilot uses the context of your prompt to identify the right table or range, including tables on other sheets.

## Getting started with Copilot in Excel

To open the Copilot pane, select the **Copilot** icon. The pane opens on the right side of your workbook.

> **NOTE**: Inside the Copilot pane, you may notice a **...** menu that includes an **All Agents** option. Selecting this opens a different experience — Microsoft Copilot Chat embedded inside Excel — with a Work/Web toggle, different model options, and a general chat interface. This is a separate surface from the native Copilot in Excel pane. The capabilities covered in this unit are all within the **native Copilot in Excel pane** (the one that shows "Let's edit your workbook" and the **Allow editing** mode selector), not the embedded Copilot Chat experience.

### Model selector

At the top of the pane, a **model selector** (set to **Auto** by default) lets you choose which AI model powers your Copilot responses:

| Setting | What it does |
|---|---|
| **Auto** | Automatically selects the best model for your request. Recommended for most tasks. |
| **GPT** | Routes your request to a GPT model. Expand to choose a specific version. |
| **Claude** | Routes your request to a Claude model. Expand to choose a specific version. |

For most data tasks, leave this set to **Auto** and let Copilot pick the best model for you.

### Mode selector

Near the bottom of the pane, a **mode selector** controls how Copilot interacts with your workbook:

| Mode | What it does |
|---|---|
| **Allow editing** | Copilot edits your workbook directly — adding sheets, inserting charts, creating formulas, and formatting data. This is the default and is used throughout this unit. |
| **Plan** | Copilot proposes a plan before making any changes so you can review first. |
| **Chat only** | Copilot responds in the chat pane only, without touching your workbook. Use this for quick questions or explanations. |

With **Allow editing** active, results like summaries, formulas, and charts are applied to your workbook automatically — ideal for multi-step tasks like building templates, restructuring a workbook, or creating a dashboard. For example:

- **Build an expense tracking template with formulas for monthly totals and variance.**
- **Add a summary sheet that pulls totals from the Sales and Expenses sheets.**
- **Create a dashboard with a chart for each product category.**

### The + menu

In the prompt box at the bottom of the pane, selecting **+** opens a menu with additional options, including uploading images and files, choosing skills, changing data sources, and creating workbook rules. The most useful of these for data analysis tasks is **Upload images and files**, which lets you attach a file directly to your prompt when you want Copilot to analyze or reference it.

## Find trends in your data

Copilot can scan your data and surface patterns, comparisons, and outliers — all from a single conversational prompt. You describe what you want to understand, and Copilot returns the analysis directly in your workbook. With **Allow editing** active, results like summary tables and charts are added to a new sheet automatically.

The more context and specificity in your prompt, the more targeted the result. Including why you need the information and what format you want helps Copilot tailor the output.

> **TIP**: Before analyzing data, you need it in your workbook. If you don't have a file yet, you can ask Copilot to search the web and import data directly — for example: **Search the web for a table of regions and their exchange rates** or **Get sales benchmarks for the retail industry**. Copilot finds the data and lets you insert it into a new sheet.

For example:

- **I'm preparing a leadership review. Summarize total revenue by region from this table and highlight the top-performing region.**
- **Compare units sold between Q1 and Q2 for each product and show the result as a summary table.**

Copilot returns whatever output you requested — a summary, a table, a chart — and places it in your workbook. You can follow up to dig deeper or adjust the format.

## Analyze text columns

Not all insights come from numbers. Customer feedback, survey responses, and product reviews often contain valuable information that's difficult to process manually at scale. Copilot can read a text column, identify recurring themes and sentiment, and insert a new labeled column with its findings — no formulas or manual tagging required.

You describe what you want to know about the text, and Copilot does the reading. For example:

- **Review the CustomerFeedback column and identify the major recurring themes. List the top five themes with a brief description of each.**
- **Analyze the CustomerFeedback column and label each row by sentiment — positive, neutral, or negative. Add the labels in a new column.**

Once Copilot adds a labeled column, you can follow up to summarize or aggregate the results:

- **Group the labeled rows by sentiment and show me a count for each category.**
- **Summarize the most common complaints from the negative feedback rows in three bullet points for a leadership review.**

## Generate charts and visualize data

Copilot can create charts from your data without you needing to select a range, configure axes, or choose a chart type. Describe what you want to visualize, include context about your audience or purpose, and Copilot builds the chart and adds it to your workbook. You can then refine it through follow-up prompts in the same conversation.

For example:

- **Create a bar chart showing total revenue by region, sorted from highest to lowest. I need this for a leadership presentation.**
- **Generate a line chart showing quarterly sales trends by product so I can spot which products are growing or declining.**

Once the chart is in your workbook, follow up to refine it:

- **Add axis labels and a title that says 'Q1–Q2 Revenue by Region'.**
- **Highlight the top three regions in a different color.**
- **Change the chart type to a column chart.**

## Create formulas in natural language

Writing formulas from scratch can be time-consuming, especially in complex or inherited spreadsheets. Copilot lets you describe the calculation you need in plain language and generates the formula for you — then applies it to the right rows automatically when **Allow editing** is on. You can also paste an existing formula into the Copilot pane and ask it to explain what the formula does.

For example:

- **I need to show the average revenue per unit sold. Calculate this for each row using the Revenue and UnitsSold columns and add the result in a new column called AvgRevenuePerUnit.**
- **Add a column that calculates the percentage change in revenue between Q1 and Q2 for each product.**
