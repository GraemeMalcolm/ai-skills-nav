import { copyFile, cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { marked } from "marked";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "source");
const outputRoot = path.join(root, "dist");
const contentRoots = [
  { name: "modules", directory: path.join(sourceRoot, "modules") },
  { name: "playlists", directory: path.join(sourceRoot, "playlists") },
  { name: "courses", directory: path.join(sourceRoot, "courses") },
  { name: "MicrosoftLearning", directory: path.join(root, "MicrosoftLearning") },
  { name: "avatars", directory: path.join(root, "avatars") },
];

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

async function loadCollection(folder, metadataFile, baseDirectory = sourceRoot) {
  const collectionRoot = path.join(baseDirectory, folder);
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
  let repoRelative = path.relative(root, sourceTarget);
  if (repoRelative.startsWith("..")) return value;
  if (repoRelative === "source" || repoRelative.startsWith(`source${path.sep}`)) {
    repoRelative = path.relative(sourceRoot, sourceTarget);
  }
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
    const includePath = /^[\\/]/.test(includeReference)
      ? path.resolve(root, includeReference.replace(/^[\\/]+/, ""))
      : path.resolve(path.dirname(sourceFile), includeReference);
    const includeRelative = path.relative(root, includePath);
    if (includeRelative.startsWith("..") || path.isAbsolute(includeRelative) || stack.includes(includePath)) {
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
    quiz: parsed.data.quiz,
  };
}

function quizInterface(outputFile, quiz, avatar) {
  if (quiz === undefined) return "";
  const questions = Array.isArray(quiz) ? quiz.flatMap((entry) => entry?.item || []) : [];
  if (!questions.length || questions.some((entry) => typeof entry?.question !== "string" || !/^[abc]$/i.test(entry?.answer || ""))) {
    throw new Error("Quiz metadata must contain questions with an A, B, or C answer");
  }
  const avatarImage = relativeUrl(outputFile, path.join(outputRoot, "content", "avatars", avatar.slug, "avatar.png"));
  const config = escapeHtml(JSON.stringify({
    name: avatar.name,
    questions: questions.map((entry) => ({ question: entry.question.replaceAll("\\n", "\n"), answer: entry.answer.toUpperCase() })),
  }));
  return `<section class="quiz-chat" data-quiz-config="${config}" aria-labelledby="quiz-title">
    <header class="quiz-header"><img src="${avatarImage}" alt=""><div><p class="kicker">Knowledge check</p><h2 id="quiz-title">Chat with ${escapeHtml(avatar.name)}</h2></div></header>
    <div class="quiz-messages" data-quiz-messages role="log" aria-live="polite" aria-relevant="additions"></div>
    <form class="quiz-form" data-quiz-form><label for="quiz-answer">Your answer</label><div><input id="quiz-answer" type="text" placeholder="A, B, or C" autocomplete="off" required><button type="submit">Send</button></div></form>
  </section>`;
}

function icon(name) {
  const icons = {
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
    mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  };
  return icons[name];
}

function agentFlyout(outputFile, avatar, options = {}) {
  if (!avatar) return "";
  const isDefaultAvatar = avatar.slug === "default";
  const avatarRoot = path.join(outputRoot, "content", "avatars", avatar.slug);
  const avatarImage = relativeUrl(outputFile, path.join(avatarRoot, "avatar.png"));
  const knowledgeUrl = relativeUrl(outputFile, path.join(avatarRoot, "knowledge.json"));
  const audioRoot = options.audio === false || isDefaultAvatar ? null : relativeUrl(outputFile, path.join(avatarRoot, "audio"));
  const moderationUrl = relativeUrl(outputFile, path.join(outputRoot, "assets", "moderation.txt"));
  const config = escapeHtml(JSON.stringify({
    name: avatar.name,
    welcomeMessage: avatar["welcome-message"],
    suggestedPrompts: avatar["suggested-prompts"],
    knowledgeUrl,
    audioRoot,
    moderationUrl,
    useLearnMcp: options.useLearnMcp ?? !isDefaultAvatar,
    useCatalogSearch: options.useCatalogSearch ?? isDefaultAvatar,
  }));
  return `<div class="agent" data-agent-config="${config}">
    <button class="agent-launcher" type="button" aria-label="Chat with ${escapeHtml(avatar.name)}" aria-expanded="false" aria-controls="agent-panel"><img src="${avatarImage}" alt=""><span>Ask ${escapeHtml(avatar.name)}</span></button>
    <aside class="agent-panel" id="agent-panel" aria-labelledby="agent-title" aria-hidden="true">
      <header class="agent-header"><img src="${avatarImage}" alt=""><div><p class="kicker">Learning assistant</p><h2 id="agent-title">${escapeHtml(avatar.name)}</h2></div><button class="icon-button" type="button" aria-label="Close chat" data-agent-close>${icon("close")}</button></header>
      <div class="agent-messages" data-agent-messages role="log" aria-live="polite" aria-relevant="additions"></div>
      <div class="agent-suggestions" data-agent-suggestions aria-label="Suggested prompts"></div>
      <form class="agent-form" data-agent-form><label class="sr-only" for="agent-input">Message ${escapeHtml(avatar.name)}</label><input id="agent-input" type="text" placeholder="Ask a question" autocomplete="off" required><button class="agent-mic" type="button" aria-label="Use speech input" aria-pressed="false" data-agent-mic>${icon("mic")}</button><button type="submit">Send</button></form>
    </aside>
  </div>`;
}

