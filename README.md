# AI Skills Nav

*(Or, if you prefer, **Page against the machine - Skilling in the name of...**)*

AI Skills Nav is a fully-functional proof-of-concept online skilling platform. It turns Markdown and YAML source content into a static learning site for GitHub Pages.

> **IMPORTANT**: This site is a personal project, not an indication of any confirmed future direction for the official Microsoft AI Skills Navigator platform.

Explore the deployed site at [graememalcolm.github.io/ai-skills-nav](https://graememalcolm.github.io/ai-skills-nav/).

## Content architecture

The goal of this proof-of-concept is to validate a design for a standardized content architecture that meets the following competing goals:

- Deliver a rich, flexible, and intuitive experience for learners consuming content in a wide range of modalities and structures.
- Standardize back-end source content organization to ensure consistent, scalable, and manageable content management and publishing processes.

Content is organized into the following hierarchy:

- **Courses**: Microsoft Official Curricula that can be completed as self-paced learning or delivered as instructor-led training. A course includes one or more playlists and can be aligned to multiple credentials.
  - **Playlists**: Ordered, curated collections containing one or more modules (equivalent of *Learning Paths* in Microsoft Learn). Learners can also create *personal* playlists containing modules of their choice.
    - **Modules**: The core learning assets. Metadata describes each module's modality, level, duration, topics, audience, pages, and optional avatar.
      - **Pages**: Discrete topics that can combine text, images, video, labs, and other content (known as *units* in Microsoft Learn).

Catalog source is stored under **[source](./source/)**:

- `source/courses/<course>/course.yml` defines course metadata and playlist membership.
- `source/playlists/<playlist>/playlist.yml` defines playlist metadata and module order.
- `source/modules/<module>/module.yml` defines module metadata and page order.
- Markdown files in each module folder provide page content.
- `thumbnail.png` and optional `media` folders provide visual assets.

Additionally, reusable lab content and media are stored under `MicrosoftLearning` as a proxy for the current separate MicrosoftLearning GitHub repository for single-source labs. Labs are included in pages via an `INCLUDE` reference.

## Site experience

The proof-of-concept catalog currently contains:

- 6 courses
- 12 curated playlists
- 26 learning modules
- 4 specialist learning-assistant avatars, plus the default Nav assistant

The catalog includes a mix of module types and subject areas, enabling exploration of the browsing, searching, and filtering experiences supported by the content architecture.

### Discovery and navigation

- The home page highlights courses, curated playlists, and new or popular skilling content.
- Dedicated catalog pages show all courses, playlists, or modules.
- The home banner provides an animated natural-language search prompt across all catalog items; the five example prompts run once per page load and settle on “Build the skills you need.”
- Dedicated catalog pages place Search and Filter controls above the card grid. Search clear actions appear beneath the right edge of their search fields.
- Keyword search covers titles, descriptions, topics, course numbers, and experience types where applicable, using case-insensitive AND matching after conversational stop words are removed.
- Filters cover audience, experience type, level, and modality. Playlist and course modalities are derived from their modules.
- Catalog cards expose descriptions as tooltips.
- Breadcrumbs provide context throughout the generated site.
- Curated playlists include a collapsible navigation pane listing their modules in the defined order.
- A single-page module opens its content directly. A multi-page module opens an overview with a page list and **Start** action.
- Multi-page modules provide **Previous**, **Next**, and page-selection controls.

### Accounts and personalization

The static proof of concept simulates sign-in by accepting a syntactically valid email address and a non-empty password. Only the email address is retained in browser `localStorage`; the password is discarded. Content with `restricted_to` metadata is visible only when the signed-in email domain matches an allowed domain. This client-side behavior demonstrates the experience and is not a security boundary for confidential content.

Signed-in users can open **Profile** to view their email address, choose a role from audiences represented by content they can access, open their personal playlists, and launch a personalized skilling plan. The plan contains all accessible courses, curated playlists, and modules whose audience includes the selected role, followed by the user's personal playlists.

### Personal playlists

Personal playlists require sign-in. Learners can create named playlists, optionally add or edit a description, and add modules from cards, module overviews, or pages. Opening a personal playlist restores playlist navigation while moving through its modules. Modules can be reordered or removed, and playlists can be edited, shared, or deleted.

Personal playlists are saved in browser `localStorage` under a key containing the normalized signed-in email address. This isolates users on the same browser, but playlists remain on that browser and device only; they are not synchronized to a backend account.

### Rich learning content

The static-site generator supports:

- GitHub Flavored Markdown.
- Recursive Markdown includes using `[!INCLUDE ...]` to enable page reuse across multiple modules, including correct rewriting of relative image paths.
- Responsive embedded video using `[!VIDEO: <url>]`, with YouTube, Synthesia, Microsoft Learn, etc. links converted to privacy-enhanced embeds.
- Consecutive `::: zone pivot="..."` blocks rendered as accessible tabbed content for user-choice modality (video vs static, hosted lab vs BYOS, ...)
- Remembering a learner's selected zone pivot for other matching pivots in the same module.
- Markdown links marked with `{target="_blank"}` to open in a new tab and avoid breaking learner flow.
- Responsive navigation and keyboard-accessible controls.

## Contextual AI Learning assistants

Courses, Playlists, and Modules can be associated with one of four specialist avatars:

- **Alex** - Azure Databricks
- **Anton** - AI development and Microsoft Foundry
- **Inna** - Microsoft Fabric
- **Matt** - Microsoft Copilot and Microsoft 365 business workloads

Avatar configuration, knowledge, images, and audio are stored under `avatars`. An **avatar** metadata value  is used to associate the relevant avatar for the content subject matter of the content.

Associated content pages display an **Ask *avatar*** chat panel with a welcome message and suggested prompts.

The proof of concept does **not** use a generative AI model. Instead, it:

- Searches curated local avatar knowledge using keyword and phrase matching, with lightweight spelling correction.
- Returns related learning and video links from the avatar's knowledge data.
- Recognizes documentation and search requests and queries the public Microsoft Learn MCP endpoint, with a Microsoft Learn search fallback.
- Offers a Bing search when no local answer is available.
- Applies a basic prohibited-word list before processing questions.
- Supports browser speech recognition when available and plays avatar audio feedback for spoken interactions.

For an example of an agent backed by a real model, see the [Ask Anton app](https://aka.ms/choose-anton).

## Technical deployment details

The site is designed as a fully functional proof of concept hosted in GitHub Pages.

### Auto-build on deployment

The GitHub Actions workflow runs on pushes to `main` and can also be started manually. It installs the build dependencies, runs `npm run build`, uploads `dist` as a GitHub Pages artifact, and deploys it to GitHub Pages.

### Build locally

You can build the site locally for testing purposes using the `build.mjs` script provided. The site generator requires Node.js. The deployment workflow uses Node.js 22.

```console
npm install
npm run build
```

The build validates references and required avatar assets, then writes the complete static site to `dist`. Because generated pages use relative URLs, serve that folder with any local static HTTP server when previewing it; opening pages directly from the file system is not recommended.
