import { copyFile, cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import yaml from "js-yaml";
import { marked } from "marked";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "source");
const outputRoot = path.join(root, "dist");
const hostedLabTemplate = path.join(root, "templates", "hosted-lab.md");
const simulationTemplate = path.join(root, "templates", "simulation.md");
const execFileAsync = promisify(execFile);
const contentRoots = [
  { name: "modules", directory: path.join(sourceRoot, "modules") },
  { name: "playlists", directory: path.join(sourceRoot, "playlists") },
  { name: "courses", directory: path.join(sourceRoot, "courses") },
  { name: "credentials", directory: path.join(sourceRoot, "credentials") },
  { name: "MicrosoftLearning", directory: path.join(root, "MicrosoftLearning") },
  { name: "avatars", directory: path.join(root, "avatars") },
];
// Build-time role access summary used to limit Profile choices to roles backed
// by public content or content authorized for the signed-in email domain.
let profileAudienceOptions = [];

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

async function lastCommitDate(directory) {
  const relativeDirectory = toPosix(path.relative(root, directory));
  try {
    const { stdout } = await execFileAsync("git", ["log", "-1", "--format=%cI", "--", relativeDirectory], { cwd: root });
    return stdout.trim() || null;
  } catch (error) {
    throw new Error(`Unable to read Git history for ${relativeDirectory}: ${error.message}`);
  }
}

function relativeUrl(fromFile, target) {
  const relative = path.relative(path.dirname(fromFile), target);
  return toPosix(relative || ".");
}

function playlistEntryTarget(playlistRoot, playlist) {
  if (playlist.modules.length !== 1) return path.join(playlistRoot, playlist.slug, "index.html");
  const module = playlist.modules[0];
  const moduleSlug = typeof module === "string" ? module : module.slug;
  return path.join(playlistRoot, playlist.slug, "modules", moduleSlug, "index.html");
}

function moduleStartTarget(modulesRoot, module) {
  return path.join(modulesRoot, module.slug, "index.html");
}

function moduleEndTarget(modulesRoot, module) {
  if (module.pages.length === 1) return moduleStartTarget(modulesRoot, module);
  const lastPage = module.pages.at(-1);
  return path.join(modulesRoot, module.slug, "pages", lastPage.slug, "index.html");
}

function playlistEndTarget(playlistsRoot, playlist) {
  const modulesRoot = path.join(playlistsRoot, playlist.slug, "modules");
  return moduleEndTarget(modulesRoot, playlist.modules.at(-1));
}

function isExternalUrl(value) {
  return /^(?:[a-z]+:|#|\/\/)/i.test(value);
}

function rewriteAssetUrl(value, sourceFile, outputFile) {
  if (/^https?:\/\//i.test(sourceFile)) {
    if (!value || /^(?:[a-z]+:|#|\/\/)/i.test(value)) return value;
    return new URL(value, sourceFile).href;
  }
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
    .replace(/(\[!PDF\[\]\()([^)]+)(\)\])/gi, (match, prefix, url, suffix) =>
      `${prefix}${rewriteAssetUrl(url, sourceFile, outputFile)}${suffix}`)
    .replace(/(!\[[^\]]*\]\()([^\s)]+)([^)]*\))/g, (match, prefix, url, suffix) =>
      `${prefix}${rewriteAssetUrl(url, sourceFile, outputFile)}${suffix}`)
    .replace(/(<img\b[^>]*?\bsrc=["'])([^"']+)(["'][^>]*>)/gi, (match, prefix, url, suffix) =>
      `${prefix}${rewriteAssetUrl(url, sourceFile, outputFile)}${suffix}`);
}

async function expandIncludes(markdown, sourceFile, outputFile, stack = []) {
  const includePattern = /\[!(INCLUDE|LAB_STEPS|LAB_HOST|SIMULATION)(?:\[[^\]]*\])?\(([^)]+)\)\]|\[!(INCLUDE|LAB_STEPS|LAB_HOST|SIMULATION)\s+([^\]]+)\]/gi;
  let result = "";
  let cursor = 0;
  for (const match of markdown.matchAll(includePattern)) {
    result += rewriteMarkdownAssets(markdown.slice(cursor, match.index), sourceFile, outputFile);
    const directive = (match[1] || match[3]).toUpperCase();
    const includeReference = (match[2] || match[4]).trim();
    const remoteReference = /^https?:\/\//i.test(includeReference);
    if (directive === "LAB_HOST") {
      if (!remoteReference) {
        throw new Error(`LAB_HOST must reference a fully-qualified HTTP(S) URL in ${sourceFile}`);
      }
      const template = await readFile(hostedLabTemplate, "utf8");
      const hostedLabMarkdown = template.replaceAll("{LAB_URL}", includeReference);
      result += await expandIncludes(hostedLabMarkdown, hostedLabTemplate, outputFile, [...stack, hostedLabTemplate]);
      cursor = match.index + match[0].length;
      continue;
    }
    if (directive === "SIMULATION") {
      if (!remoteReference) {
        throw new Error(`SIMULATION must reference a fully-qualified HTTP(S) URL in ${sourceFile}`);
      }
      const template = await readFile(simulationTemplate, "utf8");
      const simulationMarkdown = template.replaceAll("{SIMULATION_URL}", includeReference);
      result += await expandIncludes(simulationMarkdown, simulationTemplate, outputFile, [...stack, simulationTemplate]);
      cursor = match.index + match[0].length;
      continue;
    }
    if (directive === "LAB_STEPS" && !remoteReference) {
      throw new Error(`LAB_STEPS must reference a fully-qualified HTTP(S) URL in ${sourceFile}`);
    }
    const remoteSource = /^https?:\/\//i.test(sourceFile);
    if (remoteReference || remoteSource) {
      const includeUrl = new URL(includeReference, remoteSource ? sourceFile : undefined).href;
      if (stack.includes(includeUrl)) {
        throw new Error(`Recursive include ${includeReference} in ${sourceFile}`);
      }
      const response = await fetch(includeUrl);
      if (!response.ok) {
        throw new Error(`Could not fetch include ${includeReference}: ${response.status} ${response.statusText}`);
      }
      const included = parseFrontMatter(await response.text(), includeUrl);
      result += await expandIncludes(included.body, includeUrl, outputFile, [...stack, includeUrl]);
      cursor = match.index + match[0].length;
      continue;
    }
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

function pdfEmbed(url) {
  const source = url.trim();
  const escapedSource = escapeHtml(source);
  return `<div class="pdf-frame"><iframe src="${escapedSource}" title="Embedded PDF document" loading="lazy"><p>PDF preview unavailable. <a href="${escapedSource}">Open the PDF document</a>.</p></iframe></div>`;
}

function parseMarkdown(markdown) {
  return marked.parse(markdown);
}

function renderMarkdown(markdown) {
  const embedPattern = /^\s*(?:\[!VIDEO\s*:?\s*(https?:\/\/[^\]\s]+)\]|\[!PDF\[\]\(([^)]+)\)\])\s*$/gim;
  const chunks = [];
  let cursor = 0;
  for (const match of markdown.matchAll(embedPattern)) {
    const beforeEmbed = markdown.slice(cursor, match.index).trim();
    if (beforeEmbed) chunks.push(parseMarkdown(beforeEmbed));
    chunks.push(match[1] ? videoEmbed(match[1]) : pdfEmbed(match[2]));
    cursor = match.index + match[0].length;
  }
  const afterEmbed = markdown.slice(cursor).trim();
  if (afterEmbed) chunks.push(parseMarkdown(afterEmbed));
  return chunks.join("\n");
}

