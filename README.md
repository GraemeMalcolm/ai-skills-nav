# AI Skills Nav

(or if you prefer, *Page against the machine - Skilling in the name of...*)

This repo contains a hypothetical design for an online skilling platform.

> **IMPORTANT**: This site is a *personal* project, <u>not</u> an indication of any future direction for the official Microsoft AI Skills Navigator platform.

## Content architecture

The content architecture consists of:

- **Courses**: Curated curricula that can be consumed online as self-paced learning or as instructor-led training. Courses can consist of one or more...
  - **Playlists**: Curated or self-defined learning paths (self-created playlists are not currently supported in this proof-of-concept). Each playlist contains one or more...
    - **Modules**: The core learning asset in the platform. Modules have a *type* based on the kind of content they predominantly contain - for example, "Lab" or "Video". In most cases of core curriculum, the module type is "Multimodal". Modules contain one or more...
      - **Pages**: A unit of content encapsulated in a web page (think of each page as covering a discrete *topic*). Pages can contain a mix of content assets, including video, text, images, lab exercises, and others.

The source definitions for the content assets in the catalog are in the [./source](/source/) folder of the repo. They consist of a combination of:

- Markdown files to define page content.
- YAML files to define course, playlist, and module metadata.
- Thumbnail images.

## Site navigation

You can navigate the site using the <a href = "https://graememalcolm.github.io/ai-skills-nav/" target = "_blank">GitHub pages for this repo</a>.

- The main online experience for most users is to either complete a curated *playlist* or find the specific *modules* they're most interested in. *Courses* are presented in a separate page due to their status as official curricula. Courses often align to Microsoft certifications.
- Users can *search* for playlists and modules using keywords (for example "Copilot" or "Microsoft Foundry"), and they can *filter* modules based on *audience* (target role), *level* (100-500), and *type* (modality). They can search and filter courses in a similar way, including the ability to search by course number (e.g. "AI-3026").
- Playlists provide a navigation pane so users can progress through the modules in the playlist.
- Multi-page modules start with s standard "Overview" page, while 1-page modules skip this and open the main content page directly.
- Multi-page modules provide page navigation using a "Previous" and "Next" navigation control at the bottom of each page.
- Some pages include *zone pivots* that enable the user to choose between alternative presentations of content (for example, choosing between a video and the equivalent static text/graphics, or choosing between a hosted lab environment and using their own).

## AI Interactivity

An additional feature of the site is the *personification* of AI assistance. The site supports multiple possible *avatars*, each with a specific curricular specialty. For example *Alex* is the AI persona associated with Azure Databricks training, while *Anton* is the AI persona for AI development. The intention is for users to to build trusted affinity with a familiar "face" of their chosen area of study.

Avatars are associated at the *module* level, and any module associated with an avatar presents an "Ask *avatar*" chat interface while the user is in the module.

> **NOTE**: In this proof-of-concept implementation of the site, the chat interface is constrained to *basic* mode in which no AI model is used. The avatar responds to questions based on simple keyword matching. To see an example of an agent using a real model, check out the <a href="https://aka.ms/choose-anton" target = "_blank">Ask Anton</a> app.
