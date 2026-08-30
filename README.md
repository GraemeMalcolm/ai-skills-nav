# AI Skills Nav

*(Or, if you prefer, **Page against the machine - Skilling in the name of...**)*

AI Skills Nav is a proof-of-concept online skilling platform. It turns Markdown and YAML source content into a static learning site for GitHub Pages.

> **IMPORTANT**: This site is a personal project, not an indication of any future direction for the official Microsoft AI Skills Navigator platform.

Explore the deployed site at [graememalcolm.github.io/ai-skills-nav](https://graememalcolm.github.io/ai-skills-nav/).

## Current catalog

The generated catalog currently contains:

- 5 courses
- 9 curated playlists
- 24 learning modules
- 4 learning-assistant avatars

The catalog includes content about artificial intelligence, Microsoft Foundry, Microsoft 365 Copilot, Microsoft Fabric, Azure Databricks, AI agents, Microsoft Build announcements, leadership, and career development.

## Content architecture

Content is organized into the following hierarchy:

- **Courses**: Microsoft Official Curricula that can be completed as self-paced learning or delivered as instructor-led training. A course can include one or more playlists and can identify an associated credential.
  - **Playlists**: Ordered, curated learning paths containing one or more modules. Learners can also create personal playlists in their browser.
    - **Modules**: The core learning assets. Metadata describes each module's modality, level, duration, topics, audience, pages, and optional avatar.
      - **Pages**: Discrete topics that can combine text, images, video, labs, and other learning assets.

Catalog source is stored under `source`:

- `source/courses/<course>/course.yml` defines course metadata and playlist membership.
- `source/playlists/<playlist>/playlist.yml` defines playlist metadata and module order.
- `source/modules/<module>/module.yml` defines module metadata and page order.
- Markdown files in each module folder provide page content.
- `thumbnail.png` and optional `media` folders provide visual assets.
- Reusable lab content and media are stored under `MicrosoftLearning` and can be included in module pages.

Avatar configuration, knowledge, images, and audio are stored under `avatars`.

## Site experience

### Discovery and navigation

- The home page highlights courses, curated playlists, and new or popular skilling content.
- Dedicated catalog pages show all courses, playlists, or modules.
- Keyword search covers titles, descriptions, topics, and course numbers where applicable.
- Courses can be filtered by audience, level, and duration.
- Curated playlists can be filtered by audience and level.
- Modules can be filtered by audience, level, and modality.
- Catalog cards expose descriptions as tooltips.
- Breadcrumbs provide context throughout the generated site.
- Curated playlists include a collapsible navigation pane listing their modules in the defined order.
- A single-page module opens its content directly. A multi-page module opens an overview with a page list and **Start** action.
- Multi-page modules provide **Previous**, **Next**, and page-selection controls.

### Personal playlists

Learners can create named personal playlists, optionally add a description, and add modules from any module overview or page. Opening a personal playlist restores playlist navigation while moving through its modules. Personal playlists can also be deleted.

Personal playlists are saved in browser `localStorage`. They remain on the current browser and device only; they are not synchronized to an account or stored by a backend service.

### Rich learning content

The static-site generator supports:

- GitHub Flavored Markdown.
- Recursive Markdown includes using `[!INCLUDE ...]`, including correct rewriting of relative image paths.
- Responsive embedded video using `[!VIDEO: <url>]`, with YouTube links converted to privacy-enhanced embeds.
- Consecutive `::: zone pivot="..."` blocks rendered as accessible tabbed content.
- Remembering a learner's selected zone pivot for other matching pivots in the same module.
- Markdown links marked with `{target="_blank"}`.
- Responsive navigation and keyboard-accessible controls.

## Learning assistants

Modules can be associated with one of four specialist avatars:

- **Alex** - Azure Databricks
- **Anton** - artificial intelligence and Microsoft Foundry
- **Inna** - Microsoft Fabric
- **Matt** - Microsoft Copilot and Microsoft 365 business workloads

Associated modules display an **Ask _avatar_** chat panel with a welcome message and suggested prompts. The proof of concept does **not** use a generative AI model. Instead, it:

- Searches curated local avatar knowledge using keyword and phrase matching, with lightweight spelling correction.
- Returns related learning and video links from the avatar's knowledge data.
- Recognizes documentation and search requests and queries the public Microsoft Learn MCP endpoint, with a Microsoft Learn search fallback.
- Offers a Bing search when no local answer is available.
- Applies a basic prohibited-word list before processing questions.
- Supports browser speech recognition when available and plays avatar audio feedback for spoken interactions.

For an example of an agent backed by a real model, see the [Ask Anton app](https://aka.ms/choose-anton).

## Build locally

The site generator requires Node.js. The deployment workflow uses Node.js 22.

```console
npm install
npm run build
```

The build validates references and required avatar assets, then writes the complete static site to `dist`. Because generated pages use relative URLs, serve that folder with any local static HTTP server when previewing it; opening pages directly from the file system is not recommended.

## Deployment

The GitHub Actions workflow runs on pushes to `main` and can also be started manually. It installs the build dependencies, runs `npm run build`, uploads `dist` as a GitHub Pages artifact, and deploys it to GitHub Pages.