function personalPlaylistDialog(outputFile, module) {
  const playlistsUrl = relativeUrl(outputFile, path.join(outputRoot, "my-playlists", "index.html"));
  const moduleName = module?.title || "";
  const modulePath = module ? `modules/${module.slug}/index.html` : "";
  const pageTrigger = module ? `<a class="filter-trigger personal-playlist-add" href="#personal-playlist-dialog" data-personal-playlist-open>Add to personal playlist</a>` : "";
  return `${pageTrigger}
  <dialog class="filter-dialog personal-playlist-dialog" id="personal-playlist-dialog" data-personal-playlist-dialog data-module-name="${escapeHtml(moduleName)}" data-module-path="${escapeHtml(modulePath)}" data-playlists-url="${escapeHtml(playlistsUrl)}" aria-labelledby="personal-playlist-title">
    <form data-personal-playlist-form>
      <header class="filter-dialog-header"><div><p class="kicker">Save learning experience</p><h2 id="personal-playlist-title">Add to personal playlist</h2></div><button class="icon-button" type="button" aria-label="Close" data-personal-playlist-close>${icon("close")}</button></header>
      <div class="filter-dialog-body personal-playlist-fields">
        <label><span>Playlist</span><select data-personal-playlist-select></select></label>
        <div class="personal-playlist-new" data-personal-playlist-new>
          <label><span>New playlist name</span><input type="text" maxlength="80" data-personal-playlist-name></label>
          <label><span>Description</span><textarea rows="3" maxlength="300" data-personal-playlist-description></textarea></label>
        </div>
        <p class="personal-playlist-status" data-personal-playlist-status role="status" aria-live="polite" hidden></p>
      </div>
      <footer class="filter-dialog-actions"><button class="text-button" type="button" data-personal-playlist-close>Close</button><button class="primary-button" type="submit" data-personal-playlist-submit>Add learning experience</button><a class="primary-button" href="${escapeHtml(playlistsUrl)}" data-personal-playlist-go hidden>Go to playlist</a></footer>
    </form>
  </dialog>`;
}

function breadcrumbs(outputFile, items = []) {
  const home = path.join(outputRoot, "index.html");
  const trail = [{ label: "Home", target: items.length ? home : null }, ...items];
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${trail.map((item, index) => {
    const isCurrent = index === trail.length - 1;
    const content = isCurrent
      ? `<span aria-current="page">${escapeHtml(item.label)}</span>`
      : `<a href="${relativeUrl(outputFile, item.target)}">${escapeHtml(item.label)}</a>`;
    return `<li>${content}</li>`;
  }).join("")}</ol></nav>`;
}

function shell({ outputFile, title, content, breadcrumbs: breadcrumbItems = [], sidebar = "", eyebrow = "AI Skills Nav", headerExtra = "", avatar = null, agentOptions = {}, bodyClass = "", module = null, hasModuleCards = false }) {
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
<body class="${escapeHtml(bodyClass)}"${module ? ` data-module-slug="${escapeHtml(module.slug)}"` : ""}>
  <a class="skip-link" href="#main-content">Skip to content</a>
  <header class="site-header">
    <a class="brand" href="${home}"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>${escapeHtml(eyebrow)}</span></a>
    ${headerExtra}
  </header>
  ${breadcrumbs(outputFile, breadcrumbItems)}
  <div class="site-frame${sidebar ? " has-sidebar" : ""}">
    ${sidebar}
    ${sidebar ? `<button class="icon-button nav-reveal" type="button" aria-label="Show navigation" aria-expanded="false" data-menu-reveal>${icon("menu")}</button>` : ""}
    <main id="main-content" class="main-content">${module || hasModuleCards ? personalPlaylistDialog(outputFile, module) : ""}${content}</main>
  </div>
  ${agentFlyout(outputFile, avatar, agentOptions)}
</body>
</html>`;
}

async function writePage(outputFile, html) {
  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, html, "utf8");
}

function metadataLine(item) {
  return [item.course_number, item.modality, item.level ? `Level ${item.level}` : "", item.duration].filter(Boolean).map(escapeHtml).join(" · ");
}

function thumbnail(outputFile, item, type) {
  const source = path.join(item.directory, "thumbnail.png");
  const target = path.join(outputRoot, "content", type, item.slug, "thumbnail.png");
  return `<img src="${relativeUrl(outputFile, target)}" alt="" loading="lazy">`;
}

