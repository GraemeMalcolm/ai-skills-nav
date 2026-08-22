# AI Skills Navigator

This repository contains Markdown and YAML source for a GitHub Pages learning site. The generated site provides a catalog of playlists and modules, playlist navigation, ordered module pages, zone pivots, embedded videos, and Markdown includes.

## Local build

Node.js 20 or newer is required.

```powershell
npm install
npm run build
```

The build recreates the `dist` directory. Open `dist/index.html` to inspect the generated site; all generated links are relative, so the same output works locally and under a GitHub project Pages URL.

## Content

- Add modules under `modules/<module-name>` with `module.yml`, `thumbnail.png`, and the page files listed by `pages`.
- Add playlists under `playlists/<playlist-name>` with `playlist.yml`, `thumbnail.png`, and module folder names listed by `modules`.
- Add reusable exercises under `labs`; include them in module pages with `[!INCLUDE[](path)]`.
- Use `[!VIDEO URL]` or `[!VIDEO: URL]` for embedded video.
- Use consecutive `::: zone pivot="Name"` and `::: zone-end` blocks to create tabbed content.

The build fails when metadata references a missing module, page, or include.

## GitHub Pages

The `Build and deploy GitHub Pages` workflow runs on pushes to `main` and can also be started manually. In the repository settings, set **Pages > Build and deployment > Source** to **GitHub Actions**. The workflow installs dependencies, generates `dist`, uploads it as the Pages artifact, and deploys it to the `github-pages` environment.