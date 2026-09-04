# AI Skills Nav implementation specification

## 1. Purpose

AI Skills Nav is a content-driven learning site for discovering and consuming Microsoft skilling content. This specification describes the implemented product closely enough for a coding agent to recreate it from the repository's Markdown, YAML, JSON, image, and audio assets.

The application MUST:

- Generate a complete static site at build time.
- Run on GitHub Pages without an application server, database, authentication system, or client-side framework.
- Present courses, curated playlists, modules, and module pages.
- Support search, metadata filters, responsive navigation, personal playlists, custom Markdown extensions, and content-specific learning assistants.
- Use relative internal URLs so deployment beneath a repository subpath works.
- Remain usable without a generative AI model.

The current content set produces 5 courses, 9 curated playlists, 24 modules, 4 avatars, and 225 HTML files.

## 2. Technology and repository layout

The reference implementation uses:

- Node.js 22 for generation.
- ECMAScript modules.
- `js-yaml` for YAML parsing.
- `marked` with GitHub Flavored Markdown enabled.
- Plain generated HTML, one global CSS file, and one global browser JavaScript file.
- Browser `localStorage`, Fetch, HTML audio playback, Web Speech, and native `<dialog>` APIs where required.

Required source locations:

```text
source/
  courses/<course-slug>/
    course.yml
    thumbnail.png
  playlists/<playlist-slug>/
    playlist.yml
    thumbnail.png
  modules/<module-slug>/
    module.yml
    thumbnail.png
    <page>.md
    media/...
MicrosoftLearning/
  <reusable Markdown and media>
avatars/<avatar-slug>/
  avatar.yml
  avatar.png
  knowledge.json
  audio/...
site/
  app.js
  styles.css
  moderation.txt
  media/playlist.png
scripts/
  build.mjs
```

A content folder's name is its canonical slug. Slugs are not declared separately in metadata.

## 3. Content model

The content hierarchy is:

```text
Course -> ordered curated playlists -> ordered modules -> ordered pages
```

Modules are independently addressable and MAY appear in multiple playlists. A module associated with a playlist MUST be rendered within that playlist's route as well as at its standalone route.

### 3.1 Course schema

Each course folder MUST contain `course.yml` and `thumbnail.png`.

```yaml
title: Course title
course_number: XX-0000
credentials:
  - Optional credential name
description: Course description
level: 200
duration: 1 day
series: Microsoft Official Curriculum
topics:
  - Topic
audience:
  - Audience
avatar: optional-avatar-slug
playlists:
  - playlist-slug
```

Rules:

- `title`, `course_number`, `description`, `level`, `duration`, `series`, `topics`, `audience`, and `playlists` SHOULD be present.
- `course_number` MUST be present.
- `playlists` MUST be a non-empty array of existing playlist slugs.
- `avatar` is optional. When supplied, it MUST identify an existing avatar.
- `credentials` is an optional array of credential names. The detail page MUST list every credential in metadata order, or show “No associated credential is specified.” when omitted or empty.
- Playlist order MUST follow the YAML array.

### 3.2 Curated playlist schema

Each playlist folder MUST contain `playlist.yml` and `thumbnail.png`.

```yaml
title: Playlist title
description: Playlist description
level: 200
duration: 120 minutes
series: Microsoft Official Curriculum
topics:
  - Topic
audience:
  - Audience
avatar: optional-avatar-slug
modules:
  - module-slug
```

Rules:

- `title`, `description`, `level`, `duration`, `series`, `topics`, `audience`, and `modules` SHOULD be present.
- `modules` MUST be an array of existing module slugs.
- `avatar` is optional. When supplied, it MUST identify an existing avatar.
- Module order MUST follow the YAML array.

### 3.3 Module schema

Each module folder MUST contain `module.yml`, `thumbnail.png`, and at least one Markdown page.

```yaml
title: Module title
description: Module description
modality: Multimodal
level: 200
duration: 40 minutes
series: Microsoft Official Curriculum
topics:
  - Topic
audience:
  - Audience
avatar: optional-avatar-slug
pages:
  - 01-introduction.md
  - file: 02-topic.md
    title: Optional navigation-title override
    description: Optional description
```

Rules:

