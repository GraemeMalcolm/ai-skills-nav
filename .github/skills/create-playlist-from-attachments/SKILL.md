---
name: create-playlist-from-attachments
description: 'Create a new AI Skills Nav playlist from module.yml and module-page Markdown files attached to chat. Use when asked to assemble a playlist, learning path, or skilling collection from attached modules or selected pages in attachment order.'
argument-hint: 'Attach module.yml files and/or module page Markdown files; optionally provide a playlist name and experience type.'
---

# Create Playlist From Attachments

Create one new playlist under `source/playlists/` from module metadata and module-page Markdown files attached to the current chat. Preserve attachment order and never modify the source modules or pages.

## Required Input

Supported attachments are:

- A `source/modules/<module-slug>/module.yml` file.
- A Markdown page listed by a multi-page `source/modules/<module-slug>/module.yml`.

At least one supported attachment is required. If there are no attachments, or none are supported, ask the user to attach at least one valid `module.yml` or module-page Markdown file before editing.

The playlist also requires:

- A playlist name, used as its title.
- An experience type, such as `Learning Path` or `Sales Skilling`.

Use values supplied in the user's request. If either is absent, ask for all missing values in one prompt before editing. Do not infer an experience type from child modules.

## Resolve Attachments

Process supported files in the exact order in which they were attached.

1. For an attached `module.yml`:
   - Confirm it is exactly `source/modules/<module-slug>/module.yml`.
   - Validate that its folder is a buildable module and use `<module-slug>` in the playlist.
2. For an attached Markdown page:
   - Load and follow `../create-hidden-page-module/SKILL.md`.
   - Create the hidden, standalone, single-page module required by that skill.
   - Add the newly created hidden module slug to the playlist at the attachment's position.
   - When processing multiple pages, complete the hidden-module creation steps for each page in attachment order. Defer the repeated `npm run build` checks and run one build after the playlist is complete.
3. If an attachment is outside `source/modules/`, is an unsupported type, cannot be resolved unambiguously, or is invalid under the hidden-page skill, ask the user to replace or clarify it before editing.
4. If multiple attachments resolve to the same module slug, include that slug once at its first position and report the duplicate attachment. Playlist module references must be unique.

## Playlist Slug

Derive the playlist folder slug from the playlist name:

1. Convert the name to lowercase ASCII.
2. Replace each run of non-alphanumeric characters with one hyphen.
3. Trim leading and trailing hyphens.
4. Use `playlist` if no characters remain.
5. If `source/playlists/<slug>/` exists, append `-2`, `-3`, and so on, using the first available slug.
6. Never overwrite, merge into, or rename an existing playlist.

Create only `source/playlists/<slug>/playlist.yml`. Do not create or copy `thumbnail.png`; the site supplies the playlist fallback image.

## Aggregate Metadata

After resolving all attachments, read every selected module's `module.yml`, including newly created hidden modules. Aggregate in playlist module order.

- `level`: Use the highest numeric child-module level. Stop and ask for correction if a level is absent or nonnumeric.
- `duration`: Parse each child duration in the repository's `<number> minutes` format and sum the values. Round the total up to a multiple of 15 using `Math.ceil(total / 15) * 15`, then write `<rounded total> minutes`. A total already divisible by 15 remains unchanged. Stop and ask for correction rather than guessing if any duration cannot be parsed.
- `role`: Take the discrete union of all non-empty child `role` values. Preserve first occurrence by module order and child list order.
- `prerequisites`: Copy only the first module's non-empty `prerequisites`, preserving their order and exact wording. Do not inherit prerequisites from later modules. Remove exact duplicates while retaining the first occurrence. If the first module has no prerequisites, use `None`.
- Module summary outcome: Select exactly one learning outcome from each module. For a module with one learning outcome, use that outcome. For a module with multiple outcomes, use its final learning outcome, following the repository convention that the final value is the module's summary outcome. Stop and ask for correction if a module has no learning outcomes.
- Cumulative outcome: Synthesize one concise playlist-wide learning outcome grounded in all selected module summary outcomes. Describe what learners can accomplish after completing the full playlist without inventing products, activities, audiences, or prerequisites.
- `learning_outcomes`: Add the selected summary outcome for each module in module order, then append the cumulative outcome as the final item. Include exactly one outcome per module plus one cumulative outcome.
- `description`: Write one concise description grounded in the selected module titles and overall outcomes. Describe what learners will learn without inventing products, activities, audiences, or prerequisites.

Discrete union means exact, case-sensitive deduplication with the first occurrence retained.

## Write Playlist Metadata

Create `source/playlists/<playlist-slug>/playlist.yml` with this field order:

```yaml
title: <playlist name>
description: <generated description>
level: <highest child level>
duration: <sum rounded up to a multiple of 15 minutes>
experience_type: <user-provided experience type>
role:
  - <discrete inherited roles>
prerequisites:
  - <prerequisites from the first module, or None>
learning_outcomes:
  - <one module summary outcome per module, in module order>
  - <one cumulative playlist-wide outcome>
modules:
  - <resolved module slugs in attachment order>
```

Quote scalar values when required for valid YAML. Do not add fields that were not requested, and do not inherit module-only values such as `hidden` or `avatar` onto the playlist.

## Validation

1. Confirm every attachment maps to the expected module position and every module slug is unique.
2. Confirm every referenced module folder and `module.yml` exists.
3. Parse the new `playlist.yml` as YAML and verify:
   - `title` and `experience_type` match the supplied values.
   - `level` equals the highest child level.
   - `duration` equals the sum of child durations rounded up to a multiple of 15 minutes.
   - Roles are the ordered discrete union of all module roles.
   - Prerequisites match only the first module's prerequisites, or `None` when it has none.
   - Learning outcomes contain exactly one summary outcome per module in module order, followed by exactly one cumulative playlist-wide outcome.
   - The learning outcome count equals the module count plus one.
   - Module order matches attachment order after duplicate removal.
4. For each page attachment, validate the hidden module exactly as required by `../create-hidden-page-module/SKILL.md`.
5. Run `npm run build` once from the repository root. Fix only errors caused by the new playlist or hidden modules; report unrelated failures without changing unrelated files.

## Completion Report

State the playlist title and slug, list its module slugs in order, identify hidden modules created from page attachments, summarize the calculated level and duration, and report the build result.