function card(outputFile, item, type, filterable = false, defaultHidden = false) {
  const target = path.join(outputRoot, type, item.slug, "index.html");
  const tooltipId = `${type}-${item.slug}-description`;
  const searchText = [item.title, item.course_number, item.description, ...(Array.isArray(item.topics) ? item.topics : [item.topics])].filter(Boolean).join(" ").toLocaleLowerCase();
  const searchData = ` data-catalog-card data-catalog-type="${escapeHtml(type)}" data-search-text="${escapeHtml(searchText)}"`;
  const filterData = filterable
    ? ` data-filter-card data-modalities="${escapeHtml(JSON.stringify(item.modalities || []))}" data-level="${escapeHtml(item.level || "")}" data-duration="${escapeHtml(item.duration || "")}" data-audience="${escapeHtml(JSON.stringify(item.audience || []))}"`
    : "";
  // Home includes every catalog item so its search can truly search all
  // content, but only the featured subset is visible before a search begins.
  const defaultVisibility = defaultHidden ? " data-default-hidden hidden" : "";
  const tooltip = item.description ? `<span class="card-tooltip" id="${escapeHtml(tooltipId)}" role="tooltip">${escapeHtml(item.description)}</span>` : "";
  const describedBy = item.description ? ` aria-describedby="${escapeHtml(tooltipId)}"` : "";
  const cardLink = `<a class="content-card" href="${relativeUrl(outputFile, target)}"${describedBy}>
    <span class="card-image">${thumbnail(outputFile, item, type)}</span>
    <span class="card-body"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(metadataLine(item))}</span></span>
    ${tooltip}
  </a>`;
  if (type !== "modules") return cardLink.replace('class="content-card"', `class="content-card"${searchData}${filterData}${defaultVisibility}`);
  return `<div class="content-card-container"${searchData}${filterData}${defaultVisibility}>
    ${cardLink}
    <button class="card-playlist-add" type="button" aria-label="Add ${escapeHtml(item.title)} to a personal playlist" title="Add to personal playlist" data-personal-playlist-open data-module-name="${escapeHtml(item.title)}" data-module-path="modules/${escapeHtml(item.slug)}/index.html">${icon("plus")}</button>
  </div>`;
}

function catalogSearch(inputId, label, placeholder) {
  return `<form class="site-search" role="search" data-site-search><label class="sr-only" for="${escapeHtml(inputId)}">${escapeHtml(label)}</label><input id="${escapeHtml(inputId)}" type="search" name="query" placeholder="${escapeHtml(placeholder)}" autocomplete="off"><button type="submit">Search</button><button class="search-clear" type="button" data-search-clear hidden>Clear</button></form>`;
}

function filterOptions(name, values, label) {
  return `<fieldset class="filter-group"><legend>${escapeHtml(label)}</legend><div class="filter-options">${values.map((value) => `<label><input type="checkbox" name="${escapeHtml(name)}" value="${escapeHtml(value)}"><span>${escapeHtml(value)}</span></label>`).join("")}</div></fieldset>`;
}

function modalityFilterOptions(values) {
  return `<fieldset class="filter-group" data-modalities-filter><legend>Modality</legend>
    <div class="filter-choice"><label><input type="radio" name="modalities-mode" value="all" checked><span>Show all skilling</span></label></div>
    <div class="filter-choice"><label><input type="radio" name="modalities-mode" value="containing"><span>Show only skilling containing...</span></label></div>
    <div class="filter-options">${values.map((value) => `<label><input type="checkbox" name="modalities" value="${escapeHtml(value)}" checked><span>${escapeHtml(value)}</span></label>`).join("")}</div>
  </fieldset>`;
}

function catalogFilterDialog(items, fields, subject) {
  const uniqueValues = (selector) => [...new Set(items.flatMap(selector).filter((value) => value !== undefined && value !== null && value !== ""))]
    .sort((left, right) => String(left).localeCompare(String(right), undefined, { numeric: true }));
  const selectors = {
    modalities: (item) => Array.isArray(item.modalities) ? item.modalities : [],
    level: (item) => [item.level],
    audience: (item) => Array.isArray(item.audience) ? item.audience : [item.audience],
    duration: (item) => [item.duration],
  };
  const labels = { level: "Level", audience: "Audience", duration: "Duration" };
  return `<dialog class="filter-dialog" data-filter-dialog data-filter-fields="${escapeHtml(fields.join(","))}" aria-labelledby="filter-title">
    <form method="dialog" data-filter-form>
      <header class="filter-dialog-header"><div><p class="kicker">Refine ${escapeHtml(subject)}</p><h2 id="filter-title">Filter</h2></div><button class="icon-button" type="button" aria-label="Close filters" data-filter-close>${icon("close")}</button></header>
      <div class="filter-dialog-body">
        ${fields.map((field) => field === "modalities" ? modalityFilterOptions(uniqueValues(selectors[field]).map(String)) : filterOptions(field, uniqueValues(selectors[field]).map(String), labels[field])).join("")}
      </div>
      <footer class="filter-dialog-actions"><button class="text-button" type="button" data-filter-clear>Clear all</button><button class="primary-button" type="submit" value="apply">Apply filters</button></footer>
    </form>
  </dialog>`;
}

function overview(outputFile, item, type, action = "", imageDetails = "") {
  return `<article class="overview">
    <div class="overview-media"><div class="overview-image">${thumbnail(outputFile, item, type)}</div>${imageDetails}</div>
    <div class="overview-copy">
      <p class="kicker">${escapeHtml(type === "playlists" ? "Learning playlist" : type === "courses" ? "Microsoft Official Course" : "Learning experience")}</p>
      <h1>${escapeHtml(item.title)}</h1>
      <p class="lede">${escapeHtml(item.description || "")}</p>
      ${metadataLine(item) ? `<p class="metadata">${metadataLine(item)}</p>` : ""}
      ${action}
    </div>
  </article>`;
}

function courseOverview(outputFile, course, playlists) {
  const playlistList = `<section class="module-page-list" aria-labelledby="course-playlists-title"><h2 id="course-playlists-title">Self-paced learning</h2><ol>${playlists.map((playlist) => {
    const target = path.join(outputRoot, "courses", course.slug, "playlists", playlist.slug, "index.html");
    return `<li><a href="${relativeUrl(outputFile, target)}">${escapeHtml(playlist.title)}</a></li>`;
  }).join("")}</ol></section>`;
  const credential = `<section class="credential"><h2>Credential preparation</h2><p>${escapeHtml(course.credential || "No associated credential is specified.")}</p></section>`;
  return overview(outputFile, course, "courses", credential, playlistList);
}

function pageNavigation(outputFile, pages, currentIndex, pageTargets) {
  const previous = currentIndex > 0 ? relativeUrl(outputFile, pageTargets[currentIndex - 1]) : "";
  const next = currentIndex < pages.length - 1 ? relativeUrl(outputFile, pageTargets[currentIndex + 1]) : "";
  return `<nav class="page-nav" aria-label="Learning experience pages">
    <a class="nav-button${previous ? "" : " is-disabled"}" ${previous ? `href="${previous}"` : 'aria-disabled="true"'}>Previous</a>
    <label><span>Page</span><select data-page-select>${pages.map((page, index) => `<option value="${relativeUrl(outputFile, pageTargets[index])}"${index === currentIndex ? " selected" : ""}>${index + 1}. ${escapeHtml(page.title)}</option>`).join("")}</select></label>
    <a class="nav-button${next ? "" : " is-disabled"}" ${next ? `href="${next}"` : 'aria-disabled="true"'}>Next ${icon("arrow")}</a>
  </nav>`;
}

function articleContent(module, page, pageHtml, navigation, quiz = "") {
  return `<article class="lesson">
    <header class="lesson-header"><p class="kicker">${escapeHtml(module.title)}</p><h1>${escapeHtml(page.title)}</h1></header>
    ${pageHtml ? `<div class="prose">${pageHtml}</div>` : ""}
    ${quiz}
    ${navigation}
  </article>`;
}

function moduleSidebar(outputFile, module, pages, activePage = "") {
  const moduleTarget = path.join(outputRoot, "modules", module.slug, "index.html");
  return `<aside class="sidebar" data-sidebar>
    <div class="sidebar-heading"><button class="icon-button menu-toggle" type="button" aria-label="Hide navigation" aria-expanded="true" data-menu-toggle>${icon("menu")}</button><span>Navigation</span></div>
    <nav aria-label="Learning experience">
      <a class="playlist-link${activePage ? "" : " active"}" href="${relativeUrl(outputFile, moduleTarget)}">${escapeHtml(module.title)}</a>
      <ul class="sidebar-pages">${pages.map((page) => {
    const target = path.join(outputRoot, "modules", module.slug, "pages", page.slug, "index.html");
    return `<li><a class="${activePage === page.slug ? "active" : ""}" href="${relativeUrl(outputFile, target)}">${escapeHtml(page.title)}</a></li>`;
  }).join("")}</ul>
    </nav>
  </aside><div class="sidebar-scrim" data-menu-close></div>`;
}

function playlistSidebar(outputFile, playlist, modules, activeModule = "", activePage = "") {
  const playlistTarget = path.join(outputRoot, "playlists", playlist.slug, "index.html");
  return `<aside class="sidebar" data-sidebar>
    <div class="sidebar-heading"><button class="icon-button menu-toggle" type="button" aria-label="Hide navigation" aria-expanded="true" data-menu-toggle>${icon("menu")}</button><span>Navigation</span></div>
    <nav aria-label="Playlist">
      <a class="playlist-link${activeModule ? "" : " active"}" href="${relativeUrl(outputFile, playlistTarget)}">${escapeHtml(playlist.title)}</a>
      <ul class="sidebar-modules">${modules.map((module) => {
    const target = path.join(outputRoot, "playlists", playlist.slug, "modules", module.slug, "index.html");
    return `<li><a class="${activeModule === module.slug && !activePage ? "active" : ""}" href="${relativeUrl(outputFile, target)}">${escapeHtml(module.title)}</a><ul class="sidebar-pages">${module.pages.map((page) => {
      const pageTarget = path.join(outputRoot, "playlists", playlist.slug, "modules", module.slug, "pages", page.slug, "index.html");
      return `<li><a class="${activeModule === module.slug && activePage === page.slug ? "active" : ""}" href="${relativeUrl(outputFile, pageTarget)}">${escapeHtml(page.title)}</a></li>`;
    }).join("")}</ul></li>`;
  }).join("")}</ul>
    </nav>
  </aside><div class="sidebar-scrim" data-menu-close></div>`;
}

