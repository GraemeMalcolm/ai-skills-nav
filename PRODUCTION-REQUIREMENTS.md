# AI Skills Navigator Content Architecture Requirements

## 1. Purpose

This document defines the core product requirements for a production implementation of the proposed content architecture proof of concept. It describes the content model, discovery experiences, content rendering behavior, and learner navigation that the production solution must preserve.

The requirements are intentionally independent of the proof of concept's static-site generator, file-system routing, browser-only persistence, and frontend implementation. The production team may choose different technologies provided that the resulting authoring and learner experiences satisfy this document.

## 2. Product goals

The production solution must:

- Provide a consistent way to organize learning content into courses, playlists, modules, and pages.
- Enable learners to discover content by browsing, searching, and filtering.
- Minimize authoring and governance overhead by relying on rich titles and descriptions plus a small set of stable metadata.
- Preserve authored ordering and context as learners move through a learning sequence.
- Render reusable Markdown-based learning content consistently across modalities.
- Support curated learning journeys and learner-created personal playlists.
- Provide accessible, responsive navigation across desktop and mobile devices.
- Detect invalid content and references before publication.

## 3. Scope

### 3.1 In scope

- Content hierarchy and metadata.
- Content ingestion, validation, and publication behavior.
- Home, catalog, detail, and learning-page experiences.
- Search and filtering.
- Curated and personal playlist navigation.
- Markdown, media, quiz, lab, include, and pivot rendering.
- Sharing and deep linking.
- Accessibility, responsiveness, and failure states.

### 3.2 Outside the core scope

- A prescribed hosting model, framework, database, CMS, or build system.
- Exact visual styling or pixel-level reproduction of the proof of concept.
- The proof of concept's browser-storage format and deterministic assistant retrieval algorithm.
- Instructor administration, enrollment, assessment scoring, certification, payments, and formal learner transcripts.

Contextual learning assistants may be delivered as a separate capability. Content must retain the optional assistant/avatar association so that such an experience can be added without changing the core hierarchy.

## 4. Users and roles

### 4.1 Learner

A learner discovers content, opens courses or playlists, consumes module pages, chooses content variants, completes knowledge checks, and creates personal playlists.

### 4.2 Content author

A content author creates and updates metadata, Markdown pages, media, relationships, and ordering without having to duplicate reusable content.

### 4.3 Publisher or content administrator

A publisher validates content, reviews errors, controls publication, and ensures that references and routes remain valid.

## 5. Content hierarchy

The source content model is authoritative. The production solution must support this hierarchy for source content organization:

- *Course*
  - *Playlist*
    - *Module*
      - *Page* (must exist within the context of a module)

Note the following constraints and behavior when mapping the back-end source hierarchy to the front-end user experience:

- A *module* is the most granular unit of content that can be authored and published. An individual page cannot be published independently of a module. The minimum content asset that can be published on the site is a *module* containing a single *page*. The page can contains any valid content (such as an embedded video, text and graphics, an embedded lab, etc.). The user experience when viewing a single-page module flattens the hierarchy so that the module level is abstracted and the user sees only the page. For example, opening the **Azure Copilot Demo** module in the [PoC Home page](https://graememalcolm.github.io/ai-skills-nav), results in [this view](https://graememalcolm.github.io/ai-skills-nav/modules/azure-copilot-demo/index.html).
- When a module contains multiple pages, opening the module shows an "Overview" page within a navigation pane in which the user can browse the pages in the module. For example, the [Copilot Quickstart module](https://graememalcolm.github.io/ai-skills-nav/modules/custom-module/index.html) in the PoC contains two pages.
- One or more modules can optionally be organized in a *playlist*, which defines an ordered sequence of modules. Playlists are the core mechanism for grouping skilling experiences that can be shared/assigned. The system must support both *curated* playlists (authored and maintained by Global Skilling and authorized content contributors) and *personal* playlists (created by users). When browsing a playlist, the hierarchy flattening rule for single-page modules is observed. For example, the [Build 2026 Highlights](https://graememalcolm.github.io/ai-skills-nav/playlists/build-2026/index.html) playlist contains three single-page modules, and only page level (for the three individual pages) is shown in the navigation pane for the playlist. Conversely, the [AI Fundamentals](https://graememalcolm.github.io/ai-skills-nav/playlists/ai-fundamentals/index.html) playlist contains two multi-page modules, so the playlist navigation pane shows the module overview page level with the individual module pages indented beneath them.
- For Microsoft Official Curriculum content (modules and playlists authored and maintained by the Global Skilling content team to support ILT delivery and credential preparation), one or more playlists can be combined to form a *course*. For example, the [Develop Agents with Microsoft Foundry](https://graememalcolm.github.io/ai-skills-nav/courses/ai3026-develop-agents/index.html) course contains two playlists, each of which contains two modules, each containing multiple pages.

This taxonomy and rigid structure applies only to the back-end content organization, which is authored using the same tools as are currently used for Microsoft Learn (Markdown in GitHub using VS Code or other Markdown editors) or custom tools that abstract (but enforce) the hierarchical structure and metadata specification.

In the front-end web site, users may navigate the rendered content using alternative asset type names and flattened hierarchies. In particular, a user may perceive a single-page *module* as a standalone *page*; with the back-end hierarchy abstracted in the navigation UI.

### 5.1 General content requirements

**FR-CONTENT-001** Each course, playlist, module, and page must have a stable identifier that is independent of its display title.

**FR-CONTENT-002** Changing a title must not break relationships, bookmarks, or previously shared links.

**FR-CONTENT-003** Authored order must be preserved for playlists within a course, modules within a playlist, and pages within a module.

**FR-CONTENT-004** A module may be reused in multiple playlists and courses without duplicating its source content.

**FR-CONTENT-005** The system must support draft, validation, preview, publication, update, and withdrawal workflows. The specific workflow implementation is not prescribed.

**FR-CONTENT-006** Published content must expose enough metadata for discovery, filtering, accessibility, and navigation.

#### Metadata minimization principles

The content architecture deliberately favors rich, meaningful text over a large taxonomy of granular metadata. Every additional authored field creates maintenance cost, requires governance, and can become incomplete or inaccurate as products, roles, and terminology change. Metadata must therefore be limited to values with a clear, stable product purpose.

Titles and descriptions are the primary discovery content:

- A title must name the subject and learning intent clearly enough to make sense in search results, recommendations, cards, navigation, and shared links.
- A description must be rich enough for an agent to be able to identify the key topics, audience, and skills covered in the content.
- `topics` provides a small amount of additional subject vocabulary that would be awkward or repetitive in the title or description.
- Other metadata exists for identity, hierarchy, presentation, filtering, or operations; it must not automatically become search-keyword data.

**FR-METADATA-001** The production content model must use the smallest practical set of stable metadata needed to support hierarchy, presentation, filtering, accessibility, and operations.

**FR-METADATA-002** A proposal for a new metadata field must identify a product behavior that cannot be met reliably by title, description, `topics`, an existing field, or a value derived from content relationships.

**FR-METADATA-003** The solution must prefer deriving aggregate values, such as playlist and course modality, from referenced content rather than requiring authors to maintain duplicate metadata.

**FR-METADATA-004** Search relevance problems should first be addressed by improving titles, descriptions, topics, normalization, ranking, or governed synonyms rather than by adding searchable metadata fields.

**FR-METADATA-005** The search index must not automatically ingest every available source or operational field. Searchable fields must be explicitly approved in the search contract.

**FR-METADATA-006** Metadata values must not duplicate facts that are already reliably available from hierarchy or canonical source data unless the duplicated value is required as an immutable publication snapshot.

**FR-METADATA-007** Required titles and descriptions must be validated as non-empty meaningful text. `topics` must remain a concise list of stable subject concepts rather than an unrestricted keyword dump.

### 5.2 Course

A course represents a formal curriculum composed of one or more ordered playlists.

Course metadata uses the following source contract:

| Source field | Cardinality | Required | Use in the product |
| --- | --- | --- | --- |
| Stable identifier | One | Yes | Canonical identity for relationships, routes, analytics, and sharing. In the current source layout this is the course folder name, such as `ai3026-develop-agents`; a production CMS may store it explicitly. |
| `title` | One string | Yes | Course heading, catalog-card title, breadcrumbs, search text, and accessible labels. |
| `course_number` | One string | Yes | Course identity and display metadata on course cards and detail pages. It is not part of general free-text search. It must remain a string so values such as `AI-3026` retain formatting. |
| `credentials` | List of strings | No | Associated credentials displayed on the course detail page in source order. An empty or absent list means that no credential is specified. |
| `description` | One string | Yes | Course overview copy, catalog summary or tooltip, and searchable text. |
| `level` | One string or number | Yes | Displayed difficulty/level and an exact-match catalog filter value. |
| `duration` | One string | Yes | Human-readable estimated completion time. The production model should additionally support a normalized duration for sorting and analytics. |
| `experience_type` | One string | Yes | Displayed experience type and catalog filter value. |
| `topics` | List of strings | Yes | Search terms, topic presentation, recommendations, and future topic browsing. At least one value is required. |
| `audience` | List of strings | Yes | Intended learner roles shown in metadata and used as catalog filter values. At least one value is required. |
| `restricted_to` | List of domain strings | No | Limits simulated browsing and discovery to signed-in email addresses whose domain matches one listed value. |
| `avatar` | One identifier | No | Associates a contextual AI assistant configuration with the course. The reference must resolve when supplied. |
| `playlists` | Ordered list of playlist identifiers | Yes | Defines course membership and the complete course learning sequence. At least one valid reference is required. |
| `thumbnail.png` or equivalent image reference | One asset | Yes | Course cards and course overview. It must have an accessible treatment appropriate to whether the image is informative or decorative. |

Example:

```yaml
title: Develop AI agents with Microsoft Foundry
course_number: AI-3026
credentials:
     - Microsoft Applied Skill - Develop AI agents with Microsoft Foundry
     - Microsoft Certified - Azure AI Apps and Agrnt Developer Associate
description: Learn to build, test, and deploy AI agents.
level: 200
duration: 1 day
experience_type: Microsoft Official Curriculum
topics:
     - Microsoft Foundry
     - AI agents
audience:
     - Developer
avatar: anton
playlists:
     - agent-developer
     - microsoft-iq
```

**FR-COURSE-001** A course detail page must present its title, course number, description, image, level, duration, experience type, audiences, topics, credentials, and ordered playlists.

**FR-COURSE-002** A learner must be able to begin or continue the course from its first effective learning step.

**FR-COURSE-003** Course navigation must continue across playlist boundaries while preserving the source-defined order.

### 5.3 Curated playlist

A curated playlist is an ordered learning journey containing one or more modules. It may be used independently or as part of one or more courses.

Playlist metadata uses the following source contract:

| Source field | Cardinality | Required | Use in the product |
| --- | --- | --- | --- |
| Stable identifier | One | Yes | Canonical identity for course references, routes, analytics, and sharing. In the current source layout this is the playlist folder name. |
| `title` | One string | Yes | Playlist heading, card title, breadcrumbs, navigation label, and search text. |
| `description` | One string | Yes | Playlist overview, catalog summary or tooltip, and search text. |
| `level` | One string or number | Yes | Displayed level and catalog filter value. |
| `duration` | One string | Yes | Human-readable estimated completion time. A normalized value should also be available in the production model. |
| `experience_type` | One string | No | Experience type and catalog filter value to reflect the source or type of skilling - for example "Microsoft Official Curriculum", "Microsoft Short-Form Skilling", "Microsoft Labs", "LinkedIn Training", et.c. |
| `topics` | List of strings | Yes | Search text, topic presentation, and recommendations. At least one value is required. |
| `audience` | List of strings | Yes | Intended learner roles and catalog filter values. At least one value is required. |
| `restricted_to` | List of domain strings | No | Limits simulated browsing and discovery to signed-in email addresses whose domain matches one listed value. |
| `avatar` | One identifier | No | Associates a contextual AI assistant configuration with the playlist. |
| `modules` | Ordered list of module identifiers | Yes | Defines playlist membership, sidebar order, and cross-module Previous/Next navigation. At least one valid reference is required. |
| `thumbnail.png` or equivalent image reference | One asset | Yes | Playlist cards and overview. |

Playlist modality is not authored separately. It is the unique union of `modalities` from all referenced modules and is used for discovery and filtering.

Example:

```yaml
title: Develop your first AI agent
description: Learn how to develop AI agents with Microsoft Foundry.
level: 200
duration: 90 minutes
experience_type: Microsoft Official Curriculum
topics:
     - Microsoft Foundry
     - AI agents
audience:
     - Developer
avatar: anton
modules:
     - develop-first-agent
     - connect-agent-to-mcp-tools
```

**FR-PLAYLIST-001** A multi-module playlist must provide an overview showing its metadata and ordered modules.

**FR-PLAYLIST-002** A single-module playlist may take the learner directly to its module, provided playlist context remains visible and navigable.

**FR-PLAYLIST-003** A playlist must provide persistent navigation showing its modules and, where appropriate, module pages.

**FR-PLAYLIST-004** The current playlist, module, and page must be visibly identified in contextual navigation.

### 5.4 Module

A module is the reusable core learning asset. It contains one or more ordered pages and may support one or more learning modalities.

Module metadata uses the following source contract:

| Source field | Cardinality | Required | Use in the product |
| --- | --- | --- | --- |
| Stable identifier | One | Yes | Canonical reusable identity for playlist references, personal playlists, routes, analytics, and sharing. In the current source layout this is the module folder name. |
| `title` | One string | Yes | Module heading, card title, playlist navigation label, breadcrumbs, and search text. |
| `description` | One string | Yes | Module overview, card summary or tooltip, and search text. |
| `modalities` | List of strings | No | Describes delivery formats present in the module such as `Video` and `Lab`; displayed as metadata and used directly and transitively for filtering. At least one value is required. Values are content-defined rather than a closed enumeration unless product governance establishes one. |
| `level` | One string or number | Yes | Displayed level and catalog filter value. |
| `duration` | One string | Yes | Human-readable estimated completion time. A normalized value should also be available in the production model. |
| `experience_type` | One string | Yes | Displayed experience type and catalog filter value. |
| `topics` | List of strings | Yes | Search text, topic presentation, and recommendations. At least one value is required. |
| `audience` | List of strings | Yes | Intended learner roles and catalog filter values. At least one value is required. |
| `restricted_to` | List of domain strings | No | Limits simulated browsing and discovery to signed-in email addresses whose domain matches one listed value. |
| `avatar` | One identifier | No | Associates a contextual AI assistant configuration with the module. |
| `pages` | Ordered list of page entries | Yes | Defines the module structure, overview page list, sidebar, and Previous/Next sequence. At least one entry is required. |
| `thumbnail.png` or equivalent image reference | One asset | Yes | Module cards, module overview, and personal-playlist management. |

A page entry may be a Markdown filename or an object. The object form supports `file` as the required source reference plus optional `title` and `description` values for navigation and overview presentation. These overrides do not replace page front matter or alter the canonical page body.

Example:

```yaml
title: Introduction to AI Concepts
description: Explore common AI workloads and responsible AI.
modalities:
     - Video
     - Lab
level: 100
duration: 120 minutes
experience_type: Microsoft Official Curriculum
topics:
     - Artificial Intelligence
audience:
     - Developer
avatar: anton
pages:
     - 01-introduction.md
     - file: 08-exercise.md
          title: Exercise
          description: Explore AI workloads in a practical lab.
     - 09-knowledge-check.md
     - 10-summary.md
```

**FR-MODULE-001** A single-page module must open directly as a learning page without requiring an intermediate overview.

**FR-MODULE-002** A multi-page module must provide an overview containing its description, metadata, image, ordered page list, and a clear action to begin.

**FR-MODULE-003** A module must be addressable independently of any playlist and must also render correctly within curated, course, and personal-playlist contexts.

**FR-MODULE-004** The same canonical module content must be used in every context; contextual navigation may change, but the learning content must not be forked.

### 5.5 Page

A page is the smallest navigable learning unit and may combine explanatory text, images, links, video, labs, code, tables, knowledge checks, and other supported content components.

Page source consists of optional YAML front matter followed by a Markdown body.

| Source field | Cardinality | Required | Use in the product |
| --- | --- | --- | --- |
| Stable identifier | One | Yes | Canonical identity for routes, deep links, ordering, and analytics. In the current source layout this is derived from the Markdown filename without its extension. |
| `title` | One string | Recommended | Visible page heading, document title, breadcrumbs, and default navigation label. |
| `lab.title` | One string | No | Fallback page heading for imported lab documents when top-level `title` is absent. |
| `quiz` | List of question groups | No | Declares an interactive formative knowledge check. Each `item` contains ordered questions with `question` text and an `answer` key. |
| Markdown body | One body | Yes, except quiz-only pages | Rendered as the learning content after reusable-content expansion and directive processing. |
| Referenced media | Zero or more assets | No | Images, downloads, and other assets used by the page or included content. |

Example standard page:

```markdown
---
title: Understand key concepts
---

Azure Databricks provides a collaborative environment for data and AI workloads.
```

Example lab page metadata:

```markdown
---
title: Exercise - Explore AI workloads
---
```

Example quiz metadata:

```yaml
---
title: Quiz - Check your learning
quiz:
     - item:
               - question: What is an LLM?\nA - A lightweight model\nB - A large language model\nC - A linear logic machine
                    answer: b
---
```

**FR-PAGE-001** The visible page heading must use this precedence: page `title`, `lab.title`, and finally a human-readable source name. A page-entry `title` override takes precedence only for navigation and module-overview labels.

**FR-PAGE-002** Pages must support direct links and browser history without losing their course or playlist context when that context is present.

## 6. Content validation and publishing

**FR-PUBLISH-001** Before publication, the system must reject malformed metadata and front matter with an actionable error that identifies the affected item and field.

**FR-PUBLISH-002** The system must reject missing page files, media required by the content, and unresolved course-to-playlist, playlist-to-module, page, include, or assistant references.

**FR-PUBLISH-003** The system must reject duplicate stable identifiers and route collisions.

**FR-PUBLISH-004** The system must detect recursive reusable-content references and references that violate configured source boundaries.

**FR-PUBLISH-005** The system must validate field types, required values, array entries, supported URL schemes, and thumbnail availability.

**FR-PUBLISH-006** A publisher must be able to preview the complete learner experience before making changes publicly available.

**FR-PUBLISH-007** A failed publication must not replace the currently published, valid experience.

## 7. Discovery experiences

### 7.1 Home page

**FR-HOME-001** The home page must provide distinct entry points for courses, curated playlists, modules, and personal playlists.

**FR-HOME-002** It must present configurable featured subsets of courses, playlists, and modules, with links to each complete catalog.

**FR-HOME-003** It must provide search across all published courses, playlists, and modules.

**FR-HOME-004** It must provide filters derived from current published metadata rather than hard-coded content values.

### 7.2 Catalogs

Separate catalogs must be available for courses, curated playlists, and modules.

**FR-CATALOG-001** Each catalog must provide an introduction, search, applicable filters, a result count or equivalent status, a result collection, and an accessible no-results state.

**FR-CATALOG-002** Each result must show a representative image, title, concise metadata, description or summary, and a link to the appropriate detail or learning route.

**FR-CATALOG-003** Module results must provide an action to add the module to a personal playlist without requiring the learner to open it first.

**FR-CATALOG-004** General catalog search must use exactly the published `title`, `description`, and `topics` of each course, playlist, or module. It must not search course number, audience, level, duration, experience type, modality, hierarchy labels, stable identifiers, page body text, assistant metadata, or other fields.

**FR-CATALOG-005** Search must be case-insensitive, tolerate punctuation and common conversational words, and require all meaningful query terms to match.

**FR-CATALOG-006** Filters must include audience, experience type, level, and modality where those values apply.

**FR-CATALOG-007** Playlist modality must be derived from its modules. Course modality must be derived from all modules in its playlists.

**FR-CATALOG-008** Multiple selections within one filter category must use OR semantics. Different filter categories and search terms must combine using AND semantics.

**FR-CATALOG-009** Learners must be able to clear search and filters, and the interface must communicate active filters.

**FR-CATALOG-010** The solution should preserve applied filters while the learner moves among catalog experiences during the same browsing journey.

**FR-CATALOG-011** The header must provide simulated Sign-in and Sign-out controls. Sign-in must validate email syntax and require a password, but persist only the email address.

**FR-CATALOG-012** Signed-out learners must not discover assets with `restricted_to`. Signed-in learners may discover or browse them only when the signed-in email domain matches an allowed domain. This check must precede catalogs, search, filtering, personal playlists, nested navigation, and direct-route display.

**FR-CATALOG-013** Client-side simulated access control must not be treated as protection for confidential source or generated content; production authorization requires server-side enforcement.

### 7.3 Search behavior

Search is a free-text discovery mechanism, not a substitute for filtering and not a reason to expand the metadata model. Its primary signal is well-authored title and description text, supplemented only by the concise `topics` list.

| Content type | Searchable fields | Explicitly excluded examples |
| --- | --- | --- |
| Course | `title`, `description`, `topics` | `course_number`, `credentials`, `level`, `duration`, `experience_type`, `audience`, `avatar`, playlist references |
| Curated playlist | `title`, `description`, `topics` | `level`, `duration`, `experience_type`, `audience`, derived modality, `avatar`, module references |
| Module | `title`, `description`, `topics` | `modalities`, `level`, `duration`, `experience_type`, `audience`, `avatar`, page references and page body text |

For example, a module with this metadata:

```yaml
title: Get started with Azure Databricks
description: Explore lakehouse architecture, Apache Spark, Delta Lake, Unity Catalog, data engineering, analytics, and machine learning.
topics:
     - Azure Databricks
audience:
     - Data Engineer
modalities:
     - Video
     - Lab
level: 200
```

must match searches for `lakehouse`, `Apache Spark`, `machine learning`, and `Azure Databricks`. It must not match `Data Engineer`, `Video`, `Lab`, or `200` solely because those values occur in discrete metadata. Those values belong to filters.

**FR-SEARCH-001** The searchable document for each catalog item must be constructed only from its title, description, and topics.

**FR-SEARCH-002** Title and description must carry sufficient meaning for useful discovery without depending on hidden keywords or a large collection of tags.

**FR-SEARCH-003** Topics may improve recall for a small number of stable subject names, acronyms, former names, or closely related concepts not naturally present in title or description. Topics must not repeat every word in those fields.

**FR-SEARCH-004** Search input must be trimmed and compared case-insensitively.

**FR-SEARCH-005** Search normalization must replace punctuation with spaces while preserving characters that carry meaning in technology names, including `+`, `#`, `.`, and `-`.

**FR-SEARCH-006** Search must split normalized input into terms and remove a governed set of common conversational stop words. Domain-bearing action words such as `develop`, `build`, `create`, and `implement` must remain searchable.

**FR-SEARCH-007** Every remaining meaningful query term must occur as a substring in the combined searchable document for an item. Terms may match across different approved fields; for example, one term may match the title and another the description.

**FR-SEARCH-008** A non-empty query containing only stop words must apply no text constraint and must not produce a misleading no-results state.

**FR-SEARCH-009** Search must execute when the learner submits the search form. A clear action must remove the query, restore results subject to active filters, and return focus to the search input.

**FR-SEARCH-010** Search results must update an accessible result or no-results status and must preserve a clear route to remove the search constraint.

**FR-SEARCH-011** Search ranking may give greater weight to title matches than description or topic matches, but ranking must not change which fields are searchable.

**FR-SEARCH-012** Exact lookup by a known identifier such as a course number, if later required, must be implemented as a distinct lookup behavior and must not silently broaden the general free-text search index.

### 7.4 Filtering behavior

Filters provide structured refinement using the existing small set of stable categorical metadata. They must remain distinct from free-text search.

| Filter | Authored or derived source | Applies to |
| --- | --- | --- |
| Audience | Authored `audience` | Courses, playlists, and modules |
| Experience type | Authored `experience_type` | Courses, playlists, and modules |
| Level | Authored `level` | Courses, playlists, and modules |
| Modality | Module `modalities`; derived union for playlists and courses | Courses, playlists, and modules |

Duration, topics, credentials, course number, assistant association, and hierarchy membership are not baseline filters. Adding a filter requires evidence of a stable learner need and must satisfy the metadata minimization requirements.

**FR-FILTER-001** Available filter values must be generated from current published content and must not be maintained as a second independent list.

**FR-FILTER-002** A module's modality filter values must come from its authored `modalities`. A playlist's values must be the unique union of its modules' modalities. A course's values must be the unique union of all modules in its playlists.

**FR-FILTER-003** Selecting multiple values within one filter uses OR semantics. For example, selecting `Developer` and `Data Engineer` matches content intended for either audience.

**FR-FILTER-004** Different filters use AND semantics. For example, `Audience: Developer` and `Modality: Lab` matches only content satisfying both constraints.

**FR-FILTER-005** Search and filters use AND semantics. An item must satisfy every active filter and every meaningful search term.

**FR-FILTER-006** Filter changes must take effect only when applied, unless the interface clearly adopts an immediate-apply pattern consistently. Cancelling an edit must retain the previously applied state.

**FR-FILTER-007** Clear all must remove all filter constraints and update results immediately. Clearing filters must retain any active search query.

**FR-FILTER-008** The interface must show the number or identity of active filter values and provide an accessible no-results state when the combined constraints match nothing.

**FR-FILTER-009** Filter values should be presented in predictable locale-aware order and duplicate values must be consolidated using governed normalization.

**FR-FILTER-010** A missing optional metadata value must not cause a content item to match a filter it does not explicitly or derivatively satisfy.

## 8. Learning and hierarchy navigation

**FR-NAV-001** Every detail and learning page must provide breadcrumbs representing its current hierarchy and a clearly identified current item.

**FR-NAV-002** Previous and Next controls must follow authored order and omit controls that have no valid destination.

**FR-NAV-003** In a multi-page module, navigation must move from the module overview through each page in order.

**FR-NAV-004** In a playlist, navigation must cross module boundaries: the last page of one module proceeds to the next module's effective first step, and reverse navigation returns to the preceding module's effective last step.

**FR-NAV-005** In a course, navigation must also cross playlist boundaries according to the course's authored playlist order.

**FR-NAV-006** Contextual navigation must expose the containing playlist and its ordered module/page structure without obscuring the learning content.

**FR-NAV-007** Contextual navigation must be persistently available on larger screens and available through an accessible drawer or equivalent control on smaller screens.

**FR-NAV-008** Opening a standalone module must not imply membership in a course or playlist. Opening it from a hierarchy must preserve that hierarchy until the learner intentionally leaves it.

**FR-NAV-009** Direct and shared links must restore the most specific valid context encoded by the link. If that context is unavailable or invalid, the module or page must still open in standalone mode where possible.

## 9. Single-page and multi-page module experiences

### 9.1 Source hierarchy versus presentation

The production solution must maintain a strict and predictable source hierarchy regardless of how many screens the learner sees:

```text
Course -> Playlist -> Module -> Page
```

A module is always a first-class source and product entity. Every module has its own metadata, stable identifier, thumbnail, discovery record, playlist relationships, and one or more ordered page references. Even a module containing only one page must not be modeled as a page attached directly to a playlist or course.

The learner experience is intentionally more flexible. The presentation layer may omit an intermediate overview when it would add no meaningful choice or context. This produces a shorter journey for compact skilling experiences while retaining one consistent authoring, validation, reuse, search, analytics, and relationship model.

**FR-EXPERIENCE-001** The source model must always retain Course, Playlist, Module, and Page as distinct entity types; presentation rules must not flatten or rewrite the stored hierarchy.

**FR-EXPERIENCE-002** A page must belong to a module. A playlist must reference modules rather than pages, including when a referenced module has only one page.

**FR-EXPERIENCE-003** The number of pages in a module determines its default presentation behavior at publication or request time. Authors must not need to create a different content type for a single-page experience.

**FR-EXPERIENCE-004** Search, filters, recommendations, personal playlists, sharing, and analytics must identify the module as the skilling experience in both single-page and multi-page cases.

### 9.2 Effective learning steps

An **effective learning step** is a screen that participates in sequential learner navigation. Effective steps are derived from the fixed source hierarchy as follows:

| Source item | Effective learner steps |
| --- | --- |
| Single-page module | The page only; the module overview is omitted. |
| Multi-page module | Module overview, followed by every page in authored order. |
| Single-module playlist | The module's effective steps; a separate playlist overview may be omitted. |
| Multi-module playlist | Playlist overview, followed by each module's effective steps in authored module order. |
| Course | Course overview, followed by each playlist's effective steps in authored playlist order. |

This derivation determines entry points and Previous/Next destinations. It does not alter source ownership or canonical identity.

For example, this source hierarchy:

```text
Playlist: Build foundational AI skills
     Module A: AI terminology
          Page A1: AI terminology
     Module B: Generative AI
          Page B1: Introduction
          Page B2: Language models
          Page B3: Responsible use
     Module C: Knowledge check
          Page C1: Check your learning
```

produces this learner sequence:

```text
Playlist overview
     -> Page A1
     -> Module B overview
     -> Page B1
     -> Page B2
     -> Page B3
     -> Page C1
```

Module A and Module C remain visible and addressable as modules even though their overview screens are omitted.

**FR-EXPERIENCE-005** Effective steps must be derived consistently for standalone modules, curated playlists, courses, and personal playlists.

**FR-EXPERIENCE-006** The effective first step of a single-page module is its only page. The effective first step of a multi-page module is its module overview.

**FR-EXPERIENCE-007** The effective last step of any module is its final authored page.

**FR-EXPERIENCE-008** Sequential navigation must traverse effective steps without inserting omitted overview screens or skipping authored pages.

### 9.3 Single-page module rendering

A single-page module is a compact skilling experience whose `pages` metadata contains exactly one entry.

**FR-SINGLEPAGE-001** Opening a single-page module from a catalog, playlist, course, personal playlist, search result, recommendation, bookmark, or shared link must render its page content immediately.

**FR-SINGLEPAGE-002** The solution must not require the learner to pass through a module overview containing a second link to the only page.

**FR-SINGLEPAGE-003** The rendered experience must still use module metadata where applicable, including module identity, context, assistant association, sharing, analytics, and catalog return paths.

**FR-SINGLEPAGE-004** The page heading must follow page-title rules. Module title and hierarchy context must remain available through breadcrumbs, contextual navigation, document metadata, or equivalent accessible presentation without creating a redundant heading sequence.

**FR-SINGLEPAGE-005** The canonical module URL may render the only page directly or redirect to a canonical page URL. The chosen URL policy must preserve stable bookmarks, sharing, analytics attribution, and hierarchy context.

**FR-SINGLEPAGE-006** A direct link to the underlying page must produce the same content and effective navigation as entry through the module.

### 9.4 Multi-page module rendering

A multi-page module is a skilling experience whose `pages` metadata contains two or more ordered entries.

**FR-MULTIPAGE-001** Opening a multi-page module must first present a module overview.

**FR-MULTIPAGE-002** The overview must present the module title, description, thumbnail, duration, level, modalities, audience, topics where appropriate, and the ordered list of pages.

**FR-MULTIPAGE-003** The overview must provide a clear Next or equivalent begin action whose destination is the first authored page.

**FR-MULTIPAGE-004** Every page must be directly addressable and must expose its position and current state within module navigation.

**FR-MULTIPAGE-005** Previous and Next navigation must move between the overview and pages in this order:

```text
Module overview -> Page 1 -> Page 2 -> ... -> Final page
```

**FR-MULTIPAGE-006** The page list shown on the overview and in contextual navigation must use page-entry title overrides where supplied and otherwise use page front-matter titles.

### 9.5 Mixed playlists and courses

Curated and personal playlists may contain any ordered mix of single-page and multi-page modules. Courses may similarly contain playlists with different structures. Learners should experience one continuous journey rather than having to understand why source items have different page counts.

**FR-MIXED-001** Playlist navigation must present every module in authored order and must not visually demote or omit a module because it contains only one page.

**FR-MIXED-002** A single-page module's module navigation link must open its only page. A multi-page module's module navigation link must open its overview.

**FR-MIXED-003** When leaving a module, Next must open the next module's effective first step. When entering a module from the following step, Previous must open the preceding module's effective last step.

**FR-MIXED-004** Navigation labels may identify a module separately from its page even when both have similar titles, but the interface must avoid redundant adjacent links that lead to the same rendered content.

**FR-MIXED-005** A playlist containing one single-page module may open that page directly from catalog and course entry points while preserving playlist identity in breadcrumbs and contextual navigation.

**FR-MIXED-006** A playlist containing one multi-page module may open the module overview directly while preserving playlist identity. A redundant playlist overview should be omitted unless it contains unique required information or actions.

**FR-MIXED-007** A multi-module playlist must retain its playlist overview as the effective step preceding its first module, regardless of the modules' page counts.

**FR-MIXED-008** Course-level navigation must apply the same effective-step rules across playlist boundaries. An omitted single-module playlist overview must not create a navigation gap.

**FR-MIXED-009** Reordering modules in a personal playlist must immediately recalculate the effective sequence without changing module or page source records.

### 9.6 Context, state, and evolution

**FR-EXPERIENCE-009** Breadcrumbs and contextual navigation must reflect the full logical hierarchy even when an overview screen is omitted. For example, a single-page module opened from a course must retain Course, Playlist, Module, and current Page context where the interface pattern supports those levels.

**FR-EXPERIENCE-010** Completion and progress models must distinguish module completion from page completion. A single-page module may become complete when its page is complete; a multi-page module may become complete only according to the product's defined page-completion policy.

**FR-EXPERIENCE-011** If an author changes a module from one page to multiple pages, or from multiple pages to one, the module identifier and relationships must remain stable. Existing links must redirect or resolve to the nearest valid effective step according to the canonical URL policy.

**FR-EXPERIENCE-012** Analytics must record both the canonical module identity and the rendered step identity so that engagement can be compared across single-page and multi-page experiences.

**FR-EXPERIENCE-013** Accessible names, focus order, landmarks, and announcements must remain coherent when overview screens are omitted; hidden hierarchy must not result in missing context for assistive-technology users.

**FR-EXPERIENCE-014** Loading, error, unavailable-content, and authorization states must preserve the containing hierarchy and provide a valid route to the next available action.

## 10. Content rendering

### 10.1 Markdown and standard content

**FR-RENDER-001** The solution must render GitHub Flavored Markdown, including headings, paragraphs, emphasis, lists, tables, code, block quotes, links, and images.

**FR-RENDER-002** Page metadata/front matter must not appear as visible page content.

**FR-RENDER-003** Relative media references must resolve from the source document that declares them, including reusable or externally sourced documents.

**FR-RENDER-004** External links must be clearly operable. Links authored to open a new window must do so safely without allowing the opened page to control the source page.

**FR-RENDER-005** Raw HTML and any additional authoring directives must have an explicit support and sanitization policy. Unsupported syntax must produce a validation warning or error rather than silently degrading into misleading content.

The baseline authoring syntax includes standard GitHub-compatible markdown, including:

````markdown
# Page heading

Use **bold**, *emphasis*, `inline code`, and [descriptive links](https://example.com).

1. Complete the first step.
2. Complete the second step.

| Service | Purpose |
| --- | --- |
| Foundry | Build AI applications |

```python
print("Hello")
```

> **Tip:** Use block quotes for callouts until a governed callout directive is defined.
````

Expected rendering behavior:

- Heading levels must preserve a logical hierarchy beneath the page's generated heading. Authors should not need to repeat the generated page title in the body.
- Ordered and unordered list structure, including nesting, must be preserved.
- Code blocks must preserve whitespace and expose their declared language for syntax highlighting where supported.
- Tables must remain readable on narrow screens without forcing the whole page beyond the viewport.
- Links must retain descriptive text and be distinguishable without relying only on color.
- Raw HTML must never bypass the production sanitization and content-security policy.

Standard Markdown images must be supported:

```markdown
![Screenshot of the model catalog.](./media/model-catalog.png)
```

The Microsoft Learn image directive found in the source must also be supported or converted during ingestion:

```markdown
:::image type="content" source="../media/notebook.png" alt-text="Screenshot of an Azure Databricks notebook." lightbox="../media/notebook.png":::
```

For this directive:

- `source` is required and identifies the displayed image.
- `alt-text` is required and becomes the image's alternative text.
- `type="content"` identifies an informative content image.
- `lightbox`, when supplied, provides the expanded image opened from the rendered content.
- Relative `source` and `lightbox` values resolve from the Markdown document containing the directive.

**FR-ASSET-001** Relative image and download paths must resolve from the source document that declares them. For backward compatibility, the resolver may check a `media` child folder when the literal relative path does not exist.

**FR-ASSET-002** Media referenced by included local Markdown must resolve from the included document, not from the including page.

**FR-ASSET-003** Media referenced by remote Markdown must resolve against the remote document URL.

**FR-ASSET-004** Informative images must have meaningful alternative text. Decorative images must use empty alternative text and must not repeat adjacent content.

**FR-ASSET-005** The `:::image` directive must render as an image with its authored alternative text and an accessible lightbox action when `lightbox` is supplied.

#### Example

- Source: [2-how-copilot-works.md](https://github.com/GraemeMalcolm/ai-skills-nav/blob/main/source/modules/get-started-with-copilot/2-how-copilot-works.md)
- Rendered page: [Explore how Copilot works across your Microsoft 365 apps](https://graememalcolm.github.io/ai-skills-nav/modules/get-started-with-copilot/pages/2-how-copilot-works/index.html)

### 10.2 Hyperlinks

The standard Markdown syntax for a hyperlink must be supported.

````markdown
[Micrsoft Foundry portal](https://ai.azure.com)
````

Authors may request a new browsing context by specifying a target attribute using the following extension syntax:

```markdown
[Open the lab](https://example.com/lab){target="_blank"}

[![Launch the exercise.](./media/launch-exercise.png)](https://example.com/lab/){:target="_blank"}
```

**FR-LINK-001** Both `{target="_blank"}` and `{:target="_blank"}` must work for text links and linked images.

**FR-LINK-002** New-window links must render with `target="_blank"`, `rel="noopener noreferrer"`, and an accessible indication that they open a new browsing context.

#### Example

- Source: [08-summary.md](https://github.com/GraemeMalcolm/ai-skills-nav/blob/main/source/modules/start-databricks/08-summary.md)
- Rendered page: [Summary](https://graememalcolm.github.io/ai-skills-nav/modules/start-databricks/pages/08-summary/index.html)

### 10.3 Reusable content

**FR-REUSE-001** `[!INCLUDE]` references must insert the referenced Markdown into the containing page before rendering.

**FR-REUSE-002** Includes must support repository-root-relative and containing-document-relative references, recursive expansion, removal of included front matter, and media resolution relative to the included source.

**FR-REUSE-004** Relative media and nested includes in externally sourced Markdown must resolve against the external document URL.

**FR-REUSE-005** Missing, inaccessible, unsupported, or recursive includes must produce a publication error with the source and failed reference identified.

**FR-REUSE-006** The production solution must define availability, caching, integrity, and change-control policies for externally sourced content so that publication is repeatable and does not unexpectedly change after approval.

Supported local include forms:

```markdown
[!INCLUDE ../shared/prerequisites.md]

[!INCLUDE[](../shared/prerequisites.md)]

[!INCLUDE[](/MicrosoftLearning/ai-agents/integrate-mcp.md)]
```

The first two references resolve from the containing Markdown file. A leading slash resolves from the configured content-repository root, not from the public website root. Included front matter is removed; its Markdown body is inserted at the directive position and then processed recursively.

#### Example (reusing a page in a second module)

- Source: [01-copilot.md](https://github.com/GraemeMalcolm/ai-skills-nav/blob/main/source/modules/custom-module/01-copilot.md)
- Rendered page: [What is Copilot?](https://graememalcolm.github.io/ai-skills-nav/modules/custom-module/pages/01-copilot/index.html)

### 10.4 Video

**FR-VIDEO-001** A video directive must render a responsive embedded player with a meaningful accessible title, lazy loading where appropriate, and full-screen support.

**FR-VIDEO-002** Supported video providers and URL transformations must be centrally governed. Privacy-enhanced provider URLs should be used where available.

**FR-VIDEO-003** Video failure must leave an accessible fallback link to the source.

Supported forms use a directive on its own line; the colon after `VIDEO` is optional:

```markdown
[!VIDEO https://learn-video.azurefd.net/vod/player?id=video-id]

[!VIDEO: https://youtu.be/video-id]
```

Expected rendering behavior:

- The player must preserve a 16:9 aspect ratio and resize within the content column.
- YouTube short and watch URLs must use the privacy-enhanced embed domain where provider support exists.
- The embed must not begin playback automatically.
- The rendered experience must provide the source URL as a fallback when embedding is blocked or unsupported.
- Invalid, non-HTTP(S), or unsupported provider URLs must fail validation or render as a safe ordinary link according to the governed provider policy.

#### Example

- Source: [01-azure-copilot.md](https://github.com/GraemeMalcolm/ai-skills-nav/blob/main/source/modules/azure-copilot-demo/01-azure-copilot.md)
- Rendered page: [Azure Copilot Demo](https://graememalcolm.github.io/ai-skills-nav/modules/azure-copilot-demo/index.html)

### 10.5 Choice pivots

Choice pivots allow authors to present equivalent variants, such as video versus text or hosted lab versus a learner's own environment.

**FR-PIVOT-001** Consecutive authored pivot blocks must render as one accessible tabbed interface in source order.

**FR-PIVOT-002** Tabs must support pointer and keyboard operation, including Left Arrow, Right Arrow, Home, and End.

**FR-PIVOT-003** The selected variant must be communicated programmatically and visually.

**FR-PIVOT-004** The learner's selection should be reused for equivalent pivot groups elsewhere in the same module or journey.

**FR-PIVOT-005** Failure to save a preference must not prevent the learner from using the pivots.

Example:

```markdown
::: zone pivot="Use a hosted lab environment"

Launch the hosted environment and follow the instructions.

::: zone-end

::: zone pivot="Use your own environment"

Follow the subscription-based setup instructions.

::: zone-end
```

Expected rendering behavior:

- Consecutive pivot blocks form one tab group; ordinary content outside a pivot ends the group.
- The `pivot` value is the visible tab label and the accessible tab name.
- Only one panel in a group is active at a time.
- An unclosed block, missing label, or `zone-end` without a matching start must fail validation.
- Pivot content must pass through the same Markdown and directive processing as ordinary page content.

#### Example

- Source: [02-generative-ai.md](https://github.com/GraemeMalcolm/ai-skills-nav/blob/main/source/modules/ai-concepts/02-generative-ai.md)
- Rendered page: [Generative AI and agents](https://graememalcolm.github.io/ai-skills-nav/modules/ai-concepts/pages/02-generative-ai/index.html)

### 10.6 Knowledge checks

**FR-QUIZ-001** Quiz metadata must render as an interactive knowledge check rather than visible metadata or ordinary prose.

**FR-QUIZ-002** Each question must present its available answers, accept a learner response, and provide clear feedback.

**FR-QUIZ-003** Knowledge checks in this scope are formative. Unless a later requirement states otherwise, answers and scores do not need to be persisted or used for completion decisions.

**FR-QUIZ-004** Invalid questions, missing answers, or unsupported answer formats must fail content validation.

Quiz source is declared in page front matter:

```yaml
---
title: Quiz - Check your learning
quiz:
     - item:
               - question: Which store is optimized for real-time event data?\nA - Warehouse\nB - Lakehouse\nC - Eventhouse
                    answer: c
---
```

The `quiz` value is an ordered list. Each group contains an `item` list; each item contains `question` and `answer`. In the current source format, answer choices are embedded in `question` using newline escapes, and `answer` is the case-insensitive letter of the correct option.

Expected rendering behavior:

- Escaped newlines must become separate readable question and answer-choice lines.
- Question and option order must match the source.
- The correct answer must not be exposed before the learner submits a response.
- Feedback must identify whether the response is correct and allow the learner to understand or retry the question according to the product's assessment design.
- The production content model should evolve toward structured answer options while remaining compatible with the current source representation.

### 10.7 Labs

**FR-LAB-001** A page may offer hosted and self-directed lab variants through choice pivots.

**FR-LAB-002** Hosted-lab actions must clearly identify that an external environment will open and must preserve the learner's place in the content.

**FR-LAB-003** Self-directed lab instructions may be maintained locally or sourced from an approved external Markdown location.

**FR-LAB-004** Authors must invoke the standard hosted-lab launcher with `[!LAB_HOST[](<launch-url>)]` rather than duplicating its explanatory text, image, link target, or new-window behavior in module pages.

**FR-LAB-005** Hosted-lab launch URLs must preserve all authored path, query-string, and fragment components when substituted into the standard template.

**FR-LAB-007** Relative media referenced by the hosted-lab template must resolve from the template document and be published at a stable content path accessible from every generated route.

Example page combining hosted and self-directed lab choices:

```markdown
---
title: Exercise - Explore AI workloads
---

::: zone pivot="Use a hosted lab environment"

[!LAB_HOST[](https://www.skillable.com/login?lab_id=00000)]

::: zone-end

::: zone pivot="Use your own environment"

[!LAB_STEPS[](https://raw.githubusercontent.com/Example/Training/main/labs/exercise.md)]

::: zone-end
```

The hosted variant must use `LAB_HOST` with a governed launch URL. It renders the shared `templates/hosted-lab.md` content, substitutes the URL for `{LAB_URL}`, and resolves the launch image from the template's media folder. The self-directed variant must render the referenced instructions inline so learners remain within the module's navigation context.

#### Example

- Source: [01-ai-workloads.md](https://github.com/GraemeMalcolm/ai-skills-nav/blob/main/source/modules/hands-on-ai-concepts/01-ai-workloads.md)
- Rendered page: [Exercise - Explore AI workloads](https://graememalcolm.github.io/ai-skills-nav/modules/hands-on-ai-concepts/pages/01-ai-workloads/index.html)

## 11. Personal playlists

Personal playlists are learner-defined ordered collections of modules. Their production persistence mechanism may be browser-local, account-based, or both; this decision must not change the learner-facing behaviors below.

**FR-PERSONAL-001** A learner must be able to create a personal playlist with a required name and optional description.

**FR-PERSONAL-002** Playlist names must be trimmed, non-empty, length-limited, and unique within the learner's collection using case-insensitive comparison.

**FR-PERSONAL-003** A learner must be able to add a module from module cards, module overviews, and module pages to an existing or newly created personal playlist.

**FR-PERSONAL-004** Adding the same module more than once to one playlist must not create a duplicate.

**FR-PERSONAL-005** A learner must be able to view, start, reorder, remove modules from, and delete a personal playlist. Destructive deletion must require confirmation.

**FR-PERSONAL-006** Changes must be reflected immediately in the playlist overview and contextual navigation.

**FR-PERSONAL-007** Opening a module from a personal playlist must preserve playlist context, stored module order, page navigation, and cross-module Previous and Next behavior.

**FR-PERSONAL-008** If a referenced module has been withdrawn, the playlist must remain usable, clearly omit or identify the unavailable item, and must not prevent access to remaining modules.

**FR-PERSONAL-009** A personal playlist detail page must offer a Share action consistent with courses, curated playlists, and modules.

**FR-PERSONAL-010** A shared personal-playlist URL must encode the playlist identifier, display name, and ordered module identifiers.

**FR-PERSONAL-011** When a shared link is opened, an existing playlist with that identifier must be loaded without being overwritten by URL data.

**FR-PERSONAL-012** If the identifier does not exist for the learner, the solution must create and open a playlist from the shared name and all valid module identifiers. Unknown or duplicate module identifiers must be ignored safely.

**FR-PERSONAL-013** The product must disclose whether personal playlists are device-local or synchronized to an account and define the expected behavior for signed-out learners.

## 12. Sharing and URLs

Each course, playlist, module, and individual page must be accessible via deep-linked URL that users can share, or which can be included in Microsoft websites, blogs, and social media posts.

**FR-SHARE-001** Course, curated-playlist, module, page, and personal-playlist experiences must provide a Share action that exposes a copyable URL.

**FR-SHARE-002** Shared URLs must be stable, canonical, and usable without navigation history.

**FR-SHARE-003** A shared URL must restore the referenced item and any valid course, curated-playlist, or personal-playlist context necessary to continue the journey.

**FR-SHARE-004** URL parameters must be validated and treated as untrusted input. Invalid optional context must not prevent access to otherwise valid public content.

**FR-SHARE-005** Sharing must not expose private learner data, authentication credentials, progress, or content that the recipient is not authorized to access.

**FR-SHARE-006** Every published course overview, curated-playlist overview, and module overview rendered under the single-page and multi-page presentation rules must have a stable link that any recipient can open without signing in or otherwise authenticating.

**FR-SHARE-007** Opening a public overview link must display the overview rather than redirecting the recipient to authentication. Authentication may be required for protected learning content, hosted labs, personalization, progress, or other restricted actions reached from the overview, but those restrictions must not prevent anonymous access to the overview itself.

## 13. Accessibility and responsive behavior

**NFR-ACCESS-001** The production experience must conform to WCAG 2.2 AA.

**NFR-ACCESS-002** All functionality must be available by keyboard with visible focus indicators and logical focus order.

**NFR-ACCESS-003** Pages must use meaningful landmarks, headings, link text, labels, alternative text, and programmatic state for navigation, dialogs, tabs, status messages, and interactive content.

**NFR-ACCESS-004** Dynamic search results, empty states, playlist updates, validation feedback, and quiz feedback must be announced appropriately without disruptive focus changes.

**NFR-ACCESS-005** The interface must support browser zoom, text reflow, reduced motion, high contrast, and screen readers.

**NFR-RESP-001** All catalog, detail, learning, navigation, dialog, and interactive-content experiences must remain usable from 320-pixel mobile viewports through large desktop displays.

**NFR-RESP-002** Responsive changes must preserve content order, current context, and feature parity.

## 14. Reliability, security, and performance

**NFR-REL-001** A failure in optional capabilities, preferences, analytics, media, or externally sourced content must not make unrelated published content unavailable.

**NFR-REL-002** Invalid saved learner data must be handled safely and must not prevent the application from loading.

**NFR-SEC-001** Content and URL input must be validated and safely encoded. Remote content and raw HTML must be sanitized according to an approved security policy.

**NFR-SEC-002** Access controls must apply consistently to catalog visibility, direct links, reusable content, media, and shared URLs.

**NFR-SEC-003** External embeds and new-window links must use appropriate browser isolation and content-security controls.

**NFR-PERF-001** Primary page content and navigation must remain usable while optional media or interactive components load.

**NFR-PERF-002** Images and media should use responsive sizing, appropriate formats, and deferred loading when they are not immediately visible.

**NFR-OBS-001** The production solution must provide operational telemetry for publication failures, broken content references, page failures, search failures, and external-content retrieval failures without collecting unnecessary learner content.

## 15. Acceptance scenarios

The production implementation must demonstrate at least the following end-to-end scenarios:

1. An author publishes a course containing two ordered playlists, each containing reusable modules, and the learner can navigate continuously through the complete hierarchy.
2. A single-page module opens directly, while a multi-page module opens an overview and proceeds through its pages in source order.
3. A playlist ordered as single-page Module A, multi-page Module B, and single-page Module C produces the effective sequence Playlist overview, Page A1, Module B overview, all Module B pages, and Page C1. Previous and Next traverse that exact sequence in both directions while all three modules remain visible in hierarchy navigation.
4. A single-module playlist omits a redundant playlist overview and opens the module's effective first step while retaining playlist context.
5. The same module opens independently and within different playlists without duplicated source content or incorrect navigation context.
6. A catalog item matches terms present in its title, description, or topics. The same item does not match a term found only in its audience, experience type, level, modality, duration, identifier, hierarchy references, or page body.
7. Audience, experience type, level, and modality values refine results through filters. Multiple values in one filter use OR; different filters use AND; and active search terms combine with all filters using AND.
8. Clearing search retains active filters, clearing filters retains an active search, active constraints are visible, and an empty combined result produces accessible feedback.
9. A page renders Markdown, local and root-relative includes, an external `[!LAB_STEPS]` source, a `[!LAB_HOST]` launcher with its full URL and template-relative image, relative images, video, and keyboard-operable choice pivots.
10. Invalid metadata, broken hierarchy references, recursive includes, and inaccessible required external content prevent publication with actionable errors.
11. A learner creates a personal playlist, adds modules from multiple entry points, reorders it, traverses module boundaries, removes a module, and deletes the playlist.
12. A recipient opens a shared personal-playlist URL. An existing playlist is loaded unchanged; when it is absent, a new playlist is created from the shared name and valid ordered module identifiers.
13. A learner opens a deep link to a page with valid hierarchy context and can move backward and forward without losing that context.
14. A signed-out recipient opens shared links to a published course overview, curated-playlist overview, and multi-page module overview and can view each overview without an authentication prompt or redirect. Any protected downstream action communicates its own authentication requirement only when invoked.
15. All preceding learner journeys are operable by keyboard and screen reader on both narrow and wide layouts.

## 16. Product decisions required before implementation

The product owner and production team must resolve these decisions during planning:

- Whether personal playlists and content progress are anonymous/device-local, account-synchronized, or both.
- Whether learner progress, completion, bookmarks, and quiz attempts are in scope.
- Whether the contextual learning assistant is part of the initial production release and, if so, its content, safety, privacy, and service requirements.
- Which content management and approval workflow will replace or complement direct source-file authoring.
- Which external Markdown domains are trusted and how remote content is pinned, cached, reviewed, and refreshed.
- Which raw HTML and Microsoft Learn authoring directives are supported.
- The canonical URL, redirect, localization, versioning, archival, and withdrawn-content policies.
- Search ranking, synonyms, typo tolerance, analytics, and scale targets beyond the proof-of-concept behavior.
- Authentication, authorization, privacy, retention, geographic, and compliance requirements.
- Availability, performance, browser-support, and service-level targets.

## 17. Suggestions for future AI agent integration

While the integration of interactive AI agents is outside the scope of this document, the proof-of-concept encapsulates a suggested approach in which multiple domain-specific agent personalities are available in the site, and can be associated with modules, playlists, and courses to ensure a consistent subject-matter expert AI is available to support each curriculum area. An additional default agent persona is available to support the site in general.

Each agent personality uses a common base LLM and agent definition with "pluggable" avatar images, voices, and knowledge bases.

In the POC, the available avatars are defined in a central [avatars](https://github.com/GraemeMalcolm/ai-skills-nav/tree/main/avatars) folder and assigned by name to a content asset in its metadata using the `avatar` property.

As a result, the assigned avatar is used in any AI integration within the mapped content asset. For example, [AI Development content assets](https://graememalcolm.github.io/ai-skills-nav/modules/develop-first-agent/index.html) use the *Anton* avatar, as seen in the *Ask Anton* popup chat interface and in [Quizzes](https://graememalcolm.github.io/ai-skills-nav/modules/ai-concepts/pages/09-knowledge-check/index.html).

The domain-specific avatar names, images, and voices are based on the Synthesia avatars used in AI-generated videos within the Microsoft Official Curriculum content.