function knowledgeCheckInterface(outputFile, source, attributes, avatar, id) {
  const parsed = yaml.load(source);
  const questions = Array.isArray(parsed) ? parsed.flatMap((entry) => entry?.item || []) : [];
  const normalizedQuestions = questions.map((entry) => {
    const options = Object.entries(entry || {})
      .filter(([key, value]) => /^[a-z]$/i.test(key) && typeof value === "string")
      .map(([key, value]) => ({ key: key.toUpperCase(), text: value }));
    const answer = String(entry?.answer || "").toUpperCase();
    if (typeof entry?.question !== "string" || options.length < 2 || !options.some((option) => option.key === answer)) {
      throw new Error(`Knowledge check ${id} must contain questions with at least two options and a matching answer`);
    }
    return { question: entry.question, options, answer, feedback: String(entry.feedback || "") };
  });
  if (!normalizedQuestions.length) throw new Error(`Knowledge check ${id} must contain at least one question`);

  const attribute = (name) => attributes.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*["']([^"']*)["']`, "i"))?.[1] || "";
  const type = attribute("type").toLocaleLowerCase();
  const showAnswers = attribute("show-answers").toLocaleLowerCase() === "true";
  const allowRetry = attribute("allow-retry").toLocaleLowerCase() === "true";
  const config = escapeHtml(JSON.stringify({ name: avatar.name, questions: normalizedQuestions, showAnswers, allowRetry }));

  if (type === "chat") {
    const avatarImage = relativeUrl(outputFile, path.join(outputRoot, "content", "avatars", avatar.slug, "avatar.png"));
    return `<section class="quiz-chat" data-knowledge-check="chat" data-quiz-config="${config}" aria-labelledby="${id}-title">
      <header class="quiz-header"><img src="${avatarImage}" alt=""><div><p class="kicker">Knowledge check</p><h2 id="${id}-title">Chat with ${escapeHtml(avatar.name)}</h2></div></header>
      <div class="quiz-messages" data-quiz-messages role="log" aria-live="polite" aria-relevant="additions"></div>
      <div class="quiz-chat-options" data-quiz-options aria-label="Answer options"></div>
      <form class="quiz-form" data-quiz-form><label for="${id}-answer">Your answer</label><div><input id="${id}-answer" type="text" placeholder="Enter an option" autocomplete="off" required><button type="submit">Send</button></div></form>
    </section>`;
  }

  return `<section class="knowledge-quiz" data-knowledge-check="quiz" data-quiz-config="${config}" aria-labelledby="${id}-title">
    <header class="knowledge-quiz-header"><p class="kicker">Knowledge check</p><h2 id="${id}-title">Check your knowledge</h2></header>
    <form data-quiz-form>
      <div class="knowledge-quiz-questions">${normalizedQuestions.map((question, questionIndex) => `<fieldset data-quiz-question><legend><span>${questionIndex + 1}.</span> ${escapeHtml(question.question)}</legend><div class="knowledge-quiz-options">${question.options.map((option) => `<label><input type="radio" name="${id}-question-${questionIndex}" value="${option.key}"><span><strong>${option.key}.</strong> ${escapeHtml(option.text)}</span></label>`).join("")}</div><div class="knowledge-quiz-feedback" data-quiz-feedback hidden></div></fieldset>`).join("")}</div>
      <p class="knowledge-quiz-status" data-quiz-status role="status" aria-live="polite"></p>
      <button class="primary-button knowledge-quiz-submit" type="submit">Submit answers</button>
    </form>
  </section>`;
}

function renderKnowledgeChecks(markdown, outputFile, avatar, seed) {
  let index = 0;
  return markdown.replace(/^::: knowledge-check([^\r\n]*)\r?\n([\s\S]*?)^::: end-knowledge-check\s*$/gim, (match, attributes, source) =>
    knowledgeCheckInterface(outputFile, source.trim(), attributes, avatar, `${seed}-knowledge-check-${index++}`));
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

async function renderMarkdownPage(sourceFile, outputFile, seed, avatar) {
  const parsed = parseFrontMatter(await readFile(sourceFile, "utf8"), sourceFile);
  const expanded = await expandIncludes(parsed.body, sourceFile, outputFile, [sourceFile]);
  return {
    title: parsed.data.title || parsed.data.lab?.title || pageSlug(sourceFile),
    html: renderZones(renderKnowledgeChecks(expanded, outputFile, avatar, seed), seed),
  };
}

function icon(name) {
  const icons = {
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
    mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z"/></svg>',
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
  const playlistsUrl = relativeUrl(outputFile, path.join(outputRoot, "personalized-plan", "index.html"));
  const moduleName = module?.title || "";
  const modulePath = module ? `modules/${module.slug}/index.html` : "";
  return `<dialog class="filter-dialog personal-playlist-dialog" id="personal-playlist-dialog" data-personal-playlist-dialog data-module-name="${escapeHtml(moduleName)}" data-module-path="${escapeHtml(modulePath)}" data-playlists-url="${escapeHtml(playlistsUrl)}" aria-labelledby="personal-playlist-title">
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

function personalPlaylistTrigger() {
  return `<a class="filter-trigger" href="#personal-playlist-dialog" data-personal-playlist-open>Add to personal playlist</a>`;
}

function shareTrigger(hidden = false, className = "header-link") {
  return `<a class="${className}" href="#share-dialog" data-share-open${hidden ? " hidden" : ""}>Share</a>`;
}

function shareDialog(hidden = false, includeTrigger = true) {
  return `${includeTrigger ? shareTrigger(hidden) : ""}<dialog class="filter-dialog share-dialog" id="share-dialog" data-share-dialog aria-labelledby="share-title">
    <form method="dialog">
      <header class="filter-dialog-header"><div><p class="kicker">Share this page</p><h2 id="share-title">Page URL</h2></div><button class="icon-button" type="submit" aria-label="Close">${icon("close")}</button></header>
      <div class="filter-dialog-body share-dialog-body">
        <label for="share-url">URL</label>
        <div class="share-url-row"><input id="share-url" type="url" readonly data-share-url><button class="primary-button" type="button" data-share-copy>Copy</button></div>
        <p class="share-status" data-share-status role="status" aria-live="polite"></p>
      </div>
      <footer class="filter-dialog-actions"><button class="text-button" type="submit">Close</button></footer>
    </form>
  </dialog>`;
}

function ratingDialog(module) {
  const stars = Array.from({ length: 5 }, (_, index) => {
    const rating = index + 1;
    return `<button type="button" aria-label="${rating} star${rating === 1 ? "" : "s"}" aria-pressed="false" data-rating-value="${rating}">${icon("star")}</button>`;
  }).join("");
  return `<dialog class="filter-dialog rating-dialog" id="rating-dialog" data-rating-dialog aria-labelledby="rating-title">
    <form data-rating-form>
      <header class="filter-dialog-header"><div><p class="kicker">${escapeHtml(module.title)}</p><h2 id="rating-title">Rate this content</h2></div><button class="icon-button" type="button" aria-label="Close rating" data-rating-close>${icon("close")}</button></header>
      <div class="filter-dialog-body rating-fields">
        <fieldset><legend>Your rating</legend><div class="rating-stars" role="group" aria-label="Rating out of 5">${stars}</div><input type="hidden" data-rating-input></fieldset>
        <label><span>Feedback <small>(optional)</small></span><textarea rows="5" maxlength="1000" data-rating-comment></textarea></label>
      </div>
      <footer class="filter-dialog-actions"><button class="text-button" type="button" data-rating-close>Cancel</button><button class="primary-button" type="submit" data-rating-submit disabled>Save</button></footer>
    </form>
  </dialog>`;
}

function contentOverviewDialog(outputFile, module) {
  return `<dialog class="content-overview-dialog" id="content-overview-dialog" data-content-overview-dialog aria-labelledby="content-overview-title">
    <button class="icon-button content-overview-close" type="button" aria-label="Close" data-content-overview-close>${icon("close")}</button>
    ${overview(outputFile, module, "modules", "", "", "", "content-overview-title")}
  </dialog>`;
}

function signInDialog(outputFile) {
  const logo = relativeUrl(outputFile, path.join(outputRoot, "assets", "microsoft-logo.svg"));
  const personalizedPlanUrl = relativeUrl(outputFile, path.join(outputRoot, "personalized-plan", "index.html"));
  const audienceOptions = escapeHtml(JSON.stringify(profileAudienceOptions));
  return `<div class="account-links"><a class="filter-trigger" href="#profile" data-profile-open data-auth-only hidden>Profile</a><a class="filter-trigger auth-link" href="#sign-in" data-auth-open>Sign-in</a></div>
  <dialog class="filter-dialog sign-in-dialog" data-sign-in-dialog aria-labelledby="sign-in-title">
    <form data-sign-in-form novalidate>
      <header class="filter-dialog-header"><div><img class="sign-in-logo" src="${logo}" alt="Microsoft"><h2 id="sign-in-title">Sign-in</h2></div><button class="icon-button" type="button" aria-label="Close sign-in" data-sign-in-close>${icon("close")}</button></header>
      <div class="filter-dialog-body sign-in-fields">
        <label><span>Email address</span><input type="email" name="email" autocomplete="email" data-sign-in-email required></label>
        <label><span>Password</span><input type="password" name="password" autocomplete="current-password" data-sign-in-password required></label>
        <p class="sign-in-status" data-sign-in-status role="status" aria-live="polite" hidden></p>
      </div>
      <footer class="filter-dialog-actions"><button class="text-button" type="button" data-sign-in-close>Cancel</button><button class="primary-button" type="submit">Sign-in</button></footer>
    </form>
  </dialog>
  <dialog class="filter-dialog profile-dialog" data-profile-dialog aria-labelledby="profile-title">
    <form data-profile-form>
      <header class="filter-dialog-header"><div><p class="kicker">Your account</p><h2 id="profile-title">Profile</h2></div><button class="icon-button" type="button" aria-label="Close profile" data-profile-close>${icon("close")}</button></header>
      <div class="filter-dialog-body profile-fields">
        <div><span>Email address</span><strong data-profile-email></strong></div>
        <label><span>My role</span><select data-profile-role data-profile-audiences="${audienceOptions}" required><option value="">Select a role</option></select></label>
        <div class="profile-multiselect" data-profile-other-roles>
          <span id="profile-other-roles-label">Other roles I'm interested in</span>
          <button class="profile-multiselect-trigger" type="button" aria-labelledby="profile-other-roles-label profile-other-roles-summary" aria-expanded="false" data-profile-other-roles-trigger disabled><span id="profile-other-roles-summary" data-profile-other-roles-summary>Select roles</span></button>
          <div class="profile-multiselect-options" role="group" aria-labelledby="profile-other-roles-label" data-profile-other-roles-options hidden></div>
        </div>
        <a href="${escapeHtml(personalizedPlanUrl)}" data-profile-plan hidden>Personalized skilling plan</a>
      </div>
      <footer class="filter-dialog-actions"><button class="text-button" type="button" data-profile-close>Cancel</button><button class="primary-button" type="submit" data-profile-submit disabled>OK</button></footer>
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

function shell({ outputFile, title, content, breadcrumbs: breadcrumbItems = [], sidebar = "", eyebrow = "AI Skills Nav", headerExtra = "", avatar = null, agentOptions = {}, bodyClass = "", module = null, hasModuleCards = false, restrictedTo = [], showContentOverview = false }) {
  const styles = relativeUrl(outputFile, path.join(outputRoot, "assets", "styles.css"));
  const script = relativeUrl(outputFile, path.join(outputRoot, "assets", "app.js"));
  const favicon = relativeUrl(outputFile, path.join(outputRoot, "favicon.ico"));
  const home = relativeUrl(outputFile, path.join(outputRoot, "index.html"));
  const personalizedPlan = relativeUrl(outputFile, path.join(outputRoot, "personalized-plan", "index.html"));
  const catalog = relativeUrl(outputFile, path.join(outputRoot, "catalog", "index.html"));
  const officialCurriculum = relativeUrl(outputFile, path.join(outputRoot, "official-curriculum", "index.html"));
  const credentials = relativeUrl(outputFile, path.join(outputRoot, "credentials", "index.html"));
  const isLearningPage = bodyClass.split(/\s+/).includes("learning-page");
  const share = isLearningPage ? shareDialog(false, false) : "";
  const rating = module ? ratingDialog(module) : "";
  const ratingTrigger = module ? `<a class="filter-trigger" href="#rating-dialog" data-rating-open data-auth-only hidden>Rate this content</a>` : "";
  const learningPageActions = `${ratingTrigger}${module ? personalPlaylistTrigger() : ""}${shareTrigger(false, "filter-trigger")}`;
  const pageActions = isLearningPage
    ? showContentOverview
      ? `<div class="page-actions page-actions-split"><a class="filter-trigger" href="#content-overview-dialog" data-content-overview-open>About this content</a><div class="page-actions-end">${learningPageActions}</div></div>`
      : `<div class="page-actions">${learningPageActions}</div>`
    : "";
  const contentOverview = showContentOverview
    ? contentOverviewDialog(outputFile, module)
    : "";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f7f5f2">
  <title>${escapeHtml(title)} | AI Skills Nav</title>
  <link rel="icon" href="${favicon}" sizes="any">
  <link rel="stylesheet" href="${styles}">
  <script src="${script}" defer></script>
</head>
<body class="${escapeHtml(bodyClass)}"${module ? ` data-module-slug="${escapeHtml(module.slug)}"` : ""} data-restricted-to="${escapeHtml(JSON.stringify(restrictedTo))}">
  <a class="skip-link" href="#main-content">Skip to content</a>
  <header class="site-header">
    <div class="primary-navigation"><a class="brand" href="${home}"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>${escapeHtml(eyebrow)}</span></a><a class="filter-trigger" href="${personalizedPlan}" data-auth-only hidden>My Skilling</a><a class="filter-trigger" href="${catalog}">Catalog</a><a class="filter-trigger" href="${officialCurriculum}">Official Curriculum</a><a class="filter-trigger" href="${credentials}">Credentials</a></div>
    ${headerExtra}${signInDialog(outputFile)}
  </header>
  ${breadcrumbs(outputFile, breadcrumbItems)}
  <div class="site-frame${sidebar ? " has-sidebar" : ""}">
    ${sidebar}
    ${sidebar ? `<button class="icon-button nav-reveal" type="button" aria-label="Show navigation" aria-expanded="false" data-menu-reveal>${icon("menu")}</button>` : ""}
    <main id="main-content" class="main-content">${contentOverview}${pageActions}${share}${rating}${module || hasModuleCards ? personalPlaylistDialog(outputFile, module) : ""}${content}</main>
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

function overviewFacts(item) {
  const facts = [];
  if (typeof item.rating === "number") {
    facts.push(`<div><dt>Rating</dt><dd>${item.rating.toFixed(1)} out of 5</dd></div>`);
  }
  if (item.last_updated) {
    const [year, month, day] = item.last_updated.slice(0, 10).split("-").map(Number);
    const updated = new Intl.DateTimeFormat("en-US", {
      dateStyle: "long",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(year, month - 1, day)));
    facts.push(`<div><dt>Last updated</dt><dd><time datetime="${escapeHtml(item.last_updated)}">${escapeHtml(updated)}</time></dd></div>`);
  }
  return facts.length ? `<dl class="overview-facts">${facts.join("")}</dl>` : "";
}

function componentMemberships(outputFile, item, type) {
  const memberships = type === "modules" ? item.playlistMemberships : type === "playlists" ? item.courseMemberships : [];
  if (!memberships?.length) return "";
  const membershipType = type === "modules" ? "playlists" : "courses";
  return `<section aria-labelledby="memberships-${escapeHtml(item.slug)}"><h2 id="memberships-${escapeHtml(item.slug)}">This skilling is a component of:</h2><ul>${memberships.map((membership) => {
    const target = path.join(outputRoot, membershipType, membership.slug, "index.html");
    return `<li${accessData(membership)}><a href="${relativeUrl(outputFile, target)}">${escapeHtml(membership.title)}</a></li>`;
  }).join("")}</ul></section>`;
}

function learningDetails(outputFile, item, type) {
  if (!item.prerequisites || !item.learning_outcomes) return "";
  const outcomes = item.learning_outcomes.map((outcome, index) => {
    const isOverall = item.learning_outcomes.length > 1 && index === item.learning_outcomes.length - 1;
    return `<li>${isOverall ? `<strong>Overall outcome: ${escapeHtml(outcome)}</strong>` : escapeHtml(outcome)}</li>`;
  }).join("");
  return `<div class="learning-details">
    <section aria-labelledby="prerequisites-${escapeHtml(item.slug)}"><h2 id="prerequisites-${escapeHtml(item.slug)}">Prerequisites</h2><ul>${item.prerequisites.map((prerequisite) => `<li>${escapeHtml(prerequisite)}</li>`).join("")}</ul></section>
    <section aria-labelledby="outcomes-${escapeHtml(item.slug)}"><h2 id="outcomes-${escapeHtml(item.slug)}">Learning outcomes</h2><ul>${outcomes}</ul></section>
    ${componentMemberships(outputFile, item, type)}
  </div>`;
}

function combinedRestrictions(...domainLists) {
  const restrictions = domainLists.filter((domains) => Array.isArray(domains) && domains.length);
  if (!restrictions.length) return [];
  const allowed = restrictions.slice(1).reduce((domains, required) => domains.filter((domain) => required.includes(domain)), [...restrictions[0]]);
  return allowed.length ? allowed : ["__no_matching_domain__"];
}

function accessData(item, inherited = []) {
  return ` data-access-domains="${escapeHtml(JSON.stringify(combinedRestrictions(inherited, item.restricted_to)))}"`;
}

function thumbnail(outputFile, item, type) {
  const source = path.join(item.directory, "thumbnail.png");
  const target = path.join(outputRoot, "content", type, item.slug, "thumbnail.png");
  return `<img src="${relativeUrl(outputFile, target)}" alt="" loading="lazy">`;
}

function experienceTypeName(item, type) {
  if (type === "credentials") return item.credential_type || "Credential";
  if (item.experience_type) return item.experience_type;
  if (type === "courses") return "Course";
  if (type === "playlists") return "Skilling Playlist";
  return "Learning Experience";
}

function itemCollectionType(item) {
  return path.basename(path.dirname(item.directory));
}

function cardRating(item) {
  if (typeof item.rating !== "number") return "";
  const rating = Math.max(0, Math.min(5, item.rating));
  const stars = "&#9733;&#9733;&#9733;&#9733;&#9733;";
  return `<span class="card-rating" role="img" aria-label="${rating.toFixed(1)} out of 5 stars"><span class="card-rating-stars" aria-hidden="true"><span>${stars}</span><span class="card-rating-fill" style="width: ${(rating / 5) * 100}%">${stars}</span></span><span class="card-rating-value">${rating.toFixed(1)}</span></span>`;
}

function card(outputFile, item, type, defaultHidden = false, instance = "") {
  const target = type === "playlists"
    ? playlistEntryTarget(path.join(outputRoot, "playlists"), item)
    : path.join(outputRoot, type, item.slug, "index.html");
  const tooltipId = `${type}-${item.slug}${instance ? `-${instance}` : ""}-description`;
  const searchText = item.searchContext.text;
  const searchData = ` data-catalog-card data-catalog-type="${escapeHtml(type)}" data-search-text="${escapeHtml(searchText)}" data-restricted-to="${escapeHtml(JSON.stringify(item.restricted_to || []))}" data-assigned-to="${escapeHtml(JSON.stringify(item.assigned_to || []))}" data-content-level="${escapeHtml(item.level)}"`;
  const filterData = ` data-filter-card data-modalities="${escapeHtml(JSON.stringify(item.searchContext.filters.modalities))}" data-level="${escapeHtml(JSON.stringify(item.searchContext.filters.level))}" data-experience_type="${escapeHtml(JSON.stringify(item.searchContext.filters.experience_type))}" data-credential_type="${escapeHtml(JSON.stringify(item.searchContext.filters.credential_type))}" data-audience="${escapeHtml(JSON.stringify(item.searchContext.filters.audience))}" data-duration="${escapeHtml(JSON.stringify(catalogMetadataValues(item, "duration")))}"`;
  // Home includes every catalog item so its search can truly search all
  // content, but only the featured subset is visible before a search begins.
  const defaultVisibility = defaultHidden ? " data-default-hidden hidden" : "";
  const tooltip = item.description ? `<span class="card-tooltip" id="${escapeHtml(tooltipId)}" role="tooltip">${escapeHtml(item.description)}</span>` : "";
  const describedBy = item.description ? ` aria-describedby="${escapeHtml(tooltipId)}"` : "";
  const experienceType = `<span>${escapeHtml(experienceTypeName(item, type))}</span>`;
  const cardLink = `<a class="content-card" href="${relativeUrl(outputFile, target)}"${describedBy}>
    <span class="card-image">${thumbnail(outputFile, item, type)}</span>
    <span class="card-body"><strong>${escapeHtml(item.title)}</strong>${experienceType}<span class="card-meta-row">${metadataLine(item)}</span>${cardRating(item)}</span>
    ${tooltip}
  </a>`;
  if (type !== "modules") return cardLink.replace('class="content-card"', `class="content-card"${searchData}${filterData}${defaultVisibility}`);
  return `<div class="content-card-container"${searchData}${filterData}${defaultVisibility}>
    ${cardLink}
    <button class="card-playlist-add" type="button" aria-label="Add ${escapeHtml(item.title)} to a personal playlist" title="Add to personal playlist" data-personal-playlist-open data-module-name="${escapeHtml(item.title)}" data-module-path="modules/${escapeHtml(item.slug)}/index.html">${icon("plus")}</button>
  </div>`;
}

function homepageItems(items, recentCount, ratingCount) {
  const byTitle = (left, right) => left.title.localeCompare(right.title);
  const recent = [...items]
    .sort((left, right) => Date.parse(right.last_updated || 0) - Date.parse(left.last_updated || 0) || byTitle(left, right))
    .slice(0, recentCount);
  const selected = new Set(recent);
  const rated = [...items]
    .filter((item) => !selected.has(item))
    .sort((left, right) => right.rating - left.rating
      || Date.parse(right.last_updated || 0) - Date.parse(left.last_updated || 0)
      || byTitle(left, right))
    .slice(0, ratingCount);
  rated.forEach((item) => selected.add(item));
  return {
    featuredCount: selected.size,
    items: [...recent, ...rated, ...items.filter((item) => !selected.has(item))],
  };
}

function catalogSearch(inputId, label, placeholder) {
  return `<form class="site-search catalog-search" role="search" data-site-search><label class="sr-only" for="${escapeHtml(inputId)}">${escapeHtml(label)}</label><input id="${escapeHtml(inputId)}" type="search" name="query" placeholder="${escapeHtml(placeholder)}" autocomplete="off"><button type="submit">Search</button><button class="search-clear" type="button" data-search-clear hidden>Clear</button></form>`;
}

function filterOptions(name, values, label, accessByValue = new Map()) {
  return `<fieldset class="filter-group"><legend>${escapeHtml(label)}</legend><div class="filter-options">${values.map((value) => `<label data-option-access-domains="${escapeHtml(JSON.stringify(accessByValue.get(value) || []))}"><input type="checkbox" name="${escapeHtml(name)}" value="${escapeHtml(value)}"><span>${escapeHtml(value)}</span></label>`).join("")}</div></fieldset>`;
}

function modalityFilterOptions(values) {
  return `<fieldset class="filter-group" data-modalities-filter><legend>Modality</legend>
    <div class="filter-choice"><label><input type="radio" name="modalities-mode" value="all" checked><span>Show all skilling</span></label></div>
    <div class="filter-choice"><label><input type="radio" name="modalities-mode" value="containing"><span>Show only skilling containing...</span></label></div>
    <div class="filter-options">${values.map((value) => `<label><input type="checkbox" name="modalities" value="${escapeHtml(value)}" checked><span>${escapeHtml(value)}</span></label>`).join("")}</div>
  </fieldset>`;
}

function durationFilterOptions() {
  return `<fieldset class="filter-group duration-filter" data-duration-filter><legend>Duration</legend>
    <div class="profile-proficiency-values"><span>Minimum <output for="filter-duration-min" data-filter-duration-min-output>Minutes</output></span><span>Maximum <output for="filter-duration-max" data-filter-duration-max-output>Days</output></span></div>
    <div class="profile-range-control" data-filter-duration-range>
      <div class="profile-range-track" aria-hidden="true"></div>
      <input id="filter-duration-min" type="range" min="0" max="2" step="1" value="0" aria-label="Minimum duration" data-filter-duration-min>
      <input id="filter-duration-max" type="range" min="0" max="2" step="1" value="2" aria-label="Maximum duration" data-filter-duration-max>
    </div>
    <div class="duration-stops" aria-hidden="true"><span>Minutes</span><span>Hours</span><span>Days</span></div>
  </fieldset>`;
}

function levelFilterOptions() {
  return `<fieldset class="filter-group" data-level-filter><legend>Level</legend>
    <div class="profile-proficiency-values"><span>Minimum <output for="filter-level-min" data-filter-level-min-output>100</output></span><span>Maximum <output for="filter-level-max" data-filter-level-max-output>500</output></span></div>
    <div class="profile-range-control" data-filter-level-range>
      <div class="profile-range-track" aria-hidden="true"></div>
      <input id="filter-level-min" type="range" min="100" max="500" step="100" value="100" aria-label="Minimum level" data-filter-level-min>
      <input id="filter-level-max" type="range" min="100" max="500" step="100" value="500" aria-label="Maximum level" data-filter-level-max>
    </div>
    <div class="profile-range-ticks" aria-hidden="true"><span>100</span><span>200</span><span>300</span><span>400</span><span>500</span></div>
  </fieldset>`;
}

function catalogFilterDialog(items, fields, subject) {
  const uniqueValues = (selector) => [...new Set(items.flatMap(selector).filter((value) => value !== undefined && value !== null && value !== ""))]
    .sort((left, right) => String(left).localeCompare(String(right), undefined, { numeric: true }));
  const selectors = {
    modalities: (item) => Array.isArray(item.modalities) ? item.modalities : [],
    level: (item) => [item.level],
    experience_type: (item) => catalogMetadataValues(item, "experience_type"),
    credential_type: (item) => [item.credential_type],
    audience: (item) => Array.isArray(item.audience) ? item.audience : [item.audience],
  };
  const labels = { level: "Level", experience_type: "Experience type", credential_type: "Credential type", audience: "Role" };
  const optionAccess = (field, values) => new Map(values.map((value) => {
    const owners = items.filter((item) => catalogMetadataValues(item, field).includes(value));
    const unrestricted = owners.some((item) => !item.restricted_to.length);
    const domains = unrestricted ? [] : [...new Set(owners.flatMap((item) => item.restricted_to))].sort();
    return [value, domains];
  }));
  return `<dialog class="filter-dialog" id="catalog-filter" data-filter-dialog data-filter-fields="${escapeHtml(fields.join(","))}" aria-labelledby="filter-title">
    <form method="dialog" data-filter-form>
      <header class="filter-dialog-header"><div><p class="kicker">Refine ${escapeHtml(subject)}</p><h2 id="filter-title">Filter</h2></div><button class="icon-button" type="button" aria-label="Close filters" data-filter-close>${icon("close")}</button></header>
      <div class="filter-dialog-body">
        ${fields.map((field) => {
    if (field === "duration") return durationFilterOptions();
    const values = uniqueValues(selectors[field]).map(String);
    return field === "modalities" ? modalityFilterOptions(values) : field === "level" ? levelFilterOptions() : filterOptions(field, values, labels[field], optionAccess(field, values));
  }).join("")}
      </div>
      <footer class="filter-dialog-actions"><button class="text-button" type="button" data-filter-clear>Clear all</button><button class="primary-button" type="submit" value="apply">Apply filters</button></footer>
    </form>
  </dialog>`;
}

function overview(outputFile, item, type, action = "", imageDetails = "", footer = "", titleId = "") {
  const isCollection = type === "playlists" || type === "courses";
  return `<article class="overview${isCollection ? " overview-collection" : ""}">
    <div class="overview-media"><div class="overview-image">${thumbnail(outputFile, item, type)}</div>${imageDetails}</div>
    <div class="overview-copy">
      <p class="kicker">${escapeHtml(experienceTypeName(item, type))}</p>
      <h1${titleId ? ` id="${escapeHtml(titleId)}"` : ""}>${escapeHtml(item.title)}</h1>
      <p class="lede">${escapeHtml(item.description || "")}</p>
      ${metadataLine(item) ? `<p class="metadata">${metadataLine(item)}</p>` : ""}
      ${overviewFacts(item)}
      ${learningDetails(outputFile, item, type)}
      ${action}
    </div>
    ${footer}
  </article>`;
}

function overviewContents(outputFile, items, type, heading, targetForItem) {
  const excerpt = (description = "") => description.length > 150 ? `${description.slice(0, 150)}...` : description;
  return `<section class="overview-contents" aria-labelledby="overview-contents-title">
    <h2 id="overview-contents-title">${escapeHtml(heading)}</h2>
    <ol>${items.map((item) => {
    const description = item.description || "";
    const tooltip = description ? ` title="${escapeHtml(description)}"` : "";
    return `<li${accessData(item)}><a href="${relativeUrl(outputFile, targetForItem(item))}"${tooltip}>
        ${thumbnail(outputFile, item, type)}
        <span><strong>${escapeHtml(item.title)}</strong>${description ? `<small>${escapeHtml(excerpt(description))}</small>` : ""}</span>
      </a></li>`;
  }).join("")}</ol>
  </section>`;
}

function courseOverview(outputFile, course, playlists, credentials) {
  const playlistList = overviewContents(outputFile, playlists, "playlists", "In this course:", (playlist) =>
    playlistEntryTarget(path.join(outputRoot, "courses", course.slug, "playlists"), playlist));
  const credentialContent = credentials.length
    ? `<ul>${credentials.map((credential) => `<li${accessData(credential)}><a href="${relativeUrl(outputFile, path.join(outputRoot, "credentials", credential.slug, "index.html"))}">${escapeHtml(credential.title)}</a></li>`).join("")}</ul>`
    : "<p>No associated credential is specified.</p>";
  const credentialSection = `<section class="credential"><h2>Credential preparation</h2>${credentialContent}</section>`;
  const firstPlaylist = playlists.find((playlist) => playlist.modules.length);
  const nextTarget = firstPlaylist
    ? playlistEntryTarget(path.join(outputRoot, "courses", course.slug, "playlists"), firstPlaylist)
    : null;
  return overview(outputFile, course, "courses", credentialSection, playlistList, pageNavigation(outputFile, null, nextTarget));
}

function credentialOverview(outputFile, credential, courses, playlists) {
  const practiceUrl = credential.practice || credential.pratice;
  const preparationItems = [
    ...courses.map((course) => `<li><a href="${relativeUrl(outputFile, path.join(outputRoot, "courses", course.slug, "index.html"))}">Course ${escapeHtml(course.course_number)}: ${escapeHtml(course.title)}</a></li>`),
    ...playlists.map((playlist) => `<li><a href="${relativeUrl(outputFile, path.join(outputRoot, "playlists", playlist.slug, "index.html"))}">Skilling playlist: ${escapeHtml(playlist.title)}</a></li>`),
    ...(practiceUrl ? [`<li><a href="${escapeHtml(practiceUrl)}" target="_blank" rel="noopener noreferrer">Practice assessment</a></li>`] : []),
  ];
  const preparation = preparationItems.length
    ? `<ul>${preparationItems.join("")}</ul>`
    : "<p>No preparation resources are specified.</p>";
  const details = `<section class="credential"><h2>Prepare for this credential</h2>${preparation}</section>`;
  return overview(outputFile, credential, "credentials", details);
}

function pageNavigation(outputFile, previousTarget = null, nextTarget = null, boundaries = {}) {
  const button = (label, direction, target, boundary, iconMarkup = "") => {
    if (!target && !boundary) return "";
    const href = target ? ` href="${relativeUrl(outputFile, target)}"` : " hidden";
    const boundaryData = boundary ? ` data-playlist-boundary="${boundary}"` : "";
    return `<a class="nav-button nav-button-${direction}"${href}${boundaryData}>${label}${iconMarkup}</a>`;
  };
  const previous = button("Previous", "previous", previousTarget, boundaries.previous ? "previous" : "");
  const next = button("Next", "next", nextTarget, boundaries.next ? "next" : "", ` ${icon("arrow")}`);
  if (!previous && !next) return "";
  return `<nav class="page-nav" aria-label="Learning experience pages"${previousTarget || nextTarget ? "" : " hidden"}>
    ${previous}
    ${next}
  </nav>`;
}

function articleContent(module, page, pageHtml, navigation) {
  return `<article class="lesson">
    <header class="lesson-header"><p class="kicker">${escapeHtml(module.title)}</p><h1>${escapeHtml(page.title)}</h1></header>
    ${pageHtml ? `<div class="prose">${pageHtml}</div>` : ""}
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
  const playlistLink = modules.length > 1
    ? `<a class="playlist-link${activeModule ? "" : " active"}" href="${relativeUrl(outputFile, playlistTarget)}">${escapeHtml(playlist.title)}</a>`
    : "";
  return `<aside class="sidebar" data-sidebar>
    <div class="sidebar-heading"><button class="icon-button menu-toggle" type="button" aria-label="Hide navigation" aria-expanded="true" data-menu-toggle>${icon("menu")}</button><span>Navigation</span></div>
    <nav aria-label="Playlist">
      ${playlistLink}
      <ul class="sidebar-modules">${modules.map((module) => {
    const target = path.join(outputRoot, "playlists", playlist.slug, "modules", module.slug, "index.html");
    const pageLinks = module.pages.length > 1 ? `<ul class="sidebar-pages">${module.pages.map((page) => {
      const pageTarget = path.join(outputRoot, "playlists", playlist.slug, "modules", module.slug, "pages", page.slug, "index.html");
      return `<li><a class="${activeModule === module.slug && activePage === page.slug ? "active" : ""}" href="${relativeUrl(outputFile, pageTarget)}">${escapeHtml(page.title)}</a></li>`;
    }).join("")}</ul>` : "";
    return `<li${accessData(module, playlist.restricted_to)}><a class="${activeModule === module.slug && !activePage ? "active" : ""}" href="${relativeUrl(outputFile, target)}">${escapeHtml(module.title)}</a>${pageLinks}</li>`;
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
    const playlistLink = playlist.modules.length > 1
      ? `<a class="${activePlaylist === playlist.slug && !activeModule ? "active" : ""}" href="${relativeUrl(outputFile, playlistTarget)}">${escapeHtml(playlist.title)}</a>`
      : "";
    return `<li${accessData(playlist, course.restricted_to)}>${playlistLink}<ul class="sidebar-modules">${playlist.modules.map((module) => {
      const moduleTarget = path.join(outputRoot, "courses", course.slug, "playlists", playlist.slug, "modules", module.slug, "index.html");
      const pageLinks = module.pages.length > 1 ? `<ul class="sidebar-pages">${module.pages.map((page) => {
        const pageTarget = path.join(outputRoot, "courses", course.slug, "playlists", playlist.slug, "modules", module.slug, "pages", page.slug, "index.html");
        return `<li><a class="${activePlaylist === playlist.slug && activeModule === module.slug && activePage === page.slug ? "active" : ""}" href="${relativeUrl(outputFile, pageTarget)}">${escapeHtml(page.title)}</a></li>`;
      }).join("")}</ul>` : "";
      return `<li${accessData(module, combinedRestrictions(course.restricted_to, playlist.restricted_to))}><a class="${activePlaylist === playlist.slug && activeModule === module.slug && !activePage ? "active" : ""}" href="${relativeUrl(outputFile, moduleTarget)}">${escapeHtml(module.title)}</a>${pageLinks}</li>`;
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
      catalogLinks: extractCatalogLinks(parsed.body),
    };
  }));
}