function courseSidebar(outputFile, course, playlists, activePlaylist = "", activeModule = "", activePage = "") {
  const courseTarget = path.join(outputRoot, "courses", course.slug, "index.html");
  return `<aside class="sidebar" data-sidebar>
    <div class="sidebar-heading"><button class="icon-button menu-toggle" type="button" aria-label="Hide navigation" aria-expanded="true" data-menu-toggle>${icon("menu")}</button><span>Navigation</span></div>
    <nav aria-label="Course">
      <a class="playlist-link${activePlaylist ? "" : " active"}" href="${relativeUrl(outputFile, courseTarget)}">${escapeHtml(course.title)}</a>
      <ul class="sidebar-playlists">${playlists.map((playlist) => {
    const playlistTarget = path.join(outputRoot, "courses", course.slug, "playlists", playlist.slug, "index.html");
    return `<li><a class="${activePlaylist === playlist.slug && !activeModule ? "active" : ""}" href="${relativeUrl(outputFile, playlistTarget)}">${escapeHtml(playlist.title)}</a><ul class="sidebar-modules">${playlist.modules.map((module) => {
      const moduleTarget = path.join(outputRoot, "courses", course.slug, "playlists", playlist.slug, "modules", module.slug, "index.html");
      return `<li><a class="${activePlaylist === playlist.slug && activeModule === module.slug && !activePage ? "active" : ""}" href="${relativeUrl(outputFile, moduleTarget)}">${escapeHtml(module.title)}</a><ul class="sidebar-pages">${module.pages.map((page) => {
        const pageTarget = path.join(outputRoot, "courses", course.slug, "playlists", playlist.slug, "modules", module.slug, "pages", page.slug, "index.html");
        return `<li><a class="${activePlaylist === playlist.slug && activeModule === module.slug && activePage === page.slug ? "active" : ""}" href="${relativeUrl(outputFile, pageTarget)}">${escapeHtml(page.title)}</a></li>`;
      }).join("")}</ul></li>`;
    }).join("")}</ul></li>`;
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

async function buildModuleRoute(module, pages, routeRoot, defaultAvatar, sidebarFactory = null, breadcrumbParents = null) {
  const indexFile = path.join(routeRoot, "index.html");
  const pageTargets = pages.map((page) => path.join(routeRoot, "pages", page.slug, "index.html"));
  const sidebar = sidebarFactory ? sidebarFactory(indexFile) : "";
  const parents = breadcrumbParents || [{ label: "Skilling content", target: path.join(outputRoot, "skilling-content", "index.html") }];
  const moduleBreadcrumbs = [...parents, { label: module.title }];

  if (pages.length === 1) {
    const rendered = await renderMarkdownPage(pages[0].sourceFile, indexFile, `${module.slug}-${pages[0].slug}`);
    const quiz = quizInterface(indexFile, rendered.quiz, module.avatarData || defaultAvatar);
    await writePage(indexFile, shell({ outputFile: indexFile, title: rendered.title, breadcrumbs: moduleBreadcrumbs, sidebar, avatar: module.avatarData, bodyClass: "learning-page", module, content: articleContent(module, pages[0], rendered.html, "", quiz) }));
    return;
  }

  const startTarget = pageTargets[0];
  const action = `<a class="primary-button" href="${relativeUrl(indexFile, startTarget)}">Start ${icon("arrow")}</a>`;
  const pageList = `<section class="module-page-list" aria-labelledby="module-pages-title"><h2 id="module-pages-title">In this learning experience</h2><ol>${pages.map((page, index) => `<li><a href="${relativeUrl(indexFile, pageTargets[index])}">${escapeHtml(page.title)}</a></li>`).join("")}</ol></section>`;
  await writePage(indexFile, shell({ outputFile: indexFile, title: module.title, breadcrumbs: moduleBreadcrumbs, sidebar, avatar: module.avatarData, bodyClass: "learning-page", module, content: overview(indexFile, module, "modules", action, pageList) }));

  for (const [pageIndex, page] of pages.entries()) {
    const outputFile = pageTargets[pageIndex];
    const rendered = await renderMarkdownPage(page.sourceFile, outputFile, `${module.slug}-${page.slug}`);
    const pageSidebar = sidebarFactory ? sidebarFactory(outputFile, page.slug) : "";
    const navigation = pageNavigation(outputFile, pages, pageIndex, pageTargets);
    const pageBreadcrumbs = [...parents, { label: module.title, target: indexFile }, { label: rendered.title }];
    const quiz = quizInterface(outputFile, rendered.quiz, module.avatarData || defaultAvatar);
    await writePage(outputFile, shell({ outputFile, title: rendered.title, breadcrumbs: pageBreadcrumbs, sidebar: pageSidebar, avatar: module.avatarData, bodyClass: "learning-page", module, content: articleContent(module, page, rendered.html, navigation, quiz) }));
  }
}

async function build() {
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });

  const [modules, playlists, courses] = await Promise.all([
    loadCollection("modules", "module.yml"),
    loadCollection("playlists", "playlist.yml"),
    loadCollection("courses", "course.yml"),
  ]);
  const avatars = new Map((await loadCollection("avatars", "avatar.yml", root)).map((avatar) => [avatar.slug, avatar]));
  const validatedAvatars = new Set();
  const validateAvatar = async (avatar, requireAudio = true) => {
    const validationKey = `${avatar.slug}:${requireAudio}`;
    if (validatedAvatars.has(validationKey)) return;
    const requiredValues = ["name", "welcome-message", "suggested-prompts"];
    const missingValue = requiredValues.find((value) => !avatar[value] || (Array.isArray(avatar[value]) && avatar[value].length === 0));
    if (missingValue) throw new Error(`Avatar ${avatar.slug} is missing ${missingValue} in avatar.yml`);
    for (const file of ["avatar.png", "knowledge.json"]) {
      if (!(await exists(path.join(avatar.directory, file)))) throw new Error(`Avatar ${avatar.slug} is missing ${file}`);
    }
    const knowledge = JSON.parse(await readFile(path.join(avatar.directory, "knowledge.json"), "utf8"));
    if (!Array.isArray(knowledge) || knowledge.some((category) => !Array.isArray(category.documents))) {
      throw new Error(`Avatar ${avatar.slug} has invalid knowledge.json content`);
    }
    if (requireAudio) {
      const audioFiles = ["looking.wav", "no_results.wav", "search_results.wav", "sorry.wav", ...Array.from({ length: 7 }, (_, index) => `response_${index + 1}.wav`)];
      for (const file of audioFiles) {
        if (!(await exists(path.join(avatar.directory, "audio", file)))) throw new Error(`Avatar ${avatar.slug} is missing audio/${file}`);
      }
    }
    validatedAvatars.add(validationKey);
  };
  const defaultAvatar = avatars.get("default");
  if (!defaultAvatar) throw new Error("Missing default avatar");
  await validateAvatar(defaultAvatar, false);
  for (const [type, items] of [["Module", modules], ["Playlist", playlists], ["Course", courses]]) {
    for (const item of items) {
      if (!item.avatar) continue;
      const avatar = avatars.get(item.avatar);
      if (!avatar) throw new Error(`${type} ${item.slug} references unknown avatar ${item.avatar}`);
      await validateAvatar(avatar);
      item.avatarData = avatar;
    }
  }
  modules.sort((a, b) => a.title.localeCompare(b.title));
  playlists.sort((a, b) => a.title.localeCompare(b.title));
  courses.sort((a, b) => a.title.localeCompare(b.title));
  const moduleMap = new Map(modules.map((module) => [module.slug, module]));
  const playlistMap = new Map(playlists.map((playlist) => [playlist.slug, playlist]));

  for (const contentRoot of contentRoots) {
    if (await exists(contentRoot.directory)) {
      await cp(contentRoot.directory, path.join(outputRoot, "content", contentRoot.name), { recursive: true });
    }
  }

  const homeFile = path.join(outputRoot, "index.html");
  const coursesFile = path.join(outputRoot, "courses", "index.html");
  const playlistsFile = path.join(outputRoot, "playlists", "index.html");
  const skillingContentFile = path.join(outputRoot, "skilling-content", "index.html");
  const personalPlaylistsFile = path.join(outputRoot, "my-playlists", "index.html");
  const homeSearch = `<div class="header-tools">${catalogSearch("site-search-input", "Search courses, playlists, and skilling content", "Search all content")}</div>`;
  const homeContent = `<section class="home-hero"><p class="kicker">AI Skills Nav</p><h1>Skilling in the Name of...</h1><p>Choose a curated path or jump straight into a learning experience.</p></section>
    <section class="catalog-section" data-course-catalog><div class="section-heading"><p class="kicker">Microsoft Official Curriculum</p><h2>Courses</h2></div><div class="card-grid">${courses.map((item, index) => card(homeFile, item, "courses", false, index >= 4)).join("")}</div><p class="filter-empty" data-course-empty role="status" aria-live="polite" hidden>No courses match your search.</p><div class="section-links"><a class="filter-trigger" href="${relativeUrl(homeFile, coursesFile)}">See all courses</a></div></section>
    <section class="catalog-section alt" data-playlist-catalog><div class="section-heading"><p class="kicker">Curated learning we think you'll like</p><h2>Skilling playlists</h2></div><div class="card-grid">${playlists.map((item, index) => card(homeFile, item, "playlists", false, index >= 4)).join("")}</div><p class="filter-empty" data-playlist-empty role="status" aria-live="polite" hidden>No playlists match your search.</p><div class="section-links"><a class="filter-trigger" href="${relativeUrl(homeFile, personalPlaylistsFile)}">Personal playlists</a><a class="filter-trigger" href="${relativeUrl(homeFile, playlistsFile)}">See all playlists</a></div></section>
    <section class="catalog-section" data-module-catalog><div class="section-heading"><p class="kicker">New and popular</p><h2>Skilling content</h2></div><div class="card-grid" data-module-grid>${modules.map((item, index) => card(homeFile, item, "modules", false, index >= 8)).join("")}</div><p class="filter-empty" data-module-empty role="status" aria-live="polite" hidden>No skilling content matches your search.</p><div class="section-links"><a class="filter-trigger" href="${relativeUrl(homeFile, skillingContentFile)}">See all skilling content</a></div></section>`;
  await writePage(homeFile, shell({ outputFile: homeFile, title: "Skilling in the Name of...", headerExtra: homeSearch, avatar: defaultAvatar, agentOptions: { audio: false, useLearnMcp: false, useCatalogSearch: true }, content: homeContent, bodyClass: "home-page", hasModuleCards: true }));

  const courseSearch = catalogSearch("course-search-input", "Search courses", "Search courses");
  const coursesContent = `<section class="catalog-intro"><p class="kicker">Microsoft Official Curricula</p><h1>Courses</h1><p>Microsoft Official Courses can be completed online as self-paced learning experiences, or delivered as instructor-led experiences by Microsoft and Microsoft Learning Partners.</p></section>
    <section class="catalog-section"><div class="section-heading"><div class="section-heading-row"><p class="kicker">Explore the catalog</p><button class="filter-trigger" type="button" data-filter-open>Filter<span class="filter-count" data-filter-count hidden></span></button></div><h2>Available courses</h2></div><div class="card-grid">${courses.map((item) => card(coursesFile, item, "courses", true)).join("")}</div><p class="filter-empty" data-catalog-empty role="status" aria-live="polite" hidden>No courses match your search and filters.</p></section>
    ${catalogFilterDialog(courses, ["audience", "level", "duration"], "courses")}`;
  await writePage(coursesFile, shell({ outputFile: coursesFile, title: "Courses", breadcrumbs: [{ label: "Courses" }], headerExtra: courseSearch, avatar: defaultAvatar, content: coursesContent, bodyClass: "catalog-page" }));

  const playlistSearch = catalogSearch("playlist-search-input", "Search playlists", "Search playlists");
  const playlistsContent = `<section class="catalog-intro"><p class="kicker">Curated learning</p><h1>Skilling playlists</h1><p>Explore curated collections of related learning experiences that help you build skills in a focused sequence.</p></section>
    <section class="catalog-section"><div class="section-heading"><div class="section-heading-row"><p class="kicker">Explore the catalog</p><button class="filter-trigger" type="button" data-filter-open>Filter<span class="filter-count" data-filter-count hidden></span></button></div><h2>Available playlists</h2></div><div class="card-grid">${playlists.map((item) => card(playlistsFile, item, "playlists", true)).join("")}</div><p class="filter-empty" data-catalog-empty role="status" aria-live="polite" hidden>No playlists match your search and filters.</p></section>
    ${catalogFilterDialog(playlists, ["level", "audience"], "playlists")}`;
  await writePage(playlistsFile, shell({ outputFile: playlistsFile, title: "Skilling playlists", breadcrumbs: [{ label: "Skilling playlists" }], headerExtra: playlistSearch, avatar: defaultAvatar, content: playlistsContent, bodyClass: "catalog-page" }));

  const moduleSearch = catalogSearch("module-search-input", "Search skilling content", "Search skilling content");
  const skillingContent = `<section class="catalog-intro"><p class="kicker">Build your skills</p><h1>Skilling content</h1><p>Explore all learning experiences and find content by topic, modality, level, or audience.</p></section>
    <section class="catalog-section"><div class="section-heading"><div class="section-heading-row"><p class="kicker">Explore the catalog</p><button class="filter-trigger" type="button" data-filter-open>Filter<span class="filter-count" data-filter-count hidden></span></button></div><h2>Available learning experiences</h2></div><div class="card-grid" data-module-grid>${modules.map((item) => card(skillingContentFile, item, "modules", true)).join("")}</div><p class="filter-empty" data-catalog-empty role="status" aria-live="polite" hidden>No skilling content matches your search and filters.</p></section>
    ${catalogFilterDialog(modules, ["modalities", "level", "audience"], "skilling content")}`;
  await writePage(skillingContentFile, shell({ outputFile: skillingContentFile, title: "Skilling content", breadcrumbs: [{ label: "Skilling content" }], headerExtra: moduleSearch, avatar: defaultAvatar, content: skillingContent, bodyClass: "catalog-page", hasModuleCards: true }));

  const moduleCatalog = modules.map((module) => ({
    name: module.title,
    path: `modules/${module.slug}/index.html`,
    pages: module.pages.map((page) => ({
      name: page.title,
      path: `modules/${module.slug}/pages/${page.slug}/index.html`,
    })),
    thumbnail: relativeUrl(personalPlaylistsFile, path.join(outputRoot, "content", "modules", module.slug, "thumbnail.png")),
  }));
  const personalPlaylistsContent = `<div data-personal-playlists data-module-catalog="${escapeHtml(JSON.stringify(moduleCatalog))}" data-playlist-thumbnail="${relativeUrl(personalPlaylistsFile, path.join(outputRoot, "assets", "playlist.png"))}">
    <section class="catalog-intro"><p class="kicker">Personal collection</p><h1>My Playlists</h1><p>Create playlists from any learning experience and return here to continue learning.</p></section>
    <section class="catalog-section"><div class="section-heading"><div class="section-heading-row"><p class="kicker">Your collections</p><button class="filter-trigger" type="button" data-new-personal-playlist-open>New personal playlist</button></div><h2>Personal playlists</h2></div><div class="card-grid" data-personal-playlist-grid></div><p class="filter-empty" data-personal-playlist-empty hidden>You have not created any personal playlists yet.</p></section>
  </div>
  <dialog class="filter-dialog personal-playlist-dialog" data-new-personal-playlist-dialog aria-labelledby="new-personal-playlist-title">
    <form data-new-personal-playlist-form>
      <header class="filter-dialog-header"><div><p class="kicker">Personal collection</p><h2 id="new-personal-playlist-title">New personal playlist</h2></div><button class="icon-button" type="button" aria-label="Close" data-new-personal-playlist-close>${icon("close")}</button></header>
      <div class="filter-dialog-body personal-playlist-fields">
        <label><span>Name</span><input type="text" maxlength="80" data-new-personal-playlist-name></label>
        <label><span>Description</span><textarea rows="3" maxlength="300" data-new-personal-playlist-description></textarea></label>
        <p class="personal-playlist-status" data-new-personal-playlist-status role="status" aria-live="polite" hidden></p>
      </div>
      <footer class="filter-dialog-actions"><button class="text-button" type="button" data-new-personal-playlist-close>Cancel</button><button class="primary-button" type="submit">Create playlist</button></footer>
    </form>
  </dialog>`;
  const personalPlaylistSidebar = `<aside class="sidebar" data-sidebar><div class="sidebar-heading"><button class="icon-button menu-toggle" type="button" aria-label="Hide navigation" aria-expanded="true" data-menu-toggle>${icon("menu")}</button><span>Navigation</span></div><nav aria-label="Playlist" data-personal-playlist-navigation></nav></aside><div class="sidebar-scrim" data-menu-close></div>`;
  await writePage(personalPlaylistsFile, shell({ outputFile: personalPlaylistsFile, title: "My Playlists", breadcrumbs: [{ label: "Personal playlists" }], sidebar: personalPlaylistSidebar, avatar: defaultAvatar, content: personalPlaylistsContent, bodyClass: "catalog-page" }));

  for (const module of modules) {
    const pages = await getModulePages(module);
    module.pages = pages;
    const sidebarFactory = pages.length > 1 ? (outputFile, activePage) => moduleSidebar(outputFile, module, pages, activePage) : null;
    await buildModuleRoute(module, pages, path.join(outputRoot, "modules", module.slug), defaultAvatar, sidebarFactory);
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
    const playlistBreadcrumbs = [{ label: "Skilling playlists", target: playlistsFile }, { label: playlist.title }];
    const firstModuleTarget = playlistModules.length
      ? path.join(outputRoot, "playlists", playlist.slug, "modules", playlistModules[0].slug, "index.html")
      : null;
    const startAction = firstModuleTarget
      ? `<a class="primary-button playlist-start" href="${relativeUrl(playlistFile, firstModuleTarget)}">Start ${icon("arrow")}</a>`
      : "";
    await writePage(playlistFile, shell({ outputFile: playlistFile, title: playlist.title, breadcrumbs: playlistBreadcrumbs, sidebar, avatar: playlist.avatarData, bodyClass: "learning-page", content: overview(playlistFile, playlist, "playlists", "", startAction) }));
    for (const module of playlistModules) {
      const routeRoot = path.join(outputRoot, "playlists", playlist.slug, "modules", module.slug);
      const sidebarFactory = (outputFile, activePage) => playlistSidebar(outputFile, playlist, playlistModules, module.slug, activePage);
      const breadcrumbParents = [
        { label: "Skilling playlists", target: playlistsFile },
        { label: playlist.title, target: playlistFile },
      ];
      await buildModuleRoute(module, module.pages, routeRoot, defaultAvatar, sidebarFactory, breadcrumbParents);
    }
  }

  for (const course of courses) {
    if (!course.course_number) throw new Error(`Course ${course.slug} must define course_number`);
    if (!Array.isArray(course.playlists) || course.playlists.length === 0) throw new Error(`Course ${course.slug} must define at least one playlist`);
    const coursePlaylists = course.playlists.map((slug) => {
      const playlist = playlistMap.get(slug);
      if (!playlist) throw new Error(`Course ${course.slug} references missing playlist ${slug}`);
      return {
        ...playlist,
        modules: playlist.modules.map((moduleSlug) => {
          const module = moduleMap.get(moduleSlug);
          if (!module) throw new Error(`Playlist ${playlist.slug} references missing module ${moduleSlug}`);
          return module;
        }),
      };
    });
    const courseFile = path.join(outputRoot, "courses", course.slug, "index.html");
    const courseBreadcrumbs = [{ label: "Courses", target: coursesFile }, { label: course.title }];
    await writePage(courseFile, shell({ outputFile: courseFile, title: course.title, breadcrumbs: courseBreadcrumbs, sidebar: courseSidebar(courseFile, course, coursePlaylists), avatar: course.avatarData, bodyClass: "learning-page", content: courseOverview(courseFile, course, coursePlaylists) }));

    for (const playlist of coursePlaylists) {
      const playlistFile = path.join(outputRoot, "courses", course.slug, "playlists", playlist.slug, "index.html");
      const playlistBreadcrumbs = [
        { label: "Courses", target: coursesFile },
        { label: course.title, target: courseFile },
        { label: playlist.title },
      ];
      const firstModuleTarget = playlist.modules.length
        ? path.join(outputRoot, "courses", course.slug, "playlists", playlist.slug, "modules", playlist.modules[0].slug, "index.html")
        : null;
      const startAction = firstModuleTarget
        ? `<a class="primary-button playlist-start" href="${relativeUrl(playlistFile, firstModuleTarget)}">Start ${icon("arrow")}</a>`
        : "";
      await writePage(playlistFile, shell({ outputFile: playlistFile, title: playlist.title, breadcrumbs: playlistBreadcrumbs, sidebar: courseSidebar(playlistFile, course, coursePlaylists, playlist.slug), avatar: playlist.avatarData, bodyClass: "learning-page", content: overview(playlistFile, playlist, "playlists", "", startAction) }));

      for (const module of playlist.modules) {
        const routeRoot = path.join(outputRoot, "courses", course.slug, "playlists", playlist.slug, "modules", module.slug);
        const sidebarFactory = (outputFile, activePage) => courseSidebar(outputFile, course, coursePlaylists, playlist.slug, module.slug, activePage);
        const breadcrumbParents = [
          { label: "Courses", target: coursesFile },
          { label: course.title, target: courseFile },
          { label: playlist.title, target: playlistFile },
        ];
        await buildModuleRoute(module, module.pages, routeRoot, defaultAvatar, sidebarFactory, breadcrumbParents);
      }
    }
  }

  await mkdir(path.join(outputRoot, "assets"), { recursive: true });
  await Promise.all([
    copyFile(path.join(root, "site", "styles.css"), path.join(outputRoot, "assets", "styles.css")),
    copyFile(path.join(root, "site", "app.js"), path.join(outputRoot, "assets", "app.js")),
    copyFile(path.join(root, "site", "moderation.txt"), path.join(outputRoot, "assets", "moderation.txt")),
    copyFile(path.join(root, "site", "media", "playlist.png"), path.join(outputRoot, "assets", "playlist.png")),
    writeFile(path.join(outputRoot, ".nojekyll"), "", "utf8"),
  ]);
  console.log(`Built ${modules.length} modules, ${playlists.length} playlists, and ${courses.length} courses in dist/`);
}

await build();