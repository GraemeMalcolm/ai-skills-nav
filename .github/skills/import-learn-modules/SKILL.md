---
name: import-learn-modules
description: 'Import every Microsoft Learn module staged under temp into AI Skills Nav. Use when asked to import, refresh, or convert Learn module YAML, unit pages, quizzes, pivots, labs, simulations, PDFs, or includes with scripts/import-learn-modules.mjs.'
argument-hint: 'Stage Learn module folders under temp, then run this skill.'
---

# Import Microsoft Learn Modules

Import all immediate module folders under `temp/` into `source/modules/`. The importer replaces an existing output module with the same folder name, so review the worktree before running it.

## Source Contract

Each `temp/<module-slug>/` must contain:

- `index.yml` with `YamlMime:Module` data and an ordered `units` list.
- One `.yml` file per unit, with a `uid` matching an entry in `units`.
- Any locally included Markdown beneath the same module folder.
- An optional `media/` directory.

The importer converts module metadata to `module.yml`, unit metadata to page front matter, quiz YAML to a `::: knowledge-check` block, and local Learn includes to self-contained page Markdown.

## Supported Content Tags

Preserve or author these tags in unit content or included Markdown:

- Choice pivots: `::: zone pivot="Video"` through `::: zone-end`. Learn `video` and `text` values are normalized to `Video` and `Text`.
- Includes: `[!INCLUDE[](<relative-path>)]`. Local includes are recursively expanded during import.
- Lab instructions: `[!LAB_STEPS[](<fully-qualified-http-url>)]`.
- Hosted labs: `[!LAB_HOST[](<launch-url>)]`.
- Simulations: `[!SIMULATION[](<fully-qualified-http-url>)]`.
- PDFs: `[!PDF[](<path-or-url>)]`.
- Videos: `[!VIDEO <fully-qualified-http-url>]`.
- Quizzes: source `quiz.questions` is converted to `::: knowledge-check type="chat" ...` syntax.

Directive names are normalized to uppercase because those names are the canonical AI Skills Nav authoring syntax. Do not replace a lab, simulation, PDF, or quiz with a plain Markdown link; the build uses these tags to render the experience and derive catalog modalities.

Known Learn exercise launch-button links are converted to `[!LAB_STEPS]` directives that reference the corresponding raw exercise Markdown in the appropriate MicrosoftLearning repository. Keep only the introductory prose and the directive: remove the screenshot image, the “Use the following button” instruction, the launch button image, and its `go.microsoft.com` link from generated pages.

## Procedure

1. Run `git status --short` and note pre-existing changes. Never discard them.
2. Inspect every immediate directory under `temp/`. Stop with an actionable error if `index.yml`, a referenced unit, or a local include is missing.
3. Run `node scripts/import-learn-modules.mjs` from the repository root. This imports every module under `temp/`, not a selected subset. Set `IMPORT_MODULE_AVATAR` for batches that require an avatar other than the default `anton`.
4. Review the generated `source/modules/<module-slug>/module.yml` files and page front matter. Confirm titles, descriptions, levels, durations, roles, topics, prerequisites, outcomes, and page order came from the appropriate module or unit scope.
5. Search the generated pages for `::: zone`, `[!INCLUDE`, `[!LAB_STEPS`, `[!LAB_HOST`, `[!SIMULATION`, `[!PDF`, `[!VIDEO`, and `::: knowledge-check`. Confirm each source experience retained the corresponding canonical tag.
6. Run `npm run build`. Fix importer or imported-content errors caused by the conversion, then rerun the import and build.
7. Report the number and slugs of imported modules, the build result, and any source metadata that could not be represented without assumptions.

## Guardrails

- Import only immediate child directories of `temp/`.
- Preserve module unit order from `index.yml`; do not infer order from filenames.
- Keep page-level title and description in Markdown front matter. Keep module-level discovery metadata in `module.yml`.
- Keep media paths relative to each generated page and copy the module `media/` directory recursively.
- Do not create or copy `thumbnail.png`; imported modules use the site's default `Training module` thumbnail fallback.
- Reject missing correct quiz answers, recursive or escaping local includes, and unresolved unit UIDs.
- Do not edit playlists or courses automatically; imported modules remain independently addressable until explicitly curated.