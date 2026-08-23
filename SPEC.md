# Specification for a GitHub Pages-based learning site

This is a spec for a GitHub-based site that learners can use to find and consume training materials. The source for the training materials is provided in the GitHub repo as markdown and YAML files. On merging to main, the GitHub build process creates a GitHub pages site that presents the content as HTML.

## Content architecture

Thos section describes how the content source is organized in the repo.

### Modules

The core unit of learning asset in the site is a "module". Modules are defined in the /modules folder in which a subfolder exists for each available skillng module. Each module consists of:

- A module.yml file that defines the metadata for the module.
- A thumbnail.png file that is used to represent the module visually in the site interface.
- One or more markdown files to represent the pages of content in the module. Each page file inclides a metadata section in YAML format to define page-level metadata (such as the title), and markdown content for the page.
- A media subfolder containing images that are included in the pages.

A module can contain one or more pages, designed to be consumed in the order defined in the module metadata. There is a markdown file for each page.

### Playlists

A playlist is an ordered collection of related modules that provides a curated learning path. Playlists are defined in the /playlists folder, where there is a folder for each playlist.

Each playlist consists of:

- A playlist.yml file that defines the metadata for the playlist - including which modules it includes.
- A thumbnail.png file that is used to represent the playlist visually in the site interface.

### labs

A lab is a collection of practical exercises that enable the learner to engage in a hands-on learning experience. Labs are defined in the `/MicrosoftLearning` folder, in which there is a folder for each lab. Each lab consists of:

- One or more markdown files, each including a lab metadata section (in YAML format) and markdown instructions.
- A media subfolder containing images that are included in the exercises.

## GitHub Pages site structure

The GitHub pages site for the repo should consist of a "Home" page with the title "Skilling in the Name of...", on which the availableaylists and modules are shown as a grid of thumbnails, each with the playlist or module title under it. The page should be slit into two vettical sections, the first listing playlists, the second listing modules.

### Navigation

When the user selects a *playlist*, it should open as a page with a collabsible navigation pane on the left in which the playlist title is displayed at the top in bold text, with the modules in the playlist listed vertically beneath it (using the title metada value for each module) in regular text format. The list should be in the order defined in the playlist metada. By default, the playlist title should be selected in the navigation pane.

When the playlist title is selected in the navigation pane, the main content pane should show the playlist thumbnail and title, and its description (from the metadata).

When the user selects a module in the navigation pane, if the module contains multiple pages, the content pane should show the module thumbnail and description and a "Start" button to allow the user to start viewing the module. If the module contans only one page, selecting it in the navigation pane should display the module's only page in the content pane (skipping the module "start" page).

Modules with multiple pages should include a navigation control at the bottom of each page (other than the "start" page) with a "< Previous" button, a drop-down list of the page titles, and a " Next >" button. This enables users to navigate to specific pages in the module using the order defined in the module metata. On the first page, the "< Previous" button should be disabled; and on the last page, the "Next >" button should be disabled.

When the user selects a *module* on the home page, the module's "start" page (or its only page if it only containes one page) should be displayed. In this scenario, there should be no navigation pane.

### Module content

Module pages should be rendered as HTML based on the markdown they contain. In most cases, a typical markdown rendering engine will be sufficient; however, there are some custom markdown elements that require special handling.

#### Module page titles

The title of each module page is oncluded in its YAML metadata section (at the beginning of the page). This should be rendered as an H1 heading at the top of the module page.

#### Zone Pivots

Module pages can include sections marked as follows:

```
::: zone pivot="<zone-1-name>"

<zone-1-content>

::: zone-end

::: zone pivot="<zone-2-name>"

<zone-2-content>

::: zone-end

<and so on>
```

Each zone pivot should be rendered as a "tabbed" section with the zone name displayed as a tab and its content displayed underneath. When there are multiple consecutive zone pivots immediately following one another, each zone should have a tab at the top of the section so the user can switch between them and display the zone content dynamically.

If there is "unzoned" content between a zone-end marker and a new zone pivot marker, a new tabbed section should be created.

#### Videos

When a page contains a [!VIDEO <url>] tag, it should be rendered as an embedded video using an iframe for the URL (which should provide the video player interface). The default size should be 800x600, with the option to expand to full screen.

#### Includes

When a page contains an [!INCLUDE <path>] tag, the referenced markdown file should be rendered in-place within the page. This is most commonly used to embed markdown files from the /lab folder hierarchy into module pages. Note that the referenced markdown may itself contain images with relative paths, which must be rendered properly in the module page.
