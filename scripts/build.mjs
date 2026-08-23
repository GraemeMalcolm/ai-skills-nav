import { copyFile, cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { marked } from "marked";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(root, "dist");
const contentRoots = ["modules", "playlists", "labs"];

marked.setOptions({ gfm: true });

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

marked.use({
  extensions: [{
    name: "targetBlankLink",
    level: "inline",
    start(source) {
      return source.indexOf("[");
    },
    tokenizer(source) {
      const match = source.match(/^\[((?:!\[[^\]\r\n]*\]\([^\r\n)]+\)|[^\]\r\n]+))\]\(([^\s)]+)(?:\s+["']([^"']*)["'])?\)\{\s*:?\s*target\s*=\s*["']_blank["']\s*\}/i);
      if (!match) return undefined;
      return {
        type: "targetBlankLink",
        raw: match[0],
        href: match[2],
        title: match[3],
        tokens: this.lexer.inlineTokens(match[1]),
      };
    },
    renderer(token) {
      const title = token.title ? ` title="${escapeHtml(token.title)}"` : "";
      return `<a href="${escapeHtml(token.href)}"${title} target="_blank" rel="noopener noreferrer">${this.parser.parseInline(token.tokens)}</a>`;
    },
  }],
});

const toPosix = (value) => value.split(path.sep).join("/");
const pageSlug = (file) => path.basename(file, path.extname(file));

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readYaml(filePath) {
  const data = yaml.load(await readFile(filePath, "utf8"));
  if (!data || typeof data !== "object") {
    throw new Error(`Expected YAML mapping in ${path.relative(root, filePath)}`);
  }
  return data;
}

function parseFrontMatter(source, filePath) {
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
  if (!match) return { data: {}, body: source };
  const data = yaml.load(match[1]) ?? {};
  if (typeof data !== "object") {
    throw new Error(`Expected front matter mapping in ${path.relative(root, filePath)}`);
  }
  return { data, body: source.slice(match[0].length) };
}

async function loadCollection(folder, metadataFile) {
  const collectionRoot = path.join(root, folder);
  if (!(await exists(collectionRoot))) return [];
  const entries = await readdir(collectionRoot, { withFileTypes: true });
  return Promise.all(entries.filter((entry) => entry.isDirectory()).map(async (entry) => {
    const directory = path.join(collectionRoot, entry.name);
    const metadataPath = path.join(directory, metadataFile);
    if (!(await exists(metadataPath))) {
      throw new Error(`Missing ${folder}/${entry.name}/${metadataFile}`);
    }
    return { slug: entry.name, directory, ...(await readYaml(metadataPath)) };
  }));
}

function relativeUrl(fromFile, target) {
  const relative = path.relative(path.dirname(fromFile), target);
  return toPosix(relative || ".");
}

