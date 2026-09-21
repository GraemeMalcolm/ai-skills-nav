---
name: create-hidden-page-module
description: 'Create a new standalone hidden module from one existing module page attached to chat. Use when asked to extract, reuse, or place a selected Markdown page from a multi-page module into its own hidden single-page module with source attribution.'
argument-hint: 'Attach an existing module page Markdown file.'
---

# Create Hidden Page Module

Create a hidden, single-page module that reuses one page from an existing multi-page module. Keep the source page unchanged.

## Required Input

The user must attach or identify one Markdown page under `source/modules/<source-module>/`. The source module must list at least two pages. If the page is outside that directory, is not listed in its source module's `pages`, belongs to a single-page module, or cannot be identified unambiguously, ask the user to select a valid page before editing.

## Procedure

1. Locate the selected Markdown file and the `module.yml` in its containing module folder.
2. Read both files. Resolve the page title and description from its YAML frontmatter. If either value is absent, check the selected page's object entry in the source module `pages` list. Ask the user for any value that still cannot be resolved; do not silently use the source module title or description.
3. Derive a module folder slug from the selected Markdown filename:
   - Remove the `.md` extension and a leading page-order prefix such as `01-`, `2-`, or `003_`.
   - Convert the remainder to lowercase kebab-case using ASCII letters, numbers, and hyphens.
   - If the result is empty, use `included-page`.
   - Make the slug unique beneath `source/modules/`. If it already exists, append `-2`, `-3`, and so on, using the first available name.
   - Never overwrite or merge into an existing module folder.
4. Choose exactly one learning outcome:
   - Prefer the source module outcome at the selected page's zero-based position when the source follows the repository convention of one outcome per page followed by an overall outcome.
   - Otherwise, choose the existing source-module outcome most directly supported by the selected page's content.
   - If no existing outcome appropriately describes the page, write one concise, measurable outcome based on the page content.
5. Create `source/modules/<new-slug>/module.yml` with exactly this shape and field order. Preserve source values and list ordering. Quote YAML scalar values when needed for valid YAML.

   ```yaml
   title: <page title>
   description: <page description>
   level: <source module level>
   duration: 10 minutes
   hidden: true
   role:
     - <each source module role>
   avatar: <source module avatar>
   prerequisites:
     - <each source module prerequisite, or None>
   learning_outcomes:
     - <chosen or generated outcome>
   pages:
     - 01-included-page.md
   ```

   Omit the `avatar` line when the source module has no avatar. If the source module has no non-empty prerequisites list, write `- None`. Do not copy optional source-module metadata that is not shown in the template.
6. Create `source/modules/<new-slug>/01-included-page.md` with the resolved page metadata and an attributed include:

   ```markdown
   ---
   title: <page title>
   description: <page description>
   ---

   [!INCLUDE[source](../<source-module>/<source-page-filename>.md)]
   ```

   Compute the include path relative to the new page. Use forward slashes and preserve the source filename exactly. The `source` option is mandatory because it renders the note and canonical link to the original module page.
7. Validate the result:
   - Confirm the source page is still unchanged.
   - Confirm the new folder name is unique and both new files exist.
   - Confirm `module.yml` parses as YAML, contains one page and one learning outcome, and references `01-included-page.md` exactly.
   - Confirm the include resolves to the selected source page and uses `[!INCLUDE[source](...)]`.
   - Run `npm run build` from the repository root. Fix only errors caused by the new module; report unrelated failures without changing unrelated files.

## Completion Report

State the new module slug, list the two files created, identify the reused source page, and report the build result.