- `title`, `description`, `modality`, `level`, `duration`, `series`, `topics`, `audience`, and `pages` SHOULD be present.
- `pages` MUST be a non-empty array.
- A page entry MAY be a relative filename or an object containing `file`, optional `title`, and optional `description`.
- Every page file MUST exist inside the module folder.
- Page order MUST follow the YAML array.
- `avatar` is optional. When supplied, it MUST identify an existing avatar.
- Modality and audience values are content-defined, not hard-coded enums. Current modalities are `Lab`, `Multimodal`, and `Video`.

### 3.4 Page front matter

A Markdown page MAY begin at its first character with YAML front matter:

```markdown
---
title: Page title
---
```

The rendered page title MUST use the first available value from:

1. Front-matter `title`.
2. Front-matter `lab.title`.
3. The page filename without its extension.

For a page-navigation label, an object entry's `title` override takes precedence over front matter. Other front-matter properties MAY be retained for future use but do not affect current rendering.

### 3.5 Avatar schema

Each referenced avatar folder MUST contain:

```yaml
name: Avatar name
instructions: Reserved text; not used by the current assistant
welcome-message: Initial assistant message
suggested-prompts:
  - Suggested question
```

The following assets are mandatory for every referenced avatar:

```text
avatar.png
knowledge.json
audio/looking.wav
audio/no_results.wav
audio/search_results.wav
audio/sorry.wav
audio/response_1.wav ... audio/response_7.wav
```

`name`, `welcome-message`, and at least one suggested prompt MUST be present. `instructions` is reserved metadata and MUST NOT imply that an AI model is used.

### 3.6 Avatar knowledge schema

`knowledge.json` MUST have an array root:

```json
[
  {
    "category": "Category name",
    "link": "https://example.com/learn-more",
    "documents": [
      {
        "id": 1,
        "title": "Document title",
        "keywords": ["keyword", "two word phrase"],
        "content": "Deterministic answer text.",
        "video_url": "https://example.com/optional-video"
      }
    ]
  }
]
```

`video_url` is optional. Category links and document video links are returned with matching answers.

## 4. Build process

Running `npm run build` MUST perform these steps:

1. Delete and recreate `dist`.
2. Discover immediate child directories in the course, playlist, module, and avatar roots.
3. Parse collection metadata.
4. Resolve and validate content/avatar, playlist/module, and course/playlist relationships.
5. Sort courses, playlists, and modules alphabetically by title for catalog display.
6. Copy source collections, `MicrosoftLearning`, and avatars to `dist/content`.
7. Generate all HTML routes.
8. Copy global CSS, JavaScript, moderation data, and the personal-playlist image to `dist/assets`.
9. Write an empty `dist/.nojekyll` file.
10. Exit non-zero with an actionable error when required content is invalid.

The build MUST fail for:

- A discovered content folder with no expected metadata file.
- Metadata or front matter that cannot be parsed as structured YAML.
- A module with no pages, a page entry with no file, or a missing page.
- An include that is missing, recursive, or outside the repository.
- An unclosed zone pivot.
- An unknown avatar, module, or playlist reference.
- Missing required avatar values, image, knowledge file, or audio file.
- Avatar knowledge with a non-array root or a category without a document array.
- A course with no course number or no playlists.

The implementation SHOULD also validate thumbnail existence, field types, array item types, unique page route slugs, and duplicate references, even though the original implementation does not fully validate those cases.

## 5. Generated routes

The output route contract is:

| Experience | Output route |
| --- | --- |
| Home | `/index.html` |
| Course catalog | `/courses/index.html` |
| Course detail | `/courses/<course-slug>/index.html` |
| Curated playlist catalog | `/playlists/index.html` |
| Curated playlist detail | `/playlists/<playlist-slug>/index.html` |
| Module catalog | `/skilling-content/index.html` |
| Personal playlists | `/my-playlists/index.html` |
| Standalone module | `/modules/<module-slug>/index.html` |
| Standalone module page | `/modules/<module-slug>/pages/<page-slug>/index.html` |
| Playlist module | `/playlists/<playlist-slug>/modules/<module-slug>/index.html` |
| Playlist module page | `/playlists/<playlist-slug>/modules/<module-slug>/pages/<page-slug>/index.html` |
| Global assets | `/assets/...` |
| Published source/assets | `/content/...` |

`page-slug` is the page filename without its extension.