function isExternalUrl(value) {
  return /^(?:[a-z]+:|#|\/\/)/i.test(value);
}

function rewriteAssetUrl(value, sourceFile, outputFile) {
  if (!value || isExternalUrl(value)) return value;
  const [pathname, suffix = ""] = value.split(/(?=[?#])/u, 2);
  let sourceTarget = path.resolve(path.dirname(sourceFile), pathname);
  const nestedMediaTarget = path.resolve(path.dirname(sourceFile), "media", pathname);
  if (!existsSync(sourceTarget) && existsSync(nestedMediaTarget)) sourceTarget = nestedMediaTarget;
  const repoRelative = path.relative(root, sourceTarget);
  if (repoRelative.startsWith("..")) return value;
  return `${relativeUrl(outputFile, path.join(outputRoot, "content", repoRelative))}${suffix}`;
}

function rewriteMarkdownAssets(markdown, sourceFile, outputFile) {
  return markdown
    .replace(/(!\[[^\]]*\]\()([^\s)]+)([^)]*\))/g, (match, prefix, url, suffix) =>
      `${prefix}${rewriteAssetUrl(url, sourceFile, outputFile)}${suffix}`)
    .replace(/(<img\b[^>]*?\bsrc=["'])([^"']+)(["'][^>]*>)/gi, (match, prefix, url, suffix) =>
      `${prefix}${rewriteAssetUrl(url, sourceFile, outputFile)}${suffix}`);
}

async function expandIncludes(markdown, sourceFile, outputFile, stack = []) {
  const includePattern = /\[!INCLUDE(?:\[[^\]]*\])?\(([^)]+)\)\]|\[!INCLUDE\s+([^\]]+)\]/gi;
  let result = "";
  let cursor = 0;
  for (const match of markdown.matchAll(includePattern)) {
    result += rewriteMarkdownAssets(markdown.slice(cursor, match.index), sourceFile, outputFile);
    const includeReference = (match[1] || match[2]).trim();
    const includePath = path.resolve(path.dirname(sourceFile), includeReference);
    if (!includePath.startsWith(root) || stack.includes(includePath)) {
      throw new Error(`Invalid or recursive include ${includeReference} in ${path.relative(root, sourceFile)}`);
    }
    if (!(await exists(includePath))) {
      throw new Error(`Missing include ${includeReference} in ${path.relative(root, sourceFile)}`);
    }
    const included = parseFrontMatter(await readFile(includePath, "utf8"), includePath);
    result += await expandIncludes(included.body, includePath, outputFile, [...stack, includePath]);
    cursor = match.index + match[0].length;
  }
  return result + rewriteMarkdownAssets(markdown.slice(cursor), sourceFile, outputFile);
}