const catalogFilterFields = ["audience", "experience_type", "credential_type", "level", "modalities", "duration"];
const catalogLinkTypes = ["video", "lab_steps", "lab_host", "simulation"];

function extractCatalogLinks(markdown) {
  const links = Object.fromEntries(catalogLinkTypes.map((type) => [type, []]));
  const videoPattern = /^\s*\[!VIDEO\s*:?\s*(https?:\/\/[^\]\s]+)\]\s*$/gim;
  for (const match of markdown.matchAll(videoPattern)) links.video.push(match[1].trim());
  const directivePattern = /\[!(LAB_STEPS|LAB_HOST|SIMULATION)(?:\[[^\]]*\])?\(([^)]+)\)\]|\[!(LAB_STEPS|LAB_HOST|SIMULATION)\s+([^\]]+)\]/gi;
  for (const match of markdown.matchAll(directivePattern)) {
    const type = (match[1] || match[3]).toLowerCase();
    links[type].push((match[2] || match[4]).trim());
  }
  return links;
}

function buildCatalogLinks(modules) {
  const references = Object.fromEntries(catalogLinkTypes.map((type) => [type, new Map()]));
  for (const module of modules) {
    for (const page of module.pages) {
      for (const type of catalogLinkTypes) {
        for (const url of page.catalogLinks[type]) {
          const moduleSlugs = references[type].get(url) || new Set();
          moduleSlugs.add(module.slug);
          references[type].set(url, moduleSlugs);
        }
      }
    }
  }
  return Object.fromEntries(catalogLinkTypes.map((type) => [
    type,
    [...references[type].entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([url, moduleSlugs]) => ({ url, modules: [...moduleSlugs].sort() })),
  ]));
}

function catalogMetadataValues(item, field) {
  if (field === "experience_type") {
    return [experienceTypeName(item, itemCollectionType(item))];
  }
  if (field === "duration") {
    const duration = String(item.duration || "").trim().toLocaleLowerCase();
    if (/\bdays?\b/.test(duration)) return ["Days"];
    const minuteMatch = duration.match(/^(\d+(?:\.\d+)?)\s*(?:minutes?|mins?)\b/);
    if (minuteMatch) return [Number(minuteMatch[1]) <= 60 ? "Minutes" : "Hours"];
    const hourMatch = duration.match(/^(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)\b/);
    if (hourMatch) return ["Hours"];
    return [];
  }
  const value = item[field];
  return (Array.isArray(value) ? value : [value])
    .filter((entry) => entry !== undefined && entry !== null && entry !== "")
    .map(String);
}

function buildSearchContext(item, children = []) {
  const ownText = [item.title, item.description, item.course_number, item.experience_type, item.credential_type, ...catalogMetadataValues(item, "learning_outcomes")];
  item.searchContext = {
    text: [ownText.filter(Boolean).join(" "), ...children.map((child) => child.searchContext.text)]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase(),
    filters: Object.fromEntries(catalogFilterFields.map((field) => [
      field,
      [...new Set([
        ...catalogMetadataValues(item, field),
        ...children.flatMap((child) => child.searchContext.filters[field]),
      ])].sort((left, right) => left.localeCompare(right, undefined, { numeric: true })),
    ])),
  };
}

function averageRating(items) {
  return items.reduce((total, item) => total + item.rating, 0) / items.length;
}

function catalogRecord(item, type) {
  const { slug, directory, avatarData, searchContext, pages, ...metadata } = item;
  const record = {
    type: type.slice(0, -1),
    slug,
    url: `${type}/${slug}/index.html`,
    ...metadata,
    search: searchContext,
  };
  if (type === "modules") {
    record.pages = pages.map((page) => ({
      slug: page.slug,
      title: page.title,
      description: page.description,
      file: page.file,
      url: pages.length === 1
        ? `modules/${slug}/index.html`
        : `modules/${slug}/pages/${page.slug}/index.html`,
    }));
  }
  return record;
}

async function writeCatalog(collections) {
  const allItems = Object.values(collections).flat();
  const filterValues = Object.fromEntries(catalogFilterFields.map((field) => [
    field,
    [...new Set(allItems.flatMap((item) => item.searchContext.filters[field]))]
      .sort((left, right) => String(left).localeCompare(String(right), undefined, { numeric: true })),
  ]));
  const catalog = {
    schemaVersion: 1,
    counts: Object.fromEntries(Object.entries(collections).map(([type, items]) => [type, items.length])),
    filterValues,
    links: buildCatalogLinks(collections.modules),
    ...Object.fromEntries(Object.entries(collections).map(([type, items]) => [
      type,
      items.map((item) => catalogRecord(item, type)),
    ])),
  };
  const json = `${JSON.stringify(catalog, null, 2)}\n`;
  await Promise.all([
    writeFile(path.join(root, "catalog.json"), json, "utf8"),
    writeFile(path.join(outputRoot, "catalog.json"), json, "utf8"),
  ]);
}

async function buildModuleRoute(module, pages, routeRoot, defaultAvatar, sidebarFactory = null, breadcrumbParents = null, navigationContext = {}) {
  const indexFile = path.join(routeRoot, "index.html");
  const pageTargets = pages.map((page) => path.join(routeRoot, "pages", page.slug, "index.html"));
  const sidebar = sidebarFactory ? sidebarFactory(indexFile) : "";
  const parents = breadcrumbParents || [{ label: "Catalog", target: path.join(outputRoot, "catalog", "index.html") }];
  const moduleBreadcrumbs = [...parents, { label: module.title }];
  const routeRestrictions = combinedRestrictions(navigationContext.restrictedTo, module.restricted_to);

  if (pages.length === 1) {
    const rendered = await renderMarkdownPage(pages[0].sourceFile, indexFile, `${module.slug}-${pages[0].slug}`, module.avatarData || defaultAvatar);
    const navigation = pageNavigation(indexFile, navigationContext.previousTarget, navigationContext.nextTarget, { previous: true, next: true });
    await writePage(indexFile, shell({ outputFile: indexFile, title: rendered.title, breadcrumbs: moduleBreadcrumbs, sidebar, avatar: module.avatarData, bodyClass: "learning-page single-page-module", module, restrictedTo: routeRestrictions, showContentOverview: true, content: articleContent(module, pages[0], rendered.html, navigation) }));
    return;
  }

  const startTarget = pageTargets[0];
  const pageList = `<section class="module-page-list" aria-labelledby="module-pages-title"><h2 id="module-pages-title">In this learning experience</h2><ol>${pages.map((page, index) => `<li><a href="${relativeUrl(indexFile, pageTargets[index])}">${escapeHtml(page.title)}</a></li>`).join("")}</ol></section>`;
  const overviewNavigation = pageNavigation(indexFile, navigationContext.previousTarget, startTarget, { previous: true });
  await writePage(indexFile, shell({ outputFile: indexFile, title: module.title, breadcrumbs: moduleBreadcrumbs, sidebar, avatar: module.avatarData, bodyClass: "learning-page", module, restrictedTo: routeRestrictions, content: overview(indexFile, module, "modules", "", pageList, overviewNavigation) }));

  for (const [pageIndex, page] of pages.entries()) {
    const outputFile = pageTargets[pageIndex];
    const rendered = await renderMarkdownPage(page.sourceFile, outputFile, `${module.slug}-${page.slug}`, module.avatarData || defaultAvatar);
    const pageSidebar = sidebarFactory ? sidebarFactory(outputFile, page.slug) : "";
    const previousTarget = pageIndex > 0 ? pageTargets[pageIndex - 1] : indexFile;
    const nextTarget = pageIndex < pages.length - 1 ? pageTargets[pageIndex + 1] : navigationContext.nextTarget;
    const navigation = pageNavigation(outputFile, previousTarget, nextTarget, { next: pageIndex === pages.length - 1 });
    const pageBreadcrumbs = [...parents, { label: module.title, target: indexFile }, { label: rendered.title }];
    await writePage(outputFile, shell({ outputFile, title: rendered.title, breadcrumbs: pageBreadcrumbs, sidebar: pageSidebar, avatar: module.avatarData, bodyClass: "learning-page", module, restrictedTo: routeRestrictions, content: articleContent(module, page, rendered.html, navigation) }));
  }
}

async function build() {
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });

  const [modules, playlists, courses, credentials] = await Promise.all([
    loadCollection("modules", "module.yml"),
    loadCollection("playlists", "playlist.yml"),
    loadCollection("courses", "course.yml"),
    loadCollection("credentials", "credential.yml"),
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
  for (const [type, items] of [["Module", modules], ["Playlist", playlists], ["Course", courses], ["Credential", credentials]]) {
    for (const item of items) {
      if (type !== "Credential") {
        for (const field of ["prerequisites", "learning_outcomes"]) {
          if (!Array.isArray(item[field]) || item[field].length === 0 || item[field].some((value) => typeof value !== "string" || value.trim() === "")) {
            throw new Error(`${type} ${item.slug} must define ${field} as a non-empty list of strings`);
          }
        }
      }
      if (item.restricted_to !== undefined && (!Array.isArray(item.restricted_to) || item.restricted_to.length === 0 || item.restricted_to.some((domain) => typeof domain !== "string" || !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(domain)))) {
        throw new Error(`${type} ${item.slug} has invalid restricted_to domains`);
      }
      item.restricted_to = (item.restricted_to || []).map((domain) => domain.toLocaleLowerCase());
      const assignedDomains = typeof item.assigned_to === "string" ? [item.assigned_to] : item.assigned_to || [];
      if (!Array.isArray(assignedDomains) || assignedDomains.some((domain) => typeof domain !== "string" || !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(domain))) {
        throw new Error(`${type} ${item.slug} has invalid assigned_to domains`);
      }
      item.assigned_to = assignedDomains.map((domain) => domain.toLocaleLowerCase());
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
  credentials.sort((a, b) => a.title.localeCompare(b.title));
  await Promise.all([...courses, ...playlists, ...modules].map(async (item) => {
    item.last_updated = await lastCommitDate(item.directory);
  }));
  const audienceAccess = new Map();
  for (const item of [...courses, ...playlists, ...modules]) {
    for (const audience of Array.isArray(item.audience) ? item.audience : [item.audience]) {
      if (!audience) continue;
      const access = audienceAccess.get(audience) || { name: audience, unrestricted: false, domains: new Set() };
      if (item.restricted_to.length === 0) access.unrestricted = true;
      item.restricted_to.forEach((domain) => access.domains.add(domain));
      audienceAccess.set(audience, access);
    }
  }
  profileAudienceOptions = [...audienceAccess.values()]
    .map((access) => ({ name: access.name, unrestricted: access.unrestricted, domains: [...access.domains].sort() }))
    .sort((left, right) => left.name.localeCompare(right.name));
  const moduleMap = new Map(modules.map((module) => [module.slug, module]));
  const playlistMap = new Map(playlists.map((playlist) => [playlist.slug, playlist]));
  const courseMap = new Map(courses.map((course) => [course.slug, course]));
  const credentialMap = new Map(credentials.map((credential) => [credential.slug, credential]));
  modules.forEach((module) => {
    module.rating = Math.floor(Math.random() * 5) + 1;
    buildSearchContext(module);
  });
  for (const playlist of playlists) {
    if (!Array.isArray(playlist.modules) || playlist.modules.length === 0) throw new Error(`Playlist ${playlist.slug} must define at least one module`);
    const childModules = playlist.modules.map((slug) => {
      const module = moduleMap.get(slug);
      if (!module) throw new Error(`Playlist ${playlist.slug} references missing module ${slug}`);
      return module;
    });
    playlist.rating = averageRating(childModules);
    buildSearchContext(playlist, childModules);
  }
  for (const course of courses) {
    if (!Array.isArray(course.playlists) || course.playlists.length === 0) throw new Error(`Course ${course.slug} must define at least one playlist`);
    if (course.credentials !== undefined && !Array.isArray(course.credentials)) throw new Error(`Course ${course.slug} credentials must be a list`);
    Object.defineProperty(course, "credentialMemberships", {
      value: (course.credentials || []).map((slug) => {
        const credential = credentialMap.get(slug);
        if (!credential) throw new Error(`Course ${course.slug} references missing credential ${slug}`);
        return credential;
      }),
    });
    const childPlaylists = course.playlists.map((slug) => {
      const playlist = playlistMap.get(slug);
      if (!playlist) throw new Error(`Course ${course.slug} references missing playlist ${slug}`);
      return playlist;
    });
    course.rating = averageRating(childPlaylists);
    buildSearchContext(course, childPlaylists);
  }
  for (const module of modules) {
    Object.defineProperty(module, "playlistMemberships", {
      value: playlists.filter((playlist) => playlist.modules.includes(module.slug)),
    });
  }
  for (const playlist of playlists) {
    Object.defineProperty(playlist, "courseMemberships", {
      value: courses.filter((course) => course.playlists.includes(playlist.slug)),
    });
  }
  for (const credential of credentials) {
    if (credential.courses !== undefined && !Array.isArray(credential.courses)) throw new Error(`Credential ${credential.slug} courses must be a list`);
    if (credential.playlists !== undefined && !Array.isArray(credential.playlists)) throw new Error(`Credential ${credential.slug} playlists must be a list`);
    const childCourses = (credential.courses || []).map((slug) => {
      const course = courseMap.get(slug);
      if (!course) throw new Error(`Credential ${credential.slug} references missing course ${slug}`);
      return course;
    });
    const childPlaylists = (credential.playlists || []).map((slug) => {
      const playlist = playlistMap.get(slug);
      if (!playlist) throw new Error(`Credential ${credential.slug} references missing playlist ${slug}`);
      return playlist;
    });
    buildSearchContext(credential, [...childCourses, ...childPlaylists]);
  }
  await Promise.all(modules.map(async (module) => {
    module.pages = await getModulePages(module);
  }));
  await writeCatalog({ courses, playlists, modules, credentials });

  for (const contentRoot of contentRoots) {
    if (await exists(contentRoot.directory)) {
      await cp(contentRoot.directory, path.join(outputRoot, "content", contentRoot.name), { recursive: true });
    }
  }

  const homeFile = path.join(outputRoot, "index.html");
  const catalogFile = path.join(outputRoot, "catalog", "index.html");
  const officialCurriculumFile = path.join(outputRoot, "official-curriculum", "index.html");
  const credentialsFile = path.join(outputRoot, "credentials", "index.html");
  const personalizedPlanFile = path.join(outputRoot, "personalized-plan", "index.html");
  const heroSearchHints = escapeHtml(JSON.stringify([
    "Develop agents with Microsoft Foundry",
    "Use Microsoft Copilot",
    "Analyze data with Microsoft Fabric",
    "Secure cloud resources with Microsoft Defender",
    "Connect agents to MCP tools",
  ]));
  const spotlightPlaylists = [...playlists]
    .sort((left, right) => Date.parse(right.last_updated || 0) - Date.parse(left.last_updated || 0) || left.title.localeCompare(right.title));
  const homeModules = homepageItems(modules, 4, 4);
  const homeContent = `<section class="home-hero"><p class="kicker">AI Skills Nav</p><h1>Skilling in the Name of...</h1><p class="home-hero-summary">Choose a curated path or jump straight into a learning experience.</p>
      <form class="hero-search" role="search" data-site-search data-catalog-url="${relativeUrl(homeFile, catalogFile)}" data-animated-search data-search-hints="${heroSearchHints}">
        <label for="hero-search-input">What do you want to learn how to do?</label>
        <span class="hero-search-controls"><input id="hero-search-input" type="search" name="query" autocomplete="off"><button type="submit" aria-label="Search">${icon("arrow")}</button></span>
        <span class="hero-search-actions"><button class="filter-trigger" type="button" data-filter-open data-catalog-url="${relativeUrl(homeFile, catalogFile)}">Filter<span class="filter-count" data-filter-count hidden></span></button><button class="search-clear" type="button" data-search-clear hidden>Clear</button></span>
      </form>
    </section>
    <section class="catalog-section"><div class="section-heading"><p class="kicker">Curated learning</p><h2>Spotlight Skilling</h2></div><div class="card-grid">${spotlightPlaylists.map((item, index) => card(homeFile, item, "playlists", index >= 4)).join("")}</div></section>
    <section class="catalog-section alt"><div class="section-heading"><p class="kicker">Recently updated and learner favorites</p><h2>New and highly rated</h2></div><div class="card-grid" data-module-grid>${homeModules.items.slice(0, homeModules.featuredCount).map((item) => card(homeFile, item, "modules")).join("")}</div><div class="section-links"><a class="filter-trigger" href="${relativeUrl(homeFile, catalogFile)}">All skilling</a></div></section>
    ${catalogFilterDialog([...courses, ...playlists, ...modules], ["audience", "experience_type", "level", "duration", "modalities"], "the catalog")}`;
  await writePage(homeFile, shell({ outputFile: homeFile, title: "Skilling in the Name of...", avatar: defaultAvatar, agentOptions: { audio: false, useLearnMcp: false, useCatalogSearch: true }, content: homeContent, bodyClass: "home-page", hasModuleCards: true }));

  const catalogItems = [
    ...courses.map((item) => ({ item, type: "courses" })),
    ...playlists.map((item) => ({ item, type: "playlists" })),
    ...modules.map((item) => ({ item, type: "modules" })),
  ].sort((left, right) => left.item.title.localeCompare(right.item.title));
  const catalogSearchForm = catalogSearch("catalog-search-input", "Search all skilling", "Search all skilling");
  const catalogTools = `<div class="catalog-section-tools">${catalogSearchForm}<button class="filter-trigger" type="button" data-filter-open>Filter<span class="filter-count" data-filter-count hidden></span></button></div>`;
  const catalogContent = `<section class="catalog-intro"><p class="kicker">Explore all learning</p><h1>Catalog</h1><p>Browse courses, skilling playlists, and individual learning experiences.</p></section>
    <section class="catalog-section"><div class="section-heading-row"><div class="section-heading"><p class="kicker">All skilling</p><h2>Learning catalog</h2></div>${catalogTools}</div><div class="card-grid catalog-card-grid" data-paged-catalog>${catalogItems.map(({ item, type }) => card(catalogFile, item, type)).join("")}</div><p class="filter-empty" data-catalog-empty role="status" aria-live="polite" hidden>No skilling matches your search and filters.</p><nav class="catalog-pagination" aria-label="Catalog pages" data-catalog-pagination></nav></section>
    ${catalogFilterDialog([...courses, ...playlists, ...modules], ["audience", "experience_type", "level", "duration", "modalities"], "the catalog")}`;
  await writePage(catalogFile, shell({ outputFile: catalogFile, title: "Catalog", breadcrumbs: [{ label: "Catalog" }], avatar: defaultAvatar, content: catalogContent, bodyClass: "catalog-page unified-catalog-page", hasModuleCards: true }));

  const officialCurriculumType = "Microsoft Official Curriculum";
  const officialCourses = courses.filter((item) => item.experience_type === officialCurriculumType);
  const officialSearch = catalogSearch("official-curriculum-search-input", "Search official curriculum", "Search official curriculum");
  const officialTools = `<div class="catalog-section-tools">${officialSearch}<button class="filter-trigger" type="button" data-filter-open>Filter<span class="filter-count" data-filter-count hidden></span></button></div>`;
  const trainingPartnersDialog = `<dialog class="filter-dialog training-partners-dialog" data-training-partners-dialog aria-labelledby="training-partners-title">
    <header class="filter-dialog-header"><div><p class="kicker">Training Services Partners</p><h2 id="training-partners-title">Build skills with trusted experts</h2></div><button class="icon-button" type="button" aria-label="Close training partners" data-training-partners-close>${icon("close")}</button></header>
    <div class="filter-dialog-body training-partners-body"><p>Microsoft Training Services Partners deliver trusted, high&#8209;quality learning experiences designed to support your specific learning and business goals. From instructor&#8209;led and virtual classrooms to flexible blended learning models powered by digital platforms, our partners offer a range of training options aligned to your needs. Explore a global network of Training Services Partners who offer and deliver the latest Microsoft&#8209;developed curriculum and custom-tailored content today.</p></div>
    <footer class="filter-dialog-actions"><button class="text-button" type="button" data-training-partners-close>Close</button><a class="primary-button" href="https://aiskillsnavigator.microsoft.com/training-partners" target="_blank" rel="noopener noreferrer">Find a training partner</a></footer>
  </dialog>`;
  const officialCurriculumContent = `<section class="catalog-intro"><p class="kicker">Microsoft training</p><h1>Official Curriculum</h1><p>Microsoft Official Curriculum training is designed to teach real-world technical skills with Microsoft technologies and prepare you for Microsoft credentials.</p><div class="catalog-intro-action"><a class="filter-trigger" href="#training-partners" data-training-partners-open>Training Services Partners</a></div></section>
    <section class="catalog-section"><div class="section-heading-row"><div class="section-heading"><p class="kicker">Comprehensive training</p><h2>Courses</h2></div>${officialTools}</div><div class="card-grid catalog-card-grid" data-paged-catalog>${officialCourses.map((item) => card(officialCurriculumFile, item, "courses")).join("")}</div><p class="filter-empty" data-course-empty role="status" aria-live="polite" hidden>No courses match your search and filters.</p><nav class="catalog-pagination" aria-label="Official curriculum pages" data-catalog-pagination></nav></section>
    ${catalogFilterDialog(officialCourses, ["audience", "level", "duration", "modalities"], "official curriculum")}${trainingPartnersDialog}`;
  await writePage(officialCurriculumFile, shell({ outputFile: officialCurriculumFile, title: "Official Curriculum", breadcrumbs: [{ label: "Official Curriculum" }], avatar: defaultAvatar, content: officialCurriculumContent, bodyClass: "catalog-page" }));

  const credentialSearch = catalogSearch("credential-search-input", "Search credentials", "Search credentials");
  const credentialTools = `<div class="catalog-section-tools">${credentialSearch}<button class="filter-trigger" type="button" data-filter-open>Filter<span class="filter-count" data-filter-count hidden></span></button></div>`;
  const credentialsContent = `<section class="catalog-intro"><p class="kicker">Validate your skills</p><h1>Credentials</h1><p>Verified, high-value credentials that employers trust. Bridging the gap for both technical and business audiences.</p></section>
    <section class="catalog-section"><div class="section-heading-row"><div class="section-heading"><p class="kicker">Explore the catalog</p><h2>Available credentials</h2></div>${credentialTools}</div><div class="card-grid catalog-card-grid" data-paged-catalog>${credentials.map((item) => card(credentialsFile, item, "credentials")).join("")}</div><p class="filter-empty" data-catalog-empty role="status" aria-live="polite" hidden>No credentials match your search and filters.</p><nav class="catalog-pagination" aria-label="Credential pages" data-catalog-pagination></nav></section>
    ${catalogFilterDialog(credentials, ["credential_type", "audience"], "credentials")}`;
  await writePage(credentialsFile, shell({ outputFile: credentialsFile, title: "Credentials", breadcrumbs: [{ label: "Credentials" }], avatar: defaultAvatar, content: credentialsContent, bodyClass: "catalog-page" }));

  const moduleCatalog = modules.map((module) => ({
    id: module.slug,
    name: module.title,
    description: module.description || "",
    restrictedTo: module.restricted_to,
    path: `modules/${module.slug}/index.html`,
    pages: (module.pages.length > 1 ? module.pages : []).map((page) => ({
      name: page.title,
      path: `modules/${module.slug}/pages/${page.slug}/index.html`,
    })),
    thumbnail: relativeUrl(personalizedPlanFile, path.join(outputRoot, "content", "modules", module.slug, "thumbnail.png")),
  }));
  const personalPlaylistDetail = `<div class="page-actions">${shareTrigger(true, "filter-trigger")}</div>${shareDialog(true, false)}
  <div data-personal-playlists data-auth-only data-module-catalog="${escapeHtml(JSON.stringify(moduleCatalog))}" data-playlist-thumbnail="${relativeUrl(personalizedPlanFile, path.join(outputRoot, "assets", "playlist.png"))}" hidden></div>
  <dialog class="filter-dialog personal-playlist-dialog" data-new-personal-playlist-dialog aria-labelledby="new-personal-playlist-title">
    <form data-new-personal-playlist-form>
      <header class="filter-dialog-header"><div><p class="kicker">Personal collection</p><h2 id="new-personal-playlist-title">New personal playlist</h2></div><button class="icon-button" type="button" aria-label="Close" data-new-personal-playlist-close>${icon("close")}</button></header>
      <div class="filter-dialog-body personal-playlist-fields"><label><span>Name</span><input type="text" maxlength="80" data-new-personal-playlist-name></label><label><span>Description</span><textarea rows="3" maxlength="300" data-new-personal-playlist-description></textarea></label><p class="personal-playlist-status" data-new-personal-playlist-status role="status" aria-live="polite" hidden></p></div>
      <footer class="filter-dialog-actions"><button class="text-button" type="button" data-new-personal-playlist-close>Cancel</button><button class="primary-button" type="submit">Create playlist</button></footer>
    </form>
  </dialog>
  <dialog class="filter-dialog personal-playlist-dialog" data-edit-personal-playlist-dialog aria-labelledby="edit-personal-playlist-title">
    <form data-edit-personal-playlist-form>
      <header class="filter-dialog-header"><div><p class="kicker">Personal collection</p><h2 id="edit-personal-playlist-title">Edit playlist</h2></div><button class="icon-button" type="button" aria-label="Close" data-edit-personal-playlist-close>${icon("close")}</button></header>
      <div class="filter-dialog-body personal-playlist-fields"><label><span>Name</span><input type="text" maxlength="80" data-edit-personal-playlist-name></label><label><span>Description</span><textarea rows="3" maxlength="300" data-edit-personal-playlist-description></textarea></label><p class="personal-playlist-status" data-edit-personal-playlist-status role="status" aria-live="polite" hidden></p></div>
      <footer class="filter-dialog-actions"><button class="text-button" type="button" data-edit-personal-playlist-close>Cancel</button><button class="primary-button" type="submit">Save changes</button></footer>
    </form>
  </dialog>`;
  const personalizedPlanSearch = catalogSearch("personalized-plan-search-input", "Search my skilling plan", "Search my skilling plan");
  const personalizedPlanTools = `<div class="catalog-section-tools personalized-plan-tools">${personalizedPlanSearch}<button class="filter-trigger" type="button" data-filter-open>Filter<span class="filter-count" data-filter-count hidden></span></button></div>`;
  const continueTemplates = modules.map((module) => `<template data-continue-module-template data-module-slug="${escapeHtml(module.slug)}">${card(personalizedPlanFile, module, "modules", false, "continue")}</template>`).join("");
  const personalizedPlanContent = `${personalPlaylistDetail}<div data-personalized-plan data-auth-only data-playlists-url="${relativeUrl(personalizedPlanFile, personalizedPlanFile)}" data-playlist-thumbnail="${relativeUrl(personalizedPlanFile, path.join(outputRoot, "assets", "playlist.png"))}">
    <section class="catalog-intro"><p class="kicker">Personalized learning</p><h1>My skilling plan</h1><p data-personalized-summary>Your recommendations are based on the role selected in your profile.</p></section>
    <section class="catalog-section" data-continue-section hidden><div class="section-heading-row"><div class="section-heading"><p class="kicker">Resume learning</p><h2>Continue where you left off</h2></div>${personalizedPlanTools}</div><div class="card-grid" data-continue-grid></div>${continueTemplates}</section>
    <section class="catalog-section" data-role-skilling-section><div class="section-heading-row" data-role-skilling-heading><div class="section-heading"><p class="kicker">Recommended learning</p><h2>Skilling for my role</h2></div></div><div class="card-grid" data-plan-paged-grid data-role-skilling-grid>${[...courses.map((item) => card(personalizedPlanFile, item, "courses")), ...playlists.map((item) => card(personalizedPlanFile, item, "playlists")), ...modules.map((item) => card(personalizedPlanFile, item, "modules"))].join("")}</div><p class="filter-empty" data-role-skilling-empty hidden>No skilling items match your selected role.</p><nav class="catalog-pagination" aria-label="Skilling for my role pages" data-plan-pagination></nav></section>
    <section class="catalog-section alt" data-other-role-skilling-section hidden><div class="section-heading"><p class="kicker">Explore related paths</p><h2>Skilling for other roles of interest</h2></div><div class="card-grid" data-plan-paged-grid data-other-role-skilling-grid>${[...courses.map((item) => card(personalizedPlanFile, item, "courses")), ...playlists.map((item) => card(personalizedPlanFile, item, "playlists")), ...modules.map((item) => card(personalizedPlanFile, item, "modules"))].join("")}</div><p class="filter-empty" data-other-role-skilling-empty hidden>No skilling items match your other roles of interest.</p><nav class="catalog-pagination" aria-label="Skilling for other roles pages" data-plan-pagination></nav></section>
    <section class="catalog-section alt" data-organization-skilling-section><div class="section-heading"><p class="kicker">Available to your organization</p><h2>Skilling for my organization</h2></div><div class="card-grid" data-plan-paged-grid data-organization-skilling-grid>${[
      ...courses.filter((item) => item.restricted_to.length || item.assigned_to.length).map((item) => card(personalizedPlanFile, item, "courses", false, "organization")),
      ...playlists.filter((item) => item.restricted_to.length || item.assigned_to.length).map((item) => card(personalizedPlanFile, item, "playlists", false, "organization")),
      ...modules.filter((item) => item.restricted_to.length || item.assigned_to.length).map((item) => card(personalizedPlanFile, item, "modules", false, "organization")),
    ].join("")}</div><p class="filter-empty" data-organization-skilling-empty hidden>No skilling items are assigned to your organization.</p><nav class="catalog-pagination" aria-label="Skilling for my organization pages" data-plan-pagination></nav></section>
    <section class="catalog-section"><div class="section-heading"><p class="kicker">Saved by you</p><h2>My playlists</h2></div><div class="card-grid" data-plan-paged-grid data-plan-playlist-grid></div><p class="filter-empty" data-plan-playlist-empty hidden>You have not created any personal playlists yet.</p><nav class="catalog-pagination" aria-label="My playlists pages" data-plan-pagination></nav></section>
    ${catalogFilterDialog([...courses, ...playlists, ...modules], ["audience", "experience_type", "level", "duration", "modalities"], "your skilling plan")}
  </div>`;
  const personalPlaylistSidebar = `<aside class="sidebar" data-sidebar><div class="sidebar-heading"><button class="icon-button menu-toggle" type="button" aria-label="Hide navigation" aria-expanded="true" data-menu-toggle>${icon("menu")}</button><span>Navigation</span></div><nav aria-label="Playlist" data-personal-playlist-navigation></nav></aside><div class="sidebar-scrim" data-menu-close></div>`;
  await writePage(personalizedPlanFile, shell({ outputFile: personalizedPlanFile, title: "My skilling plan", breadcrumbs: [{ label: "My skilling plan" }], sidebar: personalPlaylistSidebar, avatar: defaultAvatar, content: personalizedPlanContent, bodyClass: "catalog-page personalized-page", hasModuleCards: true }));

  for (const credential of credentials) {
    const credentialCourses = (credential.courses || []).map((slug) => courseMap.get(slug));
    const credentialPlaylists = (credential.playlists || []).map((slug) => playlistMap.get(slug));
    const credentialFile = path.join(outputRoot, "credentials", credential.slug, "index.html");
    const credentialBreadcrumbs = [{ label: "Credentials", target: credentialsFile }, { label: credential.title }];
    await writePage(credentialFile, shell({ outputFile: credentialFile, title: credential.title, breadcrumbs: credentialBreadcrumbs, avatar: defaultAvatar, bodyClass: "learning-page", restrictedTo: credential.restricted_to, content: credentialOverview(credentialFile, credential, credentialCourses, credentialPlaylists) }));
  }

  for (const module of modules) {
    const sidebarFactory = module.pages.length > 1 ? (outputFile, activePage) => moduleSidebar(outputFile, module, module.pages, activePage) : null;
    await buildModuleRoute(module, module.pages, path.join(outputRoot, "modules", module.slug), defaultAvatar, sidebarFactory);
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
    const playlistBreadcrumbs = [{ label: "Catalog", target: catalogFile }, { label: playlist.title }];
    const firstModuleTarget = playlistModules.length
      ? path.join(outputRoot, "playlists", playlist.slug, "modules", playlistModules[0].slug, "index.html")
      : null;
    const playlistNavigation = firstModuleTarget ? pageNavigation(playlistFile, null, firstModuleTarget) : "";
    const moduleList = overviewContents(playlistFile, playlistModules, "modules", "In this playlist:", (module) =>
      path.join(outputRoot, "playlists", playlist.slug, "modules", module.slug, "index.html"));
    await writePage(playlistFile, shell({ outputFile: playlistFile, title: playlist.title, breadcrumbs: playlistBreadcrumbs, sidebar, avatar: playlist.avatarData, bodyClass: "learning-page", restrictedTo: playlist.restricted_to, content: overview(playlistFile, playlist, "playlists", "", moduleList, playlistNavigation) }));
    const modulesRoot = path.join(outputRoot, "playlists", playlist.slug, "modules");
    for (const [moduleIndex, module] of playlistModules.entries()) {
      const routeRoot = path.join(outputRoot, "playlists", playlist.slug, "modules", module.slug);
      const sidebarFactory = (outputFile, activePage) => playlistSidebar(outputFile, playlist, playlistModules, module.slug, activePage);
      const breadcrumbParents = [
        { label: "Catalog", target: catalogFile },
        ...(playlistModules.length > 1 ? [{ label: playlist.title, target: playlistFile }] : []),
      ];
      const previousTarget = moduleIndex > 0
        ? moduleEndTarget(modulesRoot, playlistModules[moduleIndex - 1])
        : playlistModules.length > 1 ? playlistFile : null;
      const nextTarget = moduleIndex < playlistModules.length - 1
        ? moduleStartTarget(modulesRoot, playlistModules[moduleIndex + 1])
        : null;
      await buildModuleRoute(module, module.pages, routeRoot, defaultAvatar, sidebarFactory, breadcrumbParents, { previousTarget, nextTarget, restrictedTo: playlist.restricted_to });
    }
  }

  for (const course of courses) {
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
    const courseBreadcrumbs = [{ label: "Catalog", target: catalogFile }, { label: course.title }];
    await writePage(courseFile, shell({ outputFile: courseFile, title: course.title, breadcrumbs: courseBreadcrumbs, sidebar: courseSidebar(courseFile, course, coursePlaylists), avatar: course.avatarData, bodyClass: "learning-page", restrictedTo: course.restricted_to, content: courseOverview(courseFile, course, coursePlaylists, course.credentialMemberships) }));

    const coursePlaylistsRoot = path.join(outputRoot, "courses", course.slug, "playlists");
    for (const [playlistIndex, playlist] of coursePlaylists.entries()) {
      const playlistFile = path.join(outputRoot, "courses", course.slug, "playlists", playlist.slug, "index.html");
      const playlistBreadcrumbs = [
        { label: "Catalog", target: catalogFile },
        { label: course.title, target: courseFile },
        { label: playlist.title },
      ];
      const firstModuleTarget = playlist.modules.length
        ? path.join(outputRoot, "courses", course.slug, "playlists", playlist.slug, "modules", playlist.modules[0].slug, "index.html")
        : null;
      const previousPlaylist = coursePlaylists.slice(0, playlistIndex).reverse().find((item) => item.modules.length);
      const nextPlaylist = coursePlaylists.slice(playlistIndex + 1).find((item) => item.modules.length);
      const previousPlaylistTarget = previousPlaylist ? playlistEndTarget(coursePlaylistsRoot, previousPlaylist) : null;
      const nextPlaylistTarget = nextPlaylist ? playlistEntryTarget(coursePlaylistsRoot, nextPlaylist) : null;
      const playlistNavigation = playlist.modules.length > 1
        ? pageNavigation(playlistFile, previousPlaylistTarget, firstModuleTarget)
        : "";
      const moduleList = overviewContents(playlistFile, playlist.modules, "modules", "In this playlist:", (module) =>
        path.join(outputRoot, "courses", course.slug, "playlists", playlist.slug, "modules", module.slug, "index.html"));
      const playlistRestrictions = combinedRestrictions(course.restricted_to, playlist.restricted_to);
      await writePage(playlistFile, shell({ outputFile: playlistFile, title: playlist.title, breadcrumbs: playlistBreadcrumbs, sidebar: courseSidebar(playlistFile, course, coursePlaylists, playlist.slug), avatar: playlist.avatarData, bodyClass: "learning-page", restrictedTo: playlistRestrictions, content: overview(playlistFile, playlist, "playlists", "", moduleList, playlistNavigation) }));

      const modulesRoot = path.join(coursePlaylistsRoot, playlist.slug, "modules");
      for (const [moduleIndex, module] of playlist.modules.entries()) {
        const routeRoot = path.join(outputRoot, "courses", course.slug, "playlists", playlist.slug, "modules", module.slug);
        const sidebarFactory = (outputFile, activePage) => courseSidebar(outputFile, course, coursePlaylists, playlist.slug, module.slug, activePage);
        const breadcrumbParents = [
          { label: "Catalog", target: catalogFile },
          { label: course.title, target: courseFile },
          ...(playlist.modules.length > 1 ? [{ label: playlist.title, target: playlistFile }] : []),
        ];
        const previousTarget = moduleIndex > 0
          ? moduleEndTarget(modulesRoot, playlist.modules[moduleIndex - 1])
          : playlist.modules.length > 1 ? playlistFile : previousPlaylistTarget;
        const nextTarget = moduleIndex < playlist.modules.length - 1
          ? moduleStartTarget(modulesRoot, playlist.modules[moduleIndex + 1])
          : nextPlaylistTarget;
        await buildModuleRoute(module, module.pages, routeRoot, defaultAvatar, sidebarFactory, breadcrumbParents, { previousTarget, nextTarget, restrictedTo: playlistRestrictions });
      }
    }
  }

  await mkdir(path.join(outputRoot, "assets"), { recursive: true });
  await Promise.all([
    copyFile(path.join(root, "site", "styles.css"), path.join(outputRoot, "assets", "styles.css")),
    copyFile(path.join(root, "site", "app.js"), path.join(outputRoot, "assets", "app.js")),
    copyFile(path.join(root, "site", "moderation.txt"), path.join(outputRoot, "assets", "moderation.txt")),
    copyFile(path.join(root, "site", "media", "microsoft-logo.svg"), path.join(outputRoot, "assets", "microsoft-logo.svg")),
    copyFile(path.join(root, "site", "media", "playlist.png"), path.join(outputRoot, "assets", "playlist.png")),
    copyFile(path.join(root, "site", "media", "favicon.ico"), path.join(outputRoot, "favicon.ico")),
    cp(path.join(root, "templates", "media"), path.join(outputRoot, "content", "templates", "media"), { recursive: true }),
    writeFile(path.join(outputRoot, ".nojekyll"), "", "utf8"),
  ]);
  console.log(`Built ${modules.length} modules, ${playlists.length} playlists, ${courses.length} courses, and ${credentials.length} credentials in dist/`);
}

await build();