Every route MUST use relative links to global assets, content assets, and other generated routes. Every document MUST include UTF-8 metadata, a responsive viewport, English language declaration, page title in the form `<title> | AI Skills Nav`, global CSS, deferred global JavaScript, a skip link, site header, breadcrumbs, and a main landmark.

### 5.1 Module route behavior

A module with one page MUST render that page directly at the module index and MUST NOT require an intermediate overview or `/pages/...` route.

A module with multiple pages MUST generate:

- An index overview with thumbnail, description, metadata, and ordered page list.
- One route per page.
- **Previous** and **Next** links.

The module overview is the first navigation step for a multi-page module. Within a module, **Previous** and **Next** MUST navigate between the overview and content pages in order. Course, playlist, and module overviews MUST use **Next** instead of a separate **Start** action.

In a playlist, the first-step **Previous** link MUST open the previous module's last content page, and the last-step **Next** link MUST open the next module's first step. When no adjacent module exists, navigation MUST use the playlist overview when it precedes the first module. A **Previous** or **Next** control with no logical destination MUST be omitted.

In a course, the same behavior MUST cross playlist boundaries. The last step in a playlist MUST continue to the next playlist's effective start, and the first step in a playlist overview MUST return to the previous playlist's last content page. A one-module playlist has no overview in this sequence.

The same rules apply to standalone and playlist-contained module routes.

### 5.2 Playlist navigation behavior

A playlist with one module MUST link directly to that module from catalog and course entry points. Its navigation MUST omit the playlist overview and promote the module and any applicable page links.

A playlist with multiple modules MUST include its overview page in navigation before its modules.

The module route rules in section 5.1 continue to apply, so a one-module playlist whose module has one page resolves directly to that page at the module index.

## 6. Shared visual shell

The UI SHOULD reproduce the reference design intent:

- Warm paper-colored background and white content surfaces.
- Dark neutral text, violet primary actions, and cyan/orange accents.
- DM Sans body text and Manrope headings, with sans-serif fallbacks.
- Sticky header, restrained borders, compact radii, soft shadows, and generous section spacing.
- Image-led 16:9 catalog cards.
- Large asymmetric home hero.
- Two-column detail overviews on wide screens.
- Sticky playlist navigation on wide screens.
- Fixed lower-right assistant launcher and flyout.

Exact pixel values, icon paths, shadows, and gradients are non-normative unless visual parity is required.

## 7. Page experiences

### 7.1 Home

The home page MUST include:

- A branded hero with the heading “Skilling in the Name of...”.
- A course section containing the first four alphabetically sorted courses.
- A curated playlist section containing the first four alphabetically sorted playlists.
- A skilling-content section containing the first eight alphabetically sorted modules.
- Links to all three catalogs and personal playlists.
- A search form covering the complete course, playlist, and module catalogs. Non-featured cards MUST be present but hidden until a search is active, then matching cards MAY be revealed.
- A single catalog filter control beside the search form. Its dialog MUST include audience, series, level, and modality choices generated from metadata across all three catalogs.
- The default-avatar learning assistant described in section 10.

When filters are active, each Home section MUST show the first matching items in catalog order, up to its normal four-course, four-playlist, or eight-module limit. This backfills filtered featured items with later matching items when available. An active search MAY reveal all matching items. Clearing Home search MUST restore the filtered featured subsets. The “New and popular” module label does not indicate ranking; initial selection is alphabetical.

### 7.2 Catalogs

Each catalog MUST show an introduction, search form, filter link, card grid, and accessible empty state. Catalog pages MUST NOT duplicate the Home filter dialog. Their filter link MUST show the number of currently applied filter values when nonzero and navigate to the Home filter dialog.

Cards MUST include:

- Thumbnail.
- Title.
- Available metadata summary.
- Description tooltip when a description exists.
- Link to the item's detail route.
- For module cards, an overlaid add icon that appears on hover or keyboard focus and opens the same personal-playlist dialog available inside a module. The icon MUST remain visible on devices without hover support.

Search text MUST concatenate title, course number when present, description, and topics. Search MUST:

1. Run on form submission.
2. Trim and lowercase input.
3. Replace punctuation other than `+`, `#`, `.`, and `-` with spaces so technology names retain meaningful punctuation.
4. Split input on whitespace and remove the shared conversational stop words defined below. The vocabulary covers common English function words, pronouns, auxiliaries, contraction fragments, and generic request words. Domain-bearing actions such as `develop`, `build`, `create`, and `implement` remain searchable.

```text
a about above after again against all also am an and any are as at be because been before being below
between both but by can could course courses d describe did do does doing down during each explain few find
for from further get getting give had has have having he help her here hers herself him himself his how i if
in information into is it its itself just know learn learning ll look looking m me more most my myself need no
nor not now of off on once only or other our ours ourselves out over own please re s same search she should show
so some such t tell than that the their theirs them themselves then there these they this those through to too
under until up use using ve very want was we were what when where which while who whom why will with would you
your yours yourself yourselves
```

1. Require every remaining term to occur as a substring of the card's search text.
2. Treat an expression containing only stop words as having no search constraint while retaining the clear action for the non-empty input.
3. Compose with currently applied filters.
4. Provide a clear action that resets results and focuses the input.

The Home filter choices MUST be generated from unique values in current metadata and sorted with locale-aware numeric ordering. Applied filters MUST persist in local storage and remain active on the Home, Courses, Playlists, and Modules pages.

Required filter fields:

- All content: audience, series, level, and modality.

A module's modality values come directly from its metadata. A curated playlist MUST inherit the sorted, unique union of modalities declared by its modules. A course MUST inherit the sorted, unique union of modalities from all modules in its playlists. Modality filtering MUST apply to courses and playlists using these inherited values.

Multiple selections in one field use OR semantics. Different fields, and search plus filters, use AND semantics. Filters are applied when the filter dialog is submitted. Cancelling or closing MUST discard unsubmitted checkbox changes. **Clear all** MUST clear and immediately apply filters. Search state is page-local and is not persisted.

### 7.3 Course detail

A course detail MUST show its thumbnail, title, description, course number, level, duration, credential information, and ordered links to its self-paced playlists.

### 7.4 Curated playlist detail

A curated playlist detail MUST show its thumbnail, title, description, metadata, and a navigation sidebar. The sidebar MUST link to the playlist overview when the playlist contains multiple modules and list modules in metadata order. The current item MUST be visibly identified.

### 7.5 Breadcrumbs and responsive navigation

Breadcrumbs MUST represent the generated hierarchy and identify the current page with `aria-current="page"`.

Above 860 px, a playlist sidebar MUST be sticky and collapsible. At or below 860 px, it MUST become an off-canvas drawer with a reveal control, close control, scrim, and body-scroll lock. At or below 600 px, search, catalog headers, filters, page controls, and assistant layout MUST reflow for narrow screens. All experiences MUST remain usable at 320 px viewport width.

## 8. Personal playlists

Personal playlists are browser-local collections and do not require authentication or a backend.

### 8.1 Persistence

Use the local-storage key:

```text
ai-skills-nav:personal-playlists
```

Store an array with this shape:

```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "modules": [
      {
        "name": "Module title",
        "path": "modules/<module-slug>/index.html"
      }
    ]
  }
]
```

On read, invalid JSON or a non-array root MUST become an empty collection. Records without string `id` and `name` MUST be discarded. Invalid descriptions MUST become empty strings. Invalid module entries MUST be discarded. Storage failures MUST display an inline error without crashing the page.

### 8.2 Operations

Users MUST be able to:

- Create a playlist with a required name and optional description.
- Add a module from any standalone module overview or page.
- Add to an existing playlist or create one within the add dialog.
- Open a personal playlist overview.
- Start a non-empty playlist from a **Start** button below its thumbnail. The button MUST open the first module in the current stored order and preserve personal-playlist context.
- Navigate its modules with playlist context preserved.
- Reorder modules with **Move up** and **Move down** controls. Changes MUST be saved immediately and reflected in the overview, sidebar, and subsequent module navigation.
- Remove individual modules from a playlist without deleting the underlying module. Changes MUST be saved immediately and reflected in playlist navigation.
- View a small 16:9 module thumbnail beside each module in the personal-playlist management list.
- Delete an entire playlist after confirmation.

Names MUST be trimmed, non-empty, and unique case-insensitively. Adding an existing module path MUST not create a duplicate. IDs SHOULD use `crypto.randomUUID()` with a timestamp/random fallback.

The app does not support renaming playlists, editing descriptions, reordering playlists, synchronization, or account storage.

### 8.3 URL and navigation context

A selected personal playlist MUST use:

```text
?playlist=<playlist-id>
```

When a valid personal-playlist module is opened, browser JavaScript MUST dynamically add a sidebar using the stored module order and module page links, propagate the query parameter through navigation links, and connect the outer **Previous** and **Next** links to adjacent modules. A missing, stale, or invalid playlist ID MUST fall back to ordinary standalone module browsing.

When a personal playlist opens, module names MUST be refreshed from the generated module catalog and stale module paths MUST be removed from storage.

## 9. Markdown rendering

The renderer MUST support GitHub Flavored Markdown and the extensions below.

### 9.1 Asset rewriting

Relative URLs in Markdown images and raw HTML `<img src>` attributes MUST be rewritten for the generated page. Resolution MUST first test the path relative to the source Markdown file, then a `media` child folder when the first path does not exist.

Assets beneath `source` MUST map beneath `dist/content` without the `source` path segment. Other repository content roots MUST retain their repository-relative root beneath `dist/content`.

External URLs, anchors, and protocol-relative URLs MUST not be rewritten. Ordinary Markdown links and CSS URLs are not rewritten by the current implementation.

### 9.2 Includes

Support both forms:

```markdown
[!INCLUDE relative/path.md]
[!INCLUDE[](relative/path.md)]
```

A leading slash denotes a repository-root-relative include. Includes MUST:

- Resolve relative to the containing source file.
- Expand recursively.
- Remove included front matter.
- Rewrite included images relative to the included file.
- Reject missing files, paths outside the repository, and recursive inclusion.

### 9.3 Videos

A directive occupying its own line MUST render as a responsive, lazy-loaded iframe with fullscreen enabled:

```markdown
[!VIDEO: https://example.com/video]
```

The colon is optional. `youtu.be` and YouTube watch URLs MUST be converted to `https://www.youtube-nocookie.com/embed/<video-id>`. Other HTTP(S) URLs MUST be embedded unchanged.

### 9.4 Zone pivots

Consecutive strict blocks MUST render as one accessible tab interface:

```markdown
::: zone pivot="Option one"

Content one

::: zone-end

::: zone pivot="Option two"

Content two

::: zone-end
```

Unzoned content ends a pivot group. Indented and nested zones are not required. An unclosed zone MUST fail the build.

Tabs MUST support click, Left Arrow, Right Arrow, Home, and End. They MUST update `aria-selected`, `tabindex`, and panel visibility.

Store preferences under:

```text
ai-skills-nav:pivots:<module-slug>
```

The value is an object mapping a sorted, normalized tab-label signature to the normalized selected label. Matching pivot groups in the same module MUST reuse the selection. Storage unavailability MUST not prevent pivot use.

### 9.5 New-window links

A Markdown link followed by either `{target="_blank"}` or `{:target="_blank"}` MUST render with `target="_blank"` and `rel="noopener noreferrer"`. Linked images MUST also be supported.

### 9.6 HTML and unsupported syntax

Raw HTML is passed through by the current Markdown renderer and is not sanitized; content MUST therefore be trusted. Microsoft Learn `:::image` directives are not implemented in the current app and render as literal content. A new implementation SHOULD either preserve this behavior for exact parity or implement/reject the directive explicitly.

## 10. Learning assistant

A course or curated playlist declaring `avatar` MUST display a fixed **Ask <name>** launcher and chat flyout on its detail home page. A module declaring `avatar` MUST display the same launcher and flyout on its overview and content pages. Individual course, curated-playlist, and module pages without an `avatar` value MUST remain avatarless. The course, curated-playlist, personal-playlist, and module catalog pages MUST display the avatar with the `default` slug. The flyout MUST contain the avatar image, assistant name, welcome message, suggested-prompt buttons, message log, text field, optional microphone control, send action, and close action.

The home page MUST display the avatar with the `default` slug. The default avatar MUST not require audio assets. When local knowledge has no keyword match, this assistant MUST apply the site search normalization and AND matching semantics to generated course, curated-playlist, and module cards available on the current page. It MUST list matching content titles with links without changing tile visibility or a catalog search form. If no content matches, it MUST respond exactly: “I'm sorry. I can't help with that. Try rewording your question.” The default assistant MUST NOT call Microsoft Learn MCP or offer external search fallbacks.

The assistant MUST be deterministic retrieval logic. It MUST NOT call a generative model, claim multi-turn understanding, or use the reserved avatar `instructions` as a model prompt.

### 10.1 Message behavior

- Add the welcome message when the page initializes.
- Label messages with the avatar's name or “You”.
- Enforce a 1,000-character prompt maximum before processing.
- Disable input controls during asynchronous processing and always restore them afterward.
- Type assistant text progressively at approximately 250 characters per second unless reduced motion is requested.
- Deduplicate returned links by exact URL.
- Open video result links in a centered, resizable 16:9 popup when popups are allowed; otherwise use normal link navigation.
- Do not persist chat history or carry context between prompts.

### 10.2 Moderation

Before search or retrieval, fetch `assets/moderation.txt` without cache. It contains one obfuscated term per line. Decode each line by reversing it and adding one to each character code, then create a case-insensitive whole-word regular expression.

If a prompt matches, return a content-safety message and do not search. A moderation fetch failure currently produces the generic assistant-load error and prevents processing. This mechanism is only a basic word-list screen, not semantic content safety.

### 10.3 Local knowledge retrieval

Fetch the avatar's knowledge JSON without cache and build an exact normalized keyword index.

Normalization MUST:

- Convert to lowercase.
- Preserve ASCII letters, digits, `+`, `#`, `.`, and `-`.
- Replace other characters with spaces.
- Collapse and trim whitespace.

Build a spelling vocabulary from words in all normalized keywords. For each unknown question token, choose the best eligible candidate by Jaro-Winkler similarity. Use thresholds of 0.90 for tokens up to 3 characters, 0.88 up to 5, and 0.85 for longer tokens. Ignore candidates whose length differs by more than 3; for question tokens longer than 3, ignore candidates of 3 or fewer characters.

Generate all 2- and 3-word phrases plus non-stop-word single tokens. Match those phrases exactly against normalized knowledge keywords. Retain only the most specific overlapping keyword matches: a matched trigram suppresses its contained bigrams and unigrams, and a matched bigram suppresses its contained unigrams. Deduplicate documents by category and document ID. Score each result by the total word count of all retained matched keywords, sort descending, and return the top 3.

A successful response MUST concatenate matching document content and include available document video links and category “Learn more” links. Except for the default home assistant's site-search behavior, a local no-match response MUST offer a Bing search using normalized, de-duplicated keywords after common stop words are removed.

### 10.4 Microsoft Learn search

Treat a prompt as documentation-search intent when it begins with `search` or `find`, or contains indicators such as `documentation`, `docs`, `Microsoft Learn`, `how to`, `how do I`, `sample code`, or `code example`.

For documentation intent, attempt an MCP request to:

```text
https://learn.microsoft.com/api/mcp
```

Use MCP protocol version `2025-06-18` and client identity `ai-skills-nav` version `1.0.0`:

1. Send `initialize`.
2. Send `notifications/initialized`.
3. Call `tools/list`.
4. Select the first tool whose name contains `search`, otherwise the first tool.
5. Infer the query argument from `query`, `question`, `q`, `search`, `searchQuery`, `text`, or `prompt`, otherwise use the first declared property.
6. Call the tool.
7. Accept JSON or server-sent-event responses.
8. Extract and deduplicate up to 5 result URLs from JSON text content.

If MCP fails or returns no usable link, provide a Microsoft Learn documentation-search URL. MCP failures MUST not leave controls disabled.

### 10.5 Speech and audio

Feature-detect `SpeechRecognition` or `webkitSpeechRecognition`. When unsupported, disable the microphone and expose an explanatory title.

When supported:

- Use one-shot, final-result recognition.
- Use the browser language with `en-US` fallback.
- Reflect listening state in the placeholder, CSS state, and `aria-pressed`.
- Submit the recognized transcript automatically.
- Let the user stop active recognition.

Audio feedback applies only to speech-originated prompts:

- Play `looking.wav` while processing.
- Play `sorry.wav` after moderation or an error.
- Play `search_results.wav` after documentation search.
- Play `no_results.wav` after no local match.
- Play a random `response_1.wav` through `response_7.wav` after a local match.

Starting new audio MUST pause current audio. Playback rejection MUST be ignored safely.

## 11. Accessibility

The implementation MUST include:

- A keyboard-visible skip link.
- Semantic header, navigation, main, article, aside, and dialog elements.
- A visible 3-pixel focus indicator.
- Accessible names for forms, dialogs, close buttons, navigation, page controls, and assistant controls.
- `aria-current` for current breadcrumb and navigation items where appropriate.
- Live regions for result-empty states, personal-playlist status, and chat messages.
- Correct `aria-expanded`, `aria-hidden`, `aria-selected`, `aria-controls`, `aria-disabled`, and `aria-pressed` state.
- Empty alternative text for decorative thumbnails/avatar images.
- Full keyboard pivot behavior.
- A reduced-motion mode that disables smooth scrolling/transitions and displays chat responses immediately.

The chat flyout is non-modal and does not require a focus trap. Escape MUST close an open chat. Native dialogs SHOULD close through their explicit close actions, outside click where implemented, and native cancellation.

## 12. Runtime failure handling

The browser application MUST degrade safely when:

- Local storage is unavailable or malformed.
- Stored playlists refer to removed modules.
- Speech recognition is unsupported or fails.
- Audio playback is rejected.
- Learn MCP is unavailable.
- No catalog item or knowledge document matches.
- Knowledge or moderation files cannot be fetched.

Network requests do not require cancellation or timeouts for parity. Since assistant assets are fetched, the generated site MUST be served over HTTP(S); direct `file:` preview is unsupported.

## 13. Deployment

The repository MUST include a GitHub Pages workflow that:

- Runs on pushes to `main` and manual dispatch.
- Uses Node.js 22.
- Installs dependencies with `npm install --ignore-scripts`.
- Runs `npm run build`.
- Uploads `dist` with the official Pages artifact action.
- Deploys with the official Pages deployment action.
- Grants `contents: read`, `pages: write`, and `id-token: write`.
- Uses a Pages concurrency group and cancels superseded in-progress runs.

No Docker image or runtime service is required.

## 14. Acceptance criteria

A conforming implementation MUST satisfy the following checks.

### Build and routing

- A clean dependency install and build succeeds on Node.js 22.
- The current repository content generates 5 courses, 9 playlists, 24 modules, and 225 HTML files.
- All required routes and `.nojekyll` exist.
- Every local image, script, stylesheet, and generated navigation target resolves under the GitHub Pages subpath.
- Broken content relationships, includes, and required avatar assets fail the build with useful errors.
- One-page and multi-page module routing follows this specification.
- Playlist and course relationship order matches source metadata.

### Catalog and navigation

- Search normalizes punctuation, removes shared conversational stop words, and performs case-insensitive all-meaningful-term substring matching over the specified fields.
- Filter choices come from current metadata.
- OR-within-field and AND-between-fields behavior is correct.
- Search and filters compose correctly and update accessible empty states.
- Cancelling a filter dialog preserves the last applied filters.
- Curated and personal playlist context remains intact through module-page navigation.
- Desktop and mobile sidebar interactions work at the specified breakpoints.

### Personal playlists

- Stored data uses the documented key and shape.
- Invalid data is normalized safely.
- Blank and case-insensitive duplicate names are rejected.
- Duplicate module paths are not inserted.
- Module reordering is persisted and updates personal-playlist navigation order.
- Removing a module is persisted without affecting the module catalog or other playlists.
- A valid `playlist` query parameter restores navigation.
- Stale modules and storage failures are handled without page failure.

### Content rendering

- Front-matter titles and ordered page navigation render correctly.
- Relative and root-relative includes expand recursively.
- Include traversal and recursion fail the build.
- Included image paths are rewritten from the included source.
- Video directives and privacy-enhanced YouTube embeds work.
- Zone tabs are accessible, keyboard operable, and restore module preferences.
- New-window links include `noopener noreferrer`.

### Learning assistant

- No LLM is invoked.
- Local retrieval follows the documented normalization, spelling correction, phrase matching, scoring, and top-3 selection.
- Moderation occurs before retrieval.
- Documentation intent attempts Learn MCP and falls back to Learn search.
- Local no-match offers Bing search.
- The default home assistant never invokes Learn MCP, falls back to catalog links without filtering home tiles, and uses the specified final no-match response.
- Speech is feature-detected and spoken interactions use the correct audio states.
- Errors never leave assistant controls permanently disabled.

### Accessibility and responsiveness

- All controls are keyboard reachable and visibly focused.
- ARIA state remains synchronized with visible state.
- Reduced-motion preferences are honored.
- Catalog, module navigation, dialogs, page controls, and chat remain usable at 320 px width.