function videoEmbed(url) {
  let source = url.trim();
  const shortYouTube = source.match(/^https?:\/\/youtu\.be\/([^?&#/]+)/i);
  const longYouTube = source.match(/^https?:\/\/(?:www\.)?youtube\.com\/watch\?[^\s]*v=([^&#]+)/i);
  if (shortYouTube || longYouTube) {
    source = `https://www.youtube-nocookie.com/embed/${shortYouTube?.[1] || longYouTube?.[1]}`;
  }
  return `<div class="video-frame"><iframe src="${escapeHtml(source)}" title="Embedded video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe></div>`;
}

function parseMarkdown(markdown) {
  return marked.parse(markdown);
}

function renderMarkdown(markdown) {
  const videoPattern = /^\s*\[!VIDEO\s*:?\s*(https?:\/\/[^\]\s]+)\]\s*$/gim;
  const chunks = [];
  let cursor = 0;
  for (const match of markdown.matchAll(videoPattern)) {
    const beforeVideo = markdown.slice(cursor, match.index).trim();
    if (beforeVideo) chunks.push(parseMarkdown(beforeVideo));
    chunks.push(videoEmbed(match[1]));
    cursor = match.index + match[0].length;
  }
  const afterVideo = markdown.slice(cursor).trim();
  if (afterVideo) chunks.push(parseMarkdown(afterVideo));
  return chunks.join("\n");
}

function renderZones(markdown, groupSeed) {
  const lines = markdown.split(/\r?\n/);
  const chunks = [];
  let plain = [];
  let index = 0;
  let groupIndex = 0;

  const flushPlain = () => {
    const value = plain.join("\n").trim();
    if (value) chunks.push(renderMarkdown(value));
    plain = [];
  };

  while (index < lines.length) {
    const zoneStart = lines[index].match(/^::: zone pivot=["']([^"']+)["']\s*$/);
    if (!zoneStart) {
      plain.push(lines[index++]);
      continue;
    }

    flushPlain();
    const zones = [];
    while (index < lines.length) {
      const start = lines[index].match(/^::: zone pivot=["']([^"']+)["']\s*$/);
      if (!start) break;
      index++;
      const content = [];
      while (index < lines.length && !/^::: zone-end\s*$/.test(lines[index])) content.push(lines[index++]);
      if (index >= lines.length) throw new Error(`Unclosed zone pivot "${start[1]}"`);
      index++;
      zones.push({ title: start[1], html: renderMarkdown(content.join("\n")) });
      const blankStart = index;
      while (index < lines.length && !lines[index].trim()) index++;
      if (!/^::: zone pivot=/.test(lines[index] || "")) {
        index = blankStart;
        break;
      }
    }

    const groupId = `${groupSeed}-${groupIndex++}`;
    chunks.push(`<section class="pivot" data-pivot>
      <div class="pivot-tabs" role="tablist" aria-label="Content format">
        ${zones.map((zone, zoneIndex) => `<button type="button" role="tab" id="${groupId}-tab-${zoneIndex}" aria-controls="${groupId}-panel-${zoneIndex}" aria-selected="${zoneIndex === 0}" tabindex="${zoneIndex === 0 ? 0 : -1}">${escapeHtml(zone.title)}</button>`).join("")}
      </div>
      ${zones.map((zone, zoneIndex) => `<div class="pivot-panel" role="tabpanel" id="${groupId}-panel-${zoneIndex}" aria-labelledby="${groupId}-tab-${zoneIndex}"${zoneIndex === 0 ? "" : " hidden"}>${zone.html}</div>`).join("")}
    </section>`);
  }
  flushPlain();
  return chunks.join("\n");
}

async function renderMarkdownPage(sourceFile, outputFile, seed) {
  const parsed = parseFrontMatter(await readFile(sourceFile, "utf8"), sourceFile);
  const expanded = await expandIncludes(parsed.body, sourceFile, outputFile, [sourceFile]);
  return {
    title: parsed.data.title || parsed.data.lab?.title || pageSlug(sourceFile),
    html: renderZones(expanded, seed),
  };
}

function icon(name) {
  const icons = {
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
  };
  return icons[name];
}

function shell({ outputFile, title, content, sidebar = "", eyebrow = "AI Skills Nav", bodyClass = "" }) {
  const styles = relativeUrl(outputFile, path.join(outputRoot, "assets", "styles.css"));
  const script = relativeUrl(outputFile, path.join(outputRoot, "assets", "app.js"));
  const home = relativeUrl(outputFile, path.join(outputRoot, "index.html"));
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f7f5f2">
  <title>${escapeHtml(title)} | AI Skills Nav</title>
  <link rel="stylesheet" href="${styles}">
  <script src="${script}" defer></script>
</head>
<body class="${escapeHtml(bodyClass)}">
  <a class="skip-link" href="#main-content">Skip to content</a>
  <header class="site-header">
    <a class="brand" href="${home}"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>${escapeHtml(eyebrow)}</span></a>
    ${sidebar ? `<button class="icon-button menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded="true" data-menu-toggle>${icon("menu")}</button>` : ""}
  </header>
  <div class="site-frame${sidebar ? " has-sidebar" : ""}">
    ${sidebar}
    <main id="main-content" class="main-content">${content}</main>
  </div>
</body>
</html>`;
}

async function writePage(outputFile, html) {
  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, html, "utf8");
}

function metadataLine(item) {
  return [item.modality, item.level ? `Level ${item.level}` : "", item.duration].filter(Boolean).map(escapeHtml).join(" · ");
}

function thumbnail(outputFile, item, type) {
  const source = path.join(item.directory, "thumbnail.png");
  const target = path.join(outputRoot, "content", type, item.slug, "thumbnail.png");
  return `<img src="${relativeUrl(outputFile, target)}" alt="" loading="lazy">`;
}

function card(outputFile, item, type) {
  const target = path.join(outputRoot, type, item.slug, "index.html");
  return `<a class="content-card" href="${relativeUrl(outputFile, target)}">
    <span class="card-image">${thumbnail(outputFile, item, type)}</span>
    <span class="card-body"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(metadataLine(item))}</span></span>
  </a>`;
}

function overview(outputFile, item, type, action = "") {
  return `<article class="overview">
    <div class="overview-image">${thumbnail(outputFile, item, type)}</div>
    <div class="overview-copy">
      <p class="kicker">${escapeHtml(type === "playlists" ? "Learning playlist" : "Learning module")}</p>
      <h1>${escapeHtml(item.title)}</h1>
      <p class="lede">${escapeHtml(item.description || "")}</p>
      ${metadataLine(item) ? `<p class="metadata">${metadataLine(item)}</p>` : ""}
      ${action}
    </div>
  </article>`;
}

function pageNavigation(outputFile, pages, currentIndex, pageTargets) {
  const previous = currentIndex > 0 ? relativeUrl(outputFile, pageTargets[currentIndex - 1]) : "";
  const next = currentIndex < pages.length - 1 ? relativeUrl(outputFile, pageTargets[currentIndex + 1]) : "";
  return `<nav class="page-nav" aria-label="Module pages">
    <a class="nav-button${previous ? "" : " is-disabled"}" ${previous ? `href="${previous}"` : 'aria-disabled="true"'}>Previous</a>
    <label><span>Page</span><select data-page-select>${pages.map((page, index) => `<option value="${relativeUrl(outputFile, pageTargets[index])}"${index === currentIndex ? " selected" : ""}>${index + 1}. ${escapeHtml(page.title)}</option>`).join("")}</select></label>
    <a class="nav-button${next ? "" : " is-disabled"}" ${next ? `href="${next}"` : 'aria-disabled="true"'}>Next ${icon("arrow")}</a>
  </nav>`;
}

function articleContent(module, page, pageHtml, navigation) {
  return `<article class="lesson">
    <header class="lesson-header"><p class="kicker">${escapeHtml(module.title)}</p><h1>${escapeHtml(page.title)}</h1></header>
    <div class="prose">${pageHtml}</div>
    ${navigation}
  </article>`;
}

function playlistSidebar(outputFile, playlist, modules, activeModule = "") {
  const playlistTarget = path.join(outputRoot, "playlists", playlist.slug, "index.html");
  return `<aside class="sidebar" data-sidebar>
    <div class="sidebar-heading"><span>Navigation</span><button class="icon-button" type="button" aria-label="Close navigation" data-menu-close>${icon("close")}</button></div>
    <nav aria-label="Playlist">
      <a class="playlist-link${activeModule ? "" : " active"}" href="${relativeUrl(outputFile, playlistTarget)}">${escapeHtml(playlist.title)}</a>
      <ul>${modules.map((module) => {
        const target = path.join(outputRoot, "playlists", playlist.slug, "modules", module.slug, "index.html");
        return `<li><a class="${activeModule === module.slug ? "active" : ""}" href="${relativeUrl(outputFile, target)}">${escapeHtml(module.title)}</a></li>`;
      }).join("")}</ul>
    </nav>
  </aside><div class="sidebar-scrim" data-menu-close></div>`;
}

async function getModulePages(module) {
  if (!Array.isArray(module.pages) || module.pages.length === 0) {
    throw new Error(`Module ${module.slug} must define at least one page`);
  }
  return Promise.all(module.pages.map(async (entry) => {
    const file = typeof entry === "string" ? entry : entry.file;
    if (!file) throw new Error(`Module ${module.slug} has a page without a file`);
    const sourceFile = path.resolve(module.directory, file);
    if (!sourceFile.startsWith(module.directory) || !(await exists(sourceFile))) {
      throw new Error(`Module ${module.slug} references missing page ${file}`);
    }
    const parsed = parseFrontMatter(await readFile(sourceFile, "utf8"), sourceFile);
    return {
      file,
      sourceFile,
      slug: pageSlug(file),
      title: (typeof entry === "object" && entry.title) || parsed.data.title || pageSlug(file),
      description: (typeof entry === "object" && entry.description) || parsed.data.description || "",
    };
  }));
}

async function buildModuleRoute(module, pages, routeRoot, sidebarFactory = null) {
  const indexFile = path.join(routeRoot, "index.html");
  const pageTargets = pages.map((page) => path.join(routeRoot, "pages", page.slug, "index.html"));
  const sidebar = sidebarFactory ? sidebarFactory(indexFile) : "";

  if (pages.length === 1) {
    const rendered = await renderMarkdownPage(pages[0].sourceFile, indexFile, `${module.slug}-${pages[0].slug}`);
    await writePage(indexFile, shell({ outputFile: indexFile, title: rendered.title, sidebar, bodyClass: "learning-page", content: articleContent(module, pages[0], rendered.html, "") }));
    return;
  }

  const startTarget = pageTargets[0];
  const action = `<a class="primary-button" href="${relativeUrl(indexFile, startTarget)}">Start module ${icon("arrow")}</a>`;
  await writePage(indexFile, shell({ outputFile: indexFile, title: module.title, sidebar, bodyClass: "learning-page", content: overview(indexFile, module, "modules", action) }));

  for (const [pageIndex, page] of pages.entries()) {
    const outputFile = pageTargets[pageIndex];
    const rendered = await renderMarkdownPage(page.sourceFile, outputFile, `${module.slug}-${page.slug}`);
    const pageSidebar = sidebarFactory ? sidebarFactory(outputFile) : "";
    const navigation = pageNavigation(outputFile, pages, pageIndex, pageTargets);
    await writePage(outputFile, shell({ outputFile, title: rendered.title, sidebar: pageSidebar, bodyClass: "learning-page", content: articleContent(module, page, rendered.html, navigation) }));
  }
}

async function build() {
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });

  const [modules, playlists] = await Promise.all([
    loadCollection("modules", "module.yml"),
    loadCollection("playlists", "playlist.yml"),
  ]);
  modules.sort((a, b) => a.title.localeCompare(b.title));
  playlists.sort((a, b) => a.title.localeCompare(b.title));
  const moduleMap = new Map(modules.map((module) => [module.slug, module]));

  for (const contentRoot of contentRoots) {
    const source = path.join(root, contentRoot);
    if (await exists(source)) await cp(source, path.join(outputRoot, "content", contentRoot), { recursive: true });
  }

  const homeFile = path.join(outputRoot, "index.html");
  const homeContent = `<section class="home-hero"><p class="kicker">AI Skills Nav</p><h1>Skilling in the Name of...</h1><p>Choose a curated path or jump straight into a module.</p></section>
    <section class="catalog-section"><div class="section-heading"><p class="kicker">Curated learning</p><h2>Playlists</h2></div><div class="card-grid">${playlists.map((item) => card(homeFile, item, "playlists")).join("")}</div></section>
    <section class="catalog-section alt"><div class="section-heading"><p class="kicker">Explore by topic</p><h2>Modules</h2></div><div class="card-grid">${modules.map((item) => card(homeFile, item, "modules")).join("")}</div></section>`;
  await writePage(homeFile, shell({ outputFile: homeFile, title: "Skilling in the Name of...", content: homeContent, bodyClass: "home-page" }));

  for (const module of modules) {
    await buildModuleRoute(module, await getModulePages(module), path.join(outputRoot, "modules", module.slug));
  }

  for (const playlist of playlists) {
    if (!Array.isArray(playlist.modules)) throw new Error(`Playlist ${playlist.slug} must define modules`);
    const playlistModules = playlist.modules.map((slug) => {
      const module = moduleMap.get(slug);
      if (!module) throw new Error(`Playlist ${playlist.slug} references missing module ${slug}`);
      return module;
    });
    const playlistFile = path.join(outputRoot, "playlists", playlist.slug, "index.html");
    const sidebar = playlistSidebar(playlistFile, playlist, playlistModules);
    await writePage(playlistFile, shell({ outputFile: playlistFile, title: playlist.title, sidebar, bodyClass: "learning-page", content: overview(playlistFile, playlist, "playlists") }));
    for (const module of playlistModules) {
      const routeRoot = path.join(outputRoot, "playlists", playlist.slug, "modules", module.slug);
      const sidebarFactory = (outputFile) => playlistSidebar(outputFile, playlist, playlistModules, module.slug);
      await buildModuleRoute(module, await getModulePages(module), routeRoot, sidebarFactory);
    }
  }

  await mkdir(path.join(outputRoot, "assets"), { recursive: true });
  await Promise.all([
    copyFile(path.join(root, "site", "styles.css"), path.join(outputRoot, "assets", "styles.css")),
    copyFile(path.join(root, "site", "app.js"), path.join(outputRoot, "assets", "app.js")),
    writeFile(path.join(outputRoot, ".nojekyll"), "", "utf8"),
  ]);
  console.log(`Built ${modules.length} modules and ${playlists.length} playlists in dist/`);
}

await build();