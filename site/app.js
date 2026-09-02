// This file is the only client-side runtime for the generated static site. The
// build script emits data-* attributes into each page, and the sections below
// progressively enhance only the features whose marker attributes are present.
// Keeping every feature guarded lets one shared script run on all page types.

// Use one definition of common conversational words for both catalog search and
// avatar knowledge retrieval. The list covers English function words and
// generic request language, but deliberately retains domain-bearing verbs such
// as "develop", "build", "create", and "implement". Product-name punctuation
// such as C++, C#, and .NET is preserved by normalizeSearchTerms below.
const searchStopWords = new Set([
  // Articles, conjunctions, quantifiers, and common adverbs.
  "a", "about", "above", "after", "again", "against", "all", "also", "an", "and", "any", "as", "at",
  "before", "below", "between", "both", "but", "by", "down", "during", "each", "few", "for", "from", "further",
  "here", "just", "more", "most", "no", "nor", "not", "now", "of", "off", "on", "once", "only",
  "or", "other", "out", "over", "own", "same", "so", "some", "such", "than", "then", "there", "through",
  "too", "under", "until", "up", "very", "while",

  // Pronouns, possessives, and demonstratives.
  "he", "her", "hers", "herself", "him", "himself", "his", "i", "it", "its", "itself", "me", "my",
  "myself", "our", "ours", "ourselves", "she", "that", "their", "theirs", "them", "themselves", "these",
  "they", "this", "those", "we", "what", "when", "where", "which", "who", "whom", "why", "you", "your",
  "yours", "yourself", "yourselves",

  // Auxiliary/modal verbs and fragments produced when contractions are split.
  "am", "are", "be", "because", "been", "being", "can", "could", "d", "did", "do", "does", "doing",
  "had", "has", "have", "having", "how", "if", "in", "into", "is", "ll", "m", "re", "s", "should",
  "t", "the", "to", "ve", "was", "were", "will", "with", "would",

  // Generic words used to frame a search request rather than describe its topic.
  "course", "courses", "describe", "explain", "find", "get", "getting", "give", "help", "information",
  "know", "learn", "learning", "look", "looking", "need", "please", "search", "show", "tell", "use", "using",
  "want",
]);
const normalizeSearchTerms = (value) => value
  .toLocaleLowerCase()
  .replace(/[^a-z0-9+#.-]+/g, " ")
  .trim()
  .split(/\s+/)
  .filter((term) => term && !searchStopWords.has(term));

// Personal playlists deliberately live in browser storage: the proof of
// concept has no account system or backend. Module paths are stored relative to
// the site root so the same record works when GitHub Pages uses a repo subpath.
const personalPlaylistsStorageKey = "ai-skills-nav:personal-playlists";

/**
 * Read and defensively normalize personal playlists from localStorage.
 *
 * Storage is user-controlled and can be stale, manually edited, or unavailable
 * in privacy modes. Returning an empty array on failure keeps the rest of the
 * site usable, while filtering malformed records prevents later DOM code from
 * having to repeat type checks.
 */
const readPersonalPlaylists = () => {
  try {
    const playlists = JSON.parse(localStorage.getItem(personalPlaylistsStorageKey) || "[]");
    if (!Array.isArray(playlists)) return [];
    return playlists.filter((playlist) => playlist && typeof playlist.id === "string" && typeof playlist.name === "string").map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      description: typeof playlist.description === "string" ? playlist.description : "",
      modules: Array.isArray(playlist.modules) ? playlist.modules.filter((module) => module && typeof module.name === "string" && typeof module.path === "string") : [],
    }));
  } catch {
    return [];
  }
};

/** Persist the complete playlist collection and report quota/security errors. */
const writePersonalPlaylists = (playlists) => {
  try {
    localStorage.setItem(personalPlaylistsStorageKey, JSON.stringify(playlists));
    return true;
  } catch {
    return false;
  }
};

const menuIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';

/**
 * Recreate playlist navigation when a standalone module was opened from a
 * personal playlist. Curated playlist pages get their sidebar at build time,
 * but personal playlists exist only in localStorage, so their sidebar must be
 * generated in the browser from the `?playlist=<id>` context.
 */
const hydratePersonalPlaylistSidebar = () => {
  const moduleSlug = document.body.dataset.moduleSlug;
  const playlistId = new URLSearchParams(window.location.search).get("playlist");
  const playlist = playlistId && readPersonalPlaylists().find((item) => item.id === playlistId);
  const playlistDialog = document.querySelector("[data-personal-playlist-dialog]");
  // The dialog supplies the correctly depth-adjusted URL to My Playlists. It is
  // also a reliable marker that this is a generated standalone module page.
  if (!moduleSlug || !playlist || !playlistDialog) return;

  const frame = document.querySelector(".site-frame");
  const main = frame?.querySelector("main");
  if (!frame || !main || frame.querySelector("[data-sidebar]")) return;
  const playlistsUrl = new URL(playlistDialog.dataset.playlistsUrl, window.location.href);
  // URL objects avoid assumptions about whether the site is hosted at `/` or
  // under a GitHub Pages repository prefix.
  const withPlaylistContext = (url) => {
    url.searchParams.set("playlist", playlist.id);
    return url.href;
  };

  const sidebar = document.createElement("aside");
  sidebar.className = "sidebar";
  sidebar.dataset.sidebar = "";
  const heading = document.createElement("div");
  heading.className = "sidebar-heading";
  const hideButton = document.createElement("button");
  hideButton.className = "icon-button menu-toggle";
  hideButton.type = "button";
  hideButton.setAttribute("aria-label", "Hide navigation");
  hideButton.setAttribute("aria-expanded", "true");
  hideButton.dataset.menuToggle = "";
  hideButton.innerHTML = menuIcon;
  const headingText = document.createElement("span");
  headingText.textContent = "Navigation";
  heading.append(hideButton, headingText);

  const navigation = document.createElement("nav");
  navigation.setAttribute("aria-label", "Playlist");
  const playlistLink = document.createElement("a");
  playlistLink.className = "playlist-link";
  playlistLink.href = withPlaylistContext(playlistsUrl);
  playlistLink.textContent = playlist.name;
  const moduleList = document.createElement("ul");
  const activePath = `modules/${moduleSlug}/index.html`;
  playlist.modules.forEach((module) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.classList.toggle("active", module.path === activePath);
    link.href = withPlaylistContext(new URL(`../${module.path}`, playlistsUrl));
    link.textContent = module.name;
    item.append(link);
    moduleList.append(item);
  });
  navigation.append(playlistLink, moduleList);
  sidebar.append(heading, navigation);

  const scrim = document.createElement("div");
  scrim.className = "sidebar-scrim";
  scrim.dataset.menuClose = "";
  const revealButton = document.createElement("button");
  revealButton.className = "icon-button nav-reveal";
  revealButton.type = "button";
  revealButton.setAttribute("aria-label", "Show navigation");
  revealButton.setAttribute("aria-expanded", "false");
  revealButton.dataset.menuReveal = "";
  revealButton.innerHTML = menuIcon;
  frame.classList.add("has-sidebar");
  frame.insertBefore(sidebar, main);
  frame.insertBefore(scrim, main);
  frame.insertBefore(revealButton, main);

  // Preserve personal-playlist context only for links that remain within this
  // module. Other site links should continue to behave as ordinary navigation.
  const moduleRoot = new URL(`../modules/${moduleSlug}/`, playlistsUrl).pathname;
  main.querySelectorAll("a[href]").forEach((link) => {
    const target = new URL(link.href, window.location.href);
    if (target.origin === window.location.origin && target.pathname.startsWith(moduleRoot)) link.href = withPlaylistContext(target);
  });
  main.querySelectorAll("[data-page-select] option").forEach((option) => {
    const target = new URL(option.value, window.location.href);
    if (target.origin === window.location.origin && target.pathname.startsWith(moduleRoot)) option.value = withPlaylistContext(target);
  });
};

// Run hydration before querying sidebar controls so any dynamically inserted
// controls participate in the shared menu behavior below.
hydratePersonalPlaylistSidebar();

// ---------------------------------------------------------------------------
// Responsive sidebar navigation
// ---------------------------------------------------------------------------
const menuToggle = document.querySelector("[data-menu-toggle]");
const menuReveal = document.querySelector("[data-menu-reveal]");
const sidebar = document.querySelector("[data-sidebar]");

if (menuToggle && window.matchMedia("(max-width: 860px)").matches) {
  menuToggle.setAttribute("aria-expanded", "false");
}

function setMenu(open) {
  // `menu-open` controls the mobile drawer and scrim. aria-expanded is mirrored
  // on both controls because either one may currently be visible.
  document.body.classList.toggle("menu-open", open);
  menuToggle?.setAttribute("aria-expanded", String(open));
  menuReveal?.setAttribute("aria-expanded", String(open));
  if (open) sidebar?.querySelector("a")?.focus();
  else menuReveal?.focus();
}

menuToggle?.addEventListener("click", () => {
  if (window.matchMedia("(max-width: 860px)").matches) {
    // On small screens the toggle is inside the drawer, so it closes the
    // temporary overlay instead of collapsing a permanent layout column.
    setMenu(false);
    return;
  }
  document.body.classList.add("nav-collapsed");
  menuToggle.setAttribute("aria-expanded", "false");
  menuReveal?.setAttribute("aria-expanded", "false");
  menuReveal?.focus();
});

menuReveal?.addEventListener("click", () => {
  if (window.matchMedia("(max-width: 860px)").matches) {
    setMenu(true);
    return;
  }
  document.body.classList.remove("nav-collapsed");
  menuToggle?.setAttribute("aria-expanded", "true");
  menuReveal.setAttribute("aria-expanded", "true");
  menuToggle?.focus();
});

document.querySelectorAll("[data-menu-close]").forEach((button) => button.addEventListener("click", () => setMenu(false)));

// ---------------------------------------------------------------------------
// Module zone pivots and page selection
// ---------------------------------------------------------------------------
const moduleSlug = document.body.dataset.moduleSlug;

document.querySelectorAll("[data-pivot]").forEach((pivot) => {
  const tabs = [...pivot.querySelectorAll('[role="tab"]')];
  const panels = [...pivot.querySelectorAll('[role="tabpanel"]')];
  const normalizePivot = (value) => value.trim().toLocaleLowerCase();
  // A sorted label signature groups equivalent pivots even if authors place
  // their tabs in a different order. This lets a learner's choice (for example,
  // "Text") carry to another equivalent pivot in the same module.
  const pivotSignature = tabs.map((tab) => normalizePivot(tab.textContent)).sort().join("|");
  const storageKey = moduleSlug ? `ai-skills-nav:pivots:${moduleSlug}` : "";
  const readPreferences = () => {
    if (!storageKey) return {};
    try {
      const preferences = JSON.parse(localStorage.getItem(storageKey) || "{}");
      return preferences && typeof preferences === "object" && !Array.isArray(preferences) ? preferences : {};
    } catch {
      return {};
    }
  };
  const activate = (selected, persist = false) => {
    // Follow the ARIA tabs pattern: exactly one tab is selected and tabbable,
    // and exactly its corresponding panel is visible.
    tabs.forEach((tab, index) => {
      const active = tab === selected;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[index].hidden = !active;
    });
    if (persist && storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          ...readPreferences(),
          [pivotSignature]: normalizePivot(selected.textContent),
        }));
      } catch {
        // Pivots remain usable when storage is unavailable.
      }
    }
  };
  const savedPivot = readPreferences()[pivotSignature];
  const savedTab = tabs.find((tab) => normalizePivot(tab.textContent) === savedPivot);
  if (savedTab) activate(savedTab);
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab, true));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : index + (event.key === "ArrowRight" ? 1 : -1);
      next = (next + tabs.length) % tabs.length;
      activate(tabs[next], true);
      tabs[next].focus();
    });
  });
});

// The option values are already relative URLs generated for the current route.
document.querySelectorAll("[data-page-select]").forEach((select) => {
  select.addEventListener("change", () => window.location.assign(select.value));
});

// ---------------------------------------------------------------------------
// "Add to personal playlist" dialog on module pages and module catalog cards
// ---------------------------------------------------------------------------
const personalPlaylistDialog = document.querySelector("[data-personal-playlist-dialog]");

if (personalPlaylistDialog) {
  const form = personalPlaylistDialog.querySelector("[data-personal-playlist-form]");
  const select = form.querySelector("[data-personal-playlist-select]");
  const newFields = form.querySelector("[data-personal-playlist-new]");
  const nameInput = form.querySelector("[data-personal-playlist-name]");
  const descriptionInput = form.querySelector("[data-personal-playlist-description]");
  const status = form.querySelector("[data-personal-playlist-status]");
  const submitButton = form.querySelector("[data-personal-playlist-submit]");
  const goLink = form.querySelector("[data-personal-playlist-go]");

  const showStatus = (message, error = false) => {
    status.textContent = message;
    status.classList.toggle("is-error", error);
    status.hidden = false;
  };

  const showNewPlaylistFields = () => {
    // One dialog handles both selecting an existing collection and creating a
    // new one, keeping module metadata available in a single interaction.
    newFields.hidden = select.value !== "new";
    if (!newFields.hidden) nameInput.focus();
  };

  const populatePlaylists = () => {
    const playlists = readPersonalPlaylists();
    select.replaceChildren();
    playlists.forEach((playlist) => select.add(new Option(playlist.name, playlist.id)));
    select.add(new Option("Create a new playlist", "new"));
    // Prefer the first existing playlist; otherwise reveal creation fields.
    select.value = playlists.length ? playlists[0].id : "new";
    showNewPlaylistFields();
  };

  const resetDialog = () => {
    form.reset();
    status.hidden = true;
    status.classList.remove("is-error");
    submitButton.hidden = false;
    goLink.hidden = true;
  };

  document.querySelectorAll("[data-personal-playlist-open]").forEach((trigger) => trigger.addEventListener("click", (event) => {
    event.preventDefault();
    // Card buttons identify their module at runtime. The module-page link uses
    // the defaults embedded directly on the shared dialog by the build.
    if (trigger.dataset.moduleName && trigger.dataset.modulePath) {
      personalPlaylistDialog.dataset.moduleName = trigger.dataset.moduleName;
      personalPlaylistDialog.dataset.modulePath = trigger.dataset.modulePath;
    }
    resetDialog();
    populatePlaylists();
    personalPlaylistDialog.showModal();
  }));
  select.addEventListener("change", showNewPlaylistFields);
  personalPlaylistDialog.querySelectorAll("[data-personal-playlist-close]").forEach((button) => button.addEventListener("click", () => personalPlaylistDialog.close()));
  personalPlaylistDialog.addEventListener("click", (event) => {
    if (event.target === personalPlaylistDialog) personalPlaylistDialog.close();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const playlists = readPersonalPlaylists();
    let playlist;
    if (select.value === "new") {
      const name = nameInput.value.trim();
      if (!name) {
        showStatus("Enter a name for the new playlist.", true);
        nameInput.focus();
        return;
      }
      if (playlists.some((item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
        showStatus("A playlist with that name already exists.", true);
        nameInput.focus();
        return;
      }
      playlist = {
        id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name,
        description: descriptionInput.value.trim(),
        modules: [],
      };
      playlists.push(playlist);
    } else {
      playlist = playlists.find((item) => item.id === select.value);
    }
    if (!playlist) {
      showStatus("The selected playlist is no longer available.", true);
      return;
    }
    // The canonical module path, rather than its display name, is the identity.
    // Titles can change between builds without allowing accidental duplicates.
    const alreadyAdded = playlist.modules.some((module) => module.path === personalPlaylistDialog.dataset.modulePath);
    if (!alreadyAdded) {
      playlist.modules.push({ name: personalPlaylistDialog.dataset.moduleName, path: personalPlaylistDialog.dataset.modulePath });
    }
    if (!writePersonalPlaylists(playlists)) {
      showStatus("Your browser could not save the playlist.", true);
      return;
    }
    showStatus(alreadyAdded ? `This learning experience is already in ${playlist.name}.` : `Added this learning experience to ${playlist.name}.`);
    submitButton.hidden = true;
    goLink.href = `${personalPlaylistDialog.dataset.playlistsUrl}?playlist=${encodeURIComponent(playlist.id)}`;
    goLink.hidden = false;
  });
}

// ---------------------------------------------------------------------------
// My Playlists collection and detail views
// ---------------------------------------------------------------------------
const personalPlaylistsPage = document.querySelector("[data-personal-playlists]");

if (personalPlaylistsPage) {
  // The build embeds the current module catalog. It is the source of truth for
  // display names and is also used to remove references to deleted modules.
  const moduleCatalog = new Map(JSON.parse(personalPlaylistsPage.dataset.moduleCatalog).map((module) => [module.path, module]));
  const playlistId = new URLSearchParams(window.location.search).get("playlist");
  const moduleUrl = (modulePath) => {
    // Resolve from My Playlists and retain the selected collection so the
    // destination module can hydrate the browser-generated sidebar.
    const url = new URL(`../${modulePath}`, window.location.href);
    if (playlistId) url.searchParams.set("playlist", playlistId);
    return url.href;
  };

  const createCard = (playlist) => {
    // Use DOM APIs and textContent for user-authored names/descriptions rather
    // than interpolating strings into HTML, avoiding markup injection.
    const card = document.createElement("a");
    card.className = "content-card";
    card.href = `?playlist=${encodeURIComponent(playlist.id)}`;
    const imageContainer = document.createElement("span");
    imageContainer.className = "card-image";
    const image = document.createElement("img");
    image.src = personalPlaylistsPage.dataset.playlistThumbnail;
    image.alt = "";
    image.loading = "lazy";
    imageContainer.append(image);
    const body = document.createElement("span");
    body.className = "card-body";
    const title = document.createElement("strong");
    title.textContent = playlist.name;
    const description = document.createElement("span");
    description.textContent = playlist.description;
    body.append(title, description);
    card.append(imageContainer, body);
    return card;
  };

  const renderCollection = () => {
    // The generated page includes a dormant sidebar for detail mode. Collection
    // mode removes it and returns to the normal full-width catalog layout.
    const playlists = readPersonalPlaylists();
    personalPlaylistsPage.closest(".site-frame").classList.remove("has-sidebar");
    document.querySelector("[data-sidebar]")?.remove();
    document.querySelector("[data-menu-reveal]")?.remove();
    document.querySelector("[data-menu-close]")?.remove();
    const grid = personalPlaylistsPage.querySelector("[data-personal-playlist-grid]");
    grid.replaceChildren(...playlists.map(createCard));
    personalPlaylistsPage.querySelector("[data-personal-playlist-empty]").hidden = playlists.length !== 0;
  };

  const newPlaylistDialog = document.querySelector("[data-new-personal-playlist-dialog]");
  const newPlaylistForm = newPlaylistDialog.querySelector("[data-new-personal-playlist-form]");
  const newPlaylistName = newPlaylistForm.querySelector("[data-new-personal-playlist-name]");
  const newPlaylistDescription = newPlaylistForm.querySelector("[data-new-personal-playlist-description]");
  const newPlaylistStatus = newPlaylistForm.querySelector("[data-new-personal-playlist-status]");

  document.querySelector("[data-new-personal-playlist-open]")?.addEventListener("click", () => {
    newPlaylistForm.reset();
    newPlaylistStatus.hidden = true;
    newPlaylistStatus.classList.remove("is-error");
    newPlaylistDialog.showModal();
    newPlaylistName.focus();
  });
  newPlaylistDialog.querySelectorAll("[data-new-personal-playlist-close]").forEach((button) => button.addEventListener("click", () => newPlaylistDialog.close()));
  newPlaylistDialog.addEventListener("click", (event) => {
    if (event.target === newPlaylistDialog) newPlaylistDialog.close();
  });
  newPlaylistForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = newPlaylistName.value.trim();
    const playlists = readPersonalPlaylists();
    if (!name) {
      newPlaylistStatus.textContent = "Enter a name for the new playlist.";
      newPlaylistStatus.classList.add("is-error");
      newPlaylistStatus.hidden = false;
      newPlaylistName.focus();
      return;
    }
    if (playlists.some((playlist) => playlist.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      newPlaylistStatus.textContent = "A playlist with that name already exists.";
      newPlaylistStatus.classList.add("is-error");
      newPlaylistStatus.hidden = false;
      newPlaylistName.focus();
      return;
    }
    playlists.push({
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      description: newPlaylistDescription.value.trim(),
      modules: [],
    });
    if (!writePersonalPlaylists(playlists)) {
      newPlaylistStatus.textContent = "Your browser could not save the playlist.";
      newPlaylistStatus.classList.add("is-error");
      newPlaylistStatus.hidden = false;
      return;
    }
    newPlaylistDialog.close();
    renderCollection();
  });

  const renderPlaylist = (playlist, playlists) => {
    // Reconcile persisted data with the latest static catalog. This keeps names
    // current after a content update and silently prunes modules that no longer
    // exist in the deployment.
    const before = JSON.stringify(playlist.modules);
    playlist.modules = playlist.modules.filter((module) => moduleCatalog.has(module.path)).map((module) => ({
      name: moduleCatalog.get(module.path).name,
      path: module.path,
    }));
    if (JSON.stringify(playlist.modules) !== before) writePersonalPlaylists(playlists);

    document.title = `${playlist.name} | AI Skills Nav`;
    const frame = personalPlaylistsPage.closest(".site-frame");
    const navigation = frame.querySelector("[data-personal-playlist-navigation]");
    // This function also runs after a reorder/removal, so replace the existing
    // navigation instead of appending a second copy.
    navigation.replaceChildren();
    const playlistLink = document.createElement("a");
    playlistLink.className = "playlist-link active";
    playlistLink.href = window.location.href;
    playlistLink.textContent = playlist.name;
    const moduleList = document.createElement("ul");
    playlist.modules.forEach((module) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = moduleUrl(module.path);
      link.textContent = module.name;
      item.append(link);
      moduleList.append(item);
    });
    navigation.append(playlistLink, moduleList);

    personalPlaylistsPage.replaceChildren();
    const overview = document.createElement("article");
    overview.className = "overview";
    const media = document.createElement("div");
    media.className = "overview-media";
    const overviewImage = document.createElement("div");
    overviewImage.className = "overview-image";
    const image = document.createElement("img");
    image.src = personalPlaylistsPage.dataset.playlistThumbnail;
    image.alt = "";
    overviewImage.append(image);
    media.append(overviewImage);
    if (playlist.modules.length) {
      // Start uses the same playlist-aware URL as the sidebar so the module can
      // reconstruct this personal playlist's navigation and learning order.
      const startLink = document.createElement("a");
      startLink.className = "primary-button playlist-start";
      startLink.href = moduleUrl(playlist.modules[0].path);
      startLink.textContent = "Start";
      media.append(startLink);
    }
    const copy = document.createElement("div");
    copy.className = "overview-copy";
    const kicker = document.createElement("p");
    kicker.className = "kicker";
    kicker.textContent = "Personal playlist";
    const title = document.createElement("h1");
    title.textContent = playlist.name;
    const description = document.createElement("p");
    description.className = "lede";
    description.textContent = playlist.description;

    const manageSection = document.createElement("section");
    manageSection.className = "personal-playlist-manage";
    manageSection.setAttribute("aria-labelledby", "personal-playlist-modules-title");
    const manageTitle = document.createElement("h2");
    manageTitle.id = "personal-playlist-modules-title";
    manageTitle.tabIndex = -1;
    manageTitle.textContent = "Modules";
    const manageHelp = document.createElement("p");
    manageHelp.className = "personal-playlist-manage-help";
    manageHelp.textContent = "Change the learning order or remove modules from this playlist.";
    const manageStatus = document.createElement("p");
    manageStatus.className = "sr-only";
    manageStatus.setAttribute("role", "status");
    manageStatus.setAttribute("aria-live", "polite");
    const managedList = document.createElement("ol");
    managedList.className = "personal-playlist-module-list";

    // Persist one mutation, redraw both the management list and sidebar, then
    // restore keyboard focus to the moved module (or the section after removal).
    const saveModuleChanges = (message, focusPath = "", previousModules = playlist.modules) => {
      if (!writePersonalPlaylists(playlists)) {
        playlist.modules = previousModules;
        manageStatus.className = "personal-playlist-status is-error";
        manageStatus.textContent = "Your browser could not update the playlist.";
        return;
      }
      renderPlaylist(playlist, playlists);
      const updatedSection = personalPlaylistsPage.querySelector(".personal-playlist-manage");
      const updatedStatus = updatedSection.querySelector('[role="status"]');
      updatedStatus.textContent = message;
      const focusTarget = focusPath
        ? updatedSection.querySelector(`[data-module-path="${CSS.escape(focusPath)}"] .personal-playlist-move-up`)
        : updatedSection.querySelector("h2");
      focusTarget?.focus();
    };

    playlist.modules.forEach((module, index) => {
      const item = document.createElement("li");
      item.dataset.modulePath = module.path;
      const moduleDetails = document.createElement("div");
      moduleDetails.className = "personal-playlist-module-details";
      const thumbnail = document.createElement("img");
      thumbnail.className = "personal-playlist-module-thumbnail";
      thumbnail.src = moduleCatalog.get(module.path).thumbnail;
      thumbnail.alt = "";
      thumbnail.loading = "lazy";
      const moduleLink = document.createElement("a");
      moduleLink.href = moduleUrl(module.path);
      moduleLink.textContent = module.name;
      moduleDetails.append(thumbnail, moduleLink);
      const actions = document.createElement("div");
      actions.className = "personal-playlist-module-actions";

      const moveUp = document.createElement("button");
      moveUp.className = "text-button personal-playlist-move-up";
      moveUp.type = "button";
      moveUp.textContent = "Move up";
      moveUp.disabled = index === 0;
      moveUp.setAttribute("aria-label", `Move ${module.name} up`);
      moveUp.addEventListener("click", () => {
        const previousModules = [...playlist.modules];
        [playlist.modules[index - 1], playlist.modules[index]] = [playlist.modules[index], playlist.modules[index - 1]];
        saveModuleChanges(`${module.name} moved up.`, module.path, previousModules);
      });

      const moveDown = document.createElement("button");
      moveDown.className = "text-button";
      moveDown.type = "button";
      moveDown.textContent = "Move down";
      moveDown.disabled = index === playlist.modules.length - 1;
      moveDown.setAttribute("aria-label", `Move ${module.name} down`);
      moveDown.addEventListener("click", () => {
        const previousModules = [...playlist.modules];
        [playlist.modules[index], playlist.modules[index + 1]] = [playlist.modules[index + 1], playlist.modules[index]];
        saveModuleChanges(`${module.name} moved down.`, module.path, previousModules);
      });

      const remove = document.createElement("button");
      remove.className = "text-button personal-playlist-module-remove";
      remove.type = "button";
      remove.textContent = "Remove";
      remove.setAttribute("aria-label", `Remove ${module.name} from this playlist`);
      remove.addEventListener("click", () => {
        const previousModules = [...playlist.modules];
        playlist.modules.splice(index, 1);
        saveModuleChanges(`${module.name} removed from the playlist.`, "", previousModules);
      });

      actions.append(moveUp, moveDown, remove);
      item.append(moduleDetails, actions);
      managedList.append(item);
    });

    if (!playlist.modules.length) {
      const empty = document.createElement("p");
      empty.className = "personal-playlist-manage-empty";
      empty.textContent = "This playlist does not contain any modules yet.";
      manageSection.append(manageTitle, manageHelp, manageStatus, empty);
    } else {
      manageSection.append(manageTitle, manageHelp, manageStatus, managedList);
    }

    const deleteButton = document.createElement("button");
    deleteButton.className = "text-button personal-playlist-delete";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete playlist";
    deleteButton.addEventListener("click", () => {
      if (!window.confirm(`Delete ${playlist.name}?`)) return;
      writePersonalPlaylists(playlists.filter((item) => item.id !== playlist.id));
      window.location.assign(window.location.pathname);
    });
    copy.append(kicker, title, description, manageSection, deleteButton);
    overview.append(media, copy);
    personalPlaylistsPage.append(overview);
  };

  const playlists = readPersonalPlaylists();
  const selectedPlaylist = playlists.find((playlist) => playlist.id === playlistId);
  // An absent or stale query-string ID intentionally falls back to the list.
  if (playlistId && selectedPlaylist) renderPlaylist(selectedPlaylist, playlists);
  else renderCollection();
}

// ---------------------------------------------------------------------------
// Catalog search and metadata filters
// ---------------------------------------------------------------------------
// Catalog pages declare their supported filter fields in data-filter-fields.
// Home has search cards but no filter dialog, allowing the same logic to serve
// all page types without route-specific code.
const filterDialog = document.querySelector("[data-filter-dialog]");
const filterForm = filterDialog?.querySelector("[data-filter-form]");
const catalogCards = [...document.querySelectorAll("[data-catalog-card]")];
const filterCards = [...document.querySelectorAll("[data-filter-card]")];
const filterFields = filterDialog?.dataset.filterFields.split(",").filter(Boolean) || [];
const searchForm = document.querySelector("[data-site-search]");
const searchInput = searchForm?.querySelector('input[type="search"]');
const searchClear = searchForm?.querySelector("[data-search-clear]");
const courseEmptyState = document.querySelector("[data-course-empty]");
const moduleEmptyState = document.querySelector("[data-module-empty]");
const playlistEmptyState = document.querySelector("[data-playlist-empty]");
const catalogEmptyState = document.querySelector("[data-catalog-empty]");
let appliedFilters = Object.fromEntries(filterFields.map((field) => [field, []]));
let appliedModalitiesMode = "all";
let searchTerms = [];
let searchActive = false;

// Every submitted term is required, giving search case-insensitive AND
// semantics. Search text is normalized and embedded by the build script.
const matchesSearch = (card) => searchTerms.every((term) => card.dataset.searchText.includes(term));

const applyCatalogVisibility = () => {
  let visibleModules = 0;
  let visiblePlaylists = 0;
  let visibleCourses = 0;
  let visibleCatalogItems = 0;
  catalogCards.forEach((card) => {
    let matches = matchesSearch(card);
    // Home-only overflow cards participate in an active search but return to
    // their initial hidden state when the search is cleared.
    if (!searchActive && card.hasAttribute("data-default-hidden")) matches = false;
    if (matches && card.matches("[data-filter-card]")) {
      // Selections are ORed within one field, then fields are ANDed together.
      // Audience and module modalities are encoded as JSON arrays on each card.
      matches = filterFields.every((field) => {
        if (field === "modalities" && appliedModalitiesMode === "containing" && !appliedFilters[field].length) return false;
        if (!appliedFilters[field].length) return true;
        const value = ["audience", "modalities"].includes(field) ? JSON.parse(card.dataset[field] || "[]") : [card.dataset[field]];
        return appliedFilters[field].some((selected) => value.includes(selected));
      });
    }
    card.hidden = !matches;
    if (matches && card.dataset.catalogType === "modules") visibleModules++;
    if (matches && card.dataset.catalogType === "playlists") visiblePlaylists++;
    if (matches && card.dataset.catalogType === "courses") visibleCourses++;
    if (matches) visibleCatalogItems++;
  });
  if (moduleEmptyState) moduleEmptyState.hidden = visibleModules !== 0;
  if (playlistEmptyState) playlistEmptyState.hidden = visiblePlaylists !== 0;
  if (courseEmptyState) courseEmptyState.hidden = visibleCourses !== 0;
  if (catalogEmptyState) catalogEmptyState.hidden = visibleCatalogItems !== 0;
};

if (searchForm && searchInput && searchClear && catalogCards.length) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchActive = searchInput.value.trim().length > 0;
    searchTerms = normalizeSearchTerms(searchInput.value);
    // Keep Clear available for a non-empty expression even when it consists
    // entirely of ignored words and therefore intentionally matches all cards.
    searchClear.hidden = searchInput.value.trim().length === 0;
    applyCatalogVisibility();
  });
  searchClear.addEventListener("click", () => {
    searchInput.value = "";
    searchTerms = [];
    searchActive = false;
    searchClear.hidden = true;
    applyCatalogVisibility();
    searchInput.focus();
  });
}

if (filterDialog && filterForm && filterCards.length) {
  const filterCount = document.querySelector("[data-filter-count]");
  const modalitiesMode = () => filterForm.querySelector('input[name="modalities-mode"]:checked')?.value;
  const syncModalitiesControls = () => {
    const disabled = modalitiesMode() !== "containing";
    filterForm.querySelectorAll('input[name="modalities"]').forEach((input) => {
      input.disabled = disabled;
    });
  };

  const readFilters = () => Object.fromEntries(filterFields.map((name) => [
    name,
    name === "modalities" && modalitiesMode() !== "containing"
      ? []
      : [...filterForm.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value),
  ]));

  const restoreAppliedFilters = () => {
    // Closing/cancelling is transactional: discard checkbox edits that were
    // made after the dialog opened but were never explicitly applied.
    filterForm.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      input.checked = input.name === "modalities" && !appliedFilters.modalities.length
        ? true
        : appliedFilters[input.name].includes(input.value);
    });
    const mode = filterForm.querySelector(`input[name="modalities-mode"][value="${appliedModalitiesMode}"]`);
    if (mode) mode.checked = true;
    syncModalitiesControls();
  };

  const applyFilters = () => {
    appliedModalitiesMode = modalitiesMode() || "all";
    appliedFilters = readFilters();
    syncModalitiesControls();
    const selectedCount = Object.values(appliedFilters).reduce((total, values) => total + values.length, 0);
    filterCount.textContent = String(selectedCount);
    filterCount.hidden = selectedCount === 0;
    applyCatalogVisibility();
  };

  filterForm.querySelectorAll('input[name="modalities-mode"]').forEach((input) => input.addEventListener("change", syncModalitiesControls));
  syncModalitiesControls();
  document.querySelector("[data-filter-open]")?.addEventListener("click", () => filterDialog.showModal());
  filterDialog.querySelector("[data-filter-close]")?.addEventListener("click", () => {
    restoreAppliedFilters();
    filterDialog.close();
  });
  filterDialog.addEventListener("cancel", restoreAppliedFilters);
  filterDialog.addEventListener("click", (event) => {
    if (event.target !== filterDialog) return;
    restoreAppliedFilters();
    filterDialog.close();
  });
  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilters();
    filterDialog.close();
  });
  filterDialog.querySelector("[data-filter-clear]")?.addEventListener("click", () => {
    filterForm.reset();
    applyFilters();
    filterDialog.close();
  });
}

// ---------------------------------------------------------------------------
// Learning assistant
// ---------------------------------------------------------------------------
// This is intentionally a retrieval assistant, not a generative AI client. Its
// answers come verbatim from per-avatar knowledge JSON. Curriculum assistants
// can delegate documentation requests to Microsoft Learn MCP; the home guide
// instead falls back to the site's generated course, playlist, and module data.
const agent = document.querySelector("[data-agent-config]");

if (agent) {
  // Configuration is serialized by the build into the page. URLs are relative
  // to this exact route, which matters because modules can be rendered at
  // several different depths inside standalone and curated-playlist routes.
  const config = JSON.parse(agent.dataset.agentConfig);
  const launcher = agent.querySelector(".agent-launcher");
  const panel = agent.querySelector(".agent-panel");
  const closeButton = agent.querySelector("[data-agent-close]");
  const messages = agent.querySelector("[data-agent-messages]");
  const suggestions = agent.querySelector("[data-agent-suggestions]");
  const form = agent.querySelector("[data-agent-form]");
  const input = form.querySelector("input");
  const microphoneButton = form.querySelector("[data-agent-mic]");
  const submitButton = form.querySelector('button[type="submit"]');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  // Search queries remove a broader set of conversational words so fallback
  // URLs emphasize the subject rather than phrases such as "please show me".
  const bingStopWords = new Set([...searchStopWords, "about", "ask", "could", "describe", "explain", "find", "give", "help", "know", "learn", "need", "please", "search", "show", "tell", "want", "would"]);
  // Knowledge and moderation are loaded lazily on the first prompt, then cached
  // for this page lifetime. The underlying fetches use no-store so deployment
  // updates are not hidden by the HTTP cache across page loads.
  let keywordMap = new Map();
  let vocabulary = [];
  let knowledgePromise;
  let moderationPromise;
  let prohibitedPatterns = [];
  let activeAudio;
  let recognition;
  // Keep one MCP session per page. Request IDs must increase so JSON-RPC/SSE
  // responses can be paired with the initiating call.
  const mcp = { endpoint: "https://learn.microsoft.com/api/mcp", protocolVersion: "2025-06-18", sessionId: null, nextId: 1, tool: null, initPromise: null };

  // Keep punctuation that commonly belongs to technology names such as C++,
  // C#, .NET, and semantic version/product identifiers.
  const normalize = (value) => value.toLocaleLowerCase().replace(/[^a-z0-9+#.-]+/g, " ").trim().replace(/\s+/g, " ");

  const playAudio = (file) => {
    // A new state cue supersedes the old one; rejected autoplay promises are
    // non-fatal because audio is supplementary feedback.
    if (!config.audioRoot) return;
    activeAudio?.pause();
    activeAudio = new Audio(`${config.audioRoot}/${file}`);
    activeAudio.play().catch(() => { });
  };

  const jaroWinkler = (left, right) => {
    // Small, dependency-free fuzzy matching corrects likely misspellings only
    // against words that actually occur in this avatar's curated vocabulary.
    if (left === right) return 1;
    if (!left.length || !right.length) return 0;
    const range = Math.max(0, Math.floor(Math.max(left.length, right.length) / 2) - 1);
    const leftMatches = Array(left.length).fill(false);
    const rightMatches = Array(right.length).fill(false);
    let matches = 0;
    let transpositions = 0;
    for (let leftIndex = 0; leftIndex < left.length; leftIndex++) {
      const start = Math.max(0, leftIndex - range);
      const end = Math.min(leftIndex + range + 1, right.length);
      for (let rightIndex = start; rightIndex < end; rightIndex++) {
        if (rightMatches[rightIndex] || left[leftIndex] !== right[rightIndex]) continue;
        leftMatches[leftIndex] = true;
        rightMatches[rightIndex] = true;
        matches++;
        break;
      }
    }
    if (!matches) return 0;
    let rightIndex = 0;
    for (let leftIndex = 0; leftIndex < left.length; leftIndex++) {
      if (!leftMatches[leftIndex]) continue;
      while (!rightMatches[rightIndex]) rightIndex++;
      if (left[leftIndex] !== right[rightIndex]) transpositions++;
      rightIndex++;
    }
    const jaro = (matches / left.length + matches / right.length + (matches - transpositions / 2) / matches) / 3;
    let prefix = 0;
    while (prefix < 4 && prefix < left.length && prefix < right.length && left[prefix] === right[prefix]) prefix++;
    return jaro + prefix * 0.1 * (1 - jaro);
  };

  const correctToken = (token) => {
    // Short strings require higher confidence because accidental matches are
    // much more common. Candidate length guards also limit noisy comparisons.
    if (token.length < 2 || vocabulary.includes(token)) return token;
    const threshold = token.length <= 3 ? 0.9 : token.length <= 5 ? 0.88 : 0.85;
    let bestMatch = token;
    let bestScore = 0;
    vocabulary.forEach((candidate) => {
      if (token.length > 3 && candidate.length <= 3) return;
      if (Math.abs(candidate.length - token.length) > 3) return;
      const score = jaroWinkler(token, candidate);
      if (score > bestScore) {
        bestMatch = candidate;
        bestScore = score;
      }
    });
    return bestScore >= threshold ? bestMatch : token;
  };

  const loadModeration = async () => {
    if (!moderationPromise) {
      moderationPromise = fetch(config.moderationUrl, { cache: "no-store" }).then(async (response) => {
        if (!response.ok) throw new Error(`Moderation request failed: ${response.status}`);
        const encodedWords = await response.text();
        prohibitedPatterns = encodedWords.split(/\r?\n/).map((word) => word.trim()).filter(Boolean).map((encoded) => {
          // moderation.txt avoids storing prohibited terms in plain sight. This
          // reversible transform is obfuscation, not cryptographic protection.
          const word = [...encoded.toLocaleLowerCase()].reverse().map((character) => String.fromCharCode(character.charCodeAt(0) + 1)).join("");
          return new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
        });
      });
    }
    return moderationPromise;
  };

  const containsProhibitedWords = (text) => prohibitedPatterns.some((pattern) => pattern.test(text));

  const getSearchIntentQuery = (text) => {
    // Route explicit search verbs and common documentation/code phrasing to
    // Learn instead of trying to answer from the small local knowledge set.
    const trimmed = text.trim();
    const lower = trimmed.toLocaleLowerCase();
    if (lower.startsWith("search ")) return trimmed.slice(7).trim();
    if (lower.startsWith("find ")) return trimmed.slice(5).trim();
    if (["documentation", " docs ", "microsoft learn ", "how to ", "how do i ", "how can i", " me how ", "sample code", "example code", "code sample", "code example"].some((pattern) => lower.includes(pattern))) return trimmed;
    return null;
  };

  const extractSearchKeywords = (text) => {
    const seen = new Set();
    return normalize(text).split(" ").filter((word) => word.length >= 2 && !bingStopWords.has(word) && !seen.has(word) && seen.add(word)).join(" ");
  };

  const openVideoPopup = (url) => {
    // Size a centered 16:9 window without exceeding available screen bounds.
    // Returning the popup lets the click handler retain ordinary navigation
    // when the browser blocks popups.
    const maximumWidth = Math.max(320, window.screen.availWidth - 40);
    const maximumHeight = Math.max(180, window.screen.availHeight - 80);
    const width = Math.min(800, maximumWidth, maximumHeight * 16 / 9);
    const height = width * 9 / 16;
    const left = window.screen.availLeft + (window.screen.availWidth - width) / 2;
    const top = window.screen.availTop + (window.screen.availHeight - height) / 2;
    const features = `popup=yes,width=${Math.round(width)},height=${Math.round(height)},left=${Math.round(left)},top=${Math.round(top)},resizable=yes,scrollbars=yes`;
    const popup = window.open(url, "ask-anton-video", features);
    if (popup) {
      popup.opener = null;
      popup.focus();
    }
    return popup;
  };

  const typeMessage = (message, content, text, linkList) => {
    // Typing is decorative. Reduced-motion users get the complete response and
    // result links immediately, with aria-busy cleared at the same time.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      content.textContent = text;
      if (linkList) linkList.hidden = false;
      message.removeAttribute("aria-busy");
      messages.scrollTop = messages.scrollHeight;
      return;
    }
    const charactersPerSecond = 250;
    const startedAt = performance.now();
    const reveal = (timestamp) => {
      const characterCount = Math.min(text.length, Math.floor((timestamp - startedAt) * charactersPerSecond / 1000));
      content.textContent = text.slice(0, characterCount);
      messages.scrollTop = messages.scrollHeight;
      if (characterCount < text.length) {
        requestAnimationFrame(reveal);
        return;
      }
      if (linkList) linkList.hidden = false;
      message.removeAttribute("aria-busy");
      messages.scrollTop = messages.scrollHeight;
    };
    requestAnimationFrame(reveal);
  };

  const addMessage = (role, text, links = []) => {
    // Build messages with DOM nodes and textContent because knowledge data and
    // user prompts are data, never trusted HTML. The role-specific label keeps
    // the live transcript understandable to assistive technology.
    const message = document.createElement("div");
    message.className = `agent-message ${role}`;
    if (role === "assistant") message.setAttribute("aria-busy", "true");
    const label = document.createElement("span");
    label.className = "agent-message-label";
    label.textContent = role === "assistant" ? config.name : "You";
    const content = document.createElement("p");
    message.append(label, content);
    let linkList;
    if (links.length) {
      linkList = document.createElement("ul");
      linkList.hidden = role === "assistant";
      [...new Map(links.map((link) => [link.href, link])).values()].forEach((link) => {
        // A Map preserves first-result ordering while removing duplicate URLs.
        const item = document.createElement("li");
        const anchor = document.createElement("a");
        anchor.href = link.href;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.textContent = link.label;
        if (link.popup === "video") {
          anchor.addEventListener("click", (event) => {
            if (openVideoPopup(link.href)) event.preventDefault();
          });
        }
        item.append(anchor);
        linkList.append(item);
      });
      message.append(linkList);
    }
    messages.append(message);
    messages.scrollTop = messages.scrollHeight;
    if (role === "assistant") typeMessage(message, content, text, linkList);
    else content.textContent = text;
  };

  const loadKnowledge = async () => {
    if (!knowledgePromise) {
      knowledgePromise = fetch(config.knowledgeUrl, { cache: "no-store" }).then(async (response) => {
        if (!response.ok) throw new Error(`Knowledge request failed: ${response.status}`);
        const categories = await response.json();
        keywordMap = new Map();
        // One normalized keyword can intentionally point to several documents;
        // scoring and category/document IDs resolve the final ranked set later.
        categories.forEach((category) => {
          (category.documents || []).forEach((document) => {
            (document.keywords || []).forEach((keyword) => {
              const normalizedKeyword = normalize(keyword);
              if (!normalizedKeyword) return;
              const entries = keywordMap.get(normalizedKeyword) || [];
              entries.push({ document, category: category.category, link: category.link });
              keywordMap.set(normalizedKeyword, entries);
            });
          });
        });
        vocabulary = [...new Set([...keywordMap.keys()].flatMap((keyword) => keyword.split(" ")).filter((word) => word.length >= 2))];
      });
    }
    return knowledgePromise;
  };

  const searchKnowledge = (question) => {
    // Correct individual tokens before constructing n-grams. Exact lookup of
    // the resulting one-, two-, and three-word phrases keeps output predictable
    // while still handling common misspellings and multi-word product names.
    const normalizedQuestion = normalize(question);
    const originalWords = normalizedQuestion.split(" ").filter(Boolean);
    const words = originalWords.map(correctToken);
    const phrases = new Set();
    const maximumPhraseLength = Math.min(3, words.length);
    for (let length = maximumPhraseLength; length >= 2; length--) {
      for (let index = 0; index <= words.length - length; index++) phrases.add(words.slice(index, index + length).join(" "));
    }
    words.filter((word) => word.length >= 2 && !searchStopWords.has(word)).forEach((word) => phrases.add(word));

    // Keep only the most specific overlapping matches. For example, a matched
    // "personal playlist" keyword suppresses "personal" and "playlist", while
    // unrelated phrases remain eligible. Testing against longer matched
    // phrases also lets a trigram suppress its contained unigrams directly.
    const matchedPhrases = [...phrases]
      .filter((phrase) => keywordMap.has(phrase))
      .sort((left, right) => right.split(" ").length - left.split(" ").length)
      .filter((phrase, index, candidates) => {
        const phraseWords = phrase.split(" ");
        return !candidates.slice(0, index).some((candidate) => {
          const candidateWords = candidate.split(" ");
          if (candidateWords.length <= phraseWords.length) return false;
          return candidateWords.some((_, offset) => candidateWords.slice(offset, offset + phraseWords.length).join(" ") === phrase);
        });
      });

    const matches = new Map();
    matchedPhrases.forEach((phrase) => {
      (keywordMap.get(phrase) || []).forEach((entry) => {
        const key = `${entry.category}:${entry.document.id}`;
        const current = matches.get(key) || { ...entry, keywords: [] };
        current.keywords.push(phrase);
        matches.set(key, current);
      });
    });

    return [...matches.values()]
      // Multi-word keyword matches carry more weight than single words. Return
      // only three answers so the chat remains concise.
      .map((match) => ({ ...match, score: match.keywords.reduce((score, keyword) => score + keyword.split(" ").length, 0) }))
      .sort((left, right) => right.score - left.score)
      .slice(0, 3);
  };

  const searchCatalog = (question) => {
    // Reuse the home search's normalization and AND semantics, but inspect the
    // cards without changing their hidden state or the search form's state.
    const terms = normalizeSearchTerms(question);
    if (!terms.length) return [];
    return catalogCards.filter((card) => terms.every((term) => card.dataset.searchText.includes(term))).map((card) => {
      const anchor = card.matches("a.content-card") ? card : card.querySelector("a.content-card");
      const title = anchor?.querySelector("strong")?.textContent?.trim();
      const type = card.dataset.catalogType;
      const typeLabel = type === "modules" ? "Module" : type === "playlists" ? "Playlist" : "Course";
      return anchor && title ? { href: anchor.href, label: `${typeLabel}: ${title}` } : null;
    }).filter(Boolean);
  };

  const mcpRpc = async (method, params, isNotification = false) => {
    // The Learn endpoint may return ordinary JSON-RPC or an SSE stream. Session
    // IDs are echoed on subsequent requests when the server supplies one.
    const id = isNotification ? undefined : mcp.nextId++;
    const body = { jsonrpc: "2.0", method, ...(params === undefined ? {} : { params }), ...(isNotification ? {} : { id }) };
    const headers = { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "MCP-Protocol-Version": mcp.protocolVersion };
    if (mcp.sessionId) headers["Mcp-Session-Id"] = mcp.sessionId;
    const response = await fetch(mcp.endpoint, { method: "POST", headers, body: JSON.stringify(body) });
    mcp.sessionId = response.headers.get("Mcp-Session-Id") || response.headers.get("mcp-session-id") || mcp.sessionId;
    if (isNotification) {
      if (!response.ok && response.status !== 202) throw new Error(`MCP notification failed: ${response.status}`);
      return null;
    }
    if (!response.ok) throw new Error(`MCP request failed: ${response.status}`);
    if ((response.headers.get("Content-Type") || "").toLocaleLowerCase().includes("text/event-stream")) {
      const text = await response.text();
      // The endpoint returns small, complete event payloads, so a minimal
      // line-based SSE parser is sufficient here; this is not a streaming UI.
      for (const event of text.split(/\r?\n\r?\n/)) {
        const data = event.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trimStart()).join("\n");
        if (!data) continue;
        const message = JSON.parse(data);
        if (message.id === id) {
          if (message.error) throw new Error(message.error.message);
          return message.result;
        }
      }
      throw new Error("MCP response ended without a result");
    }
    const message = await response.json();
    if (message.error) throw new Error(message.error.message);
    return message.result;
  };

  const ensureLearnMcp = async () => {
    // Initialization is memoized so simultaneous/repeated documentation queries
    // do not create multiple sessions. A failed attempt is cleared for retry.
    if (mcp.tool) return mcp.tool;
    if (!mcp.initPromise) {
      mcp.initPromise = (async () => {
        await mcpRpc("initialize", { protocolVersion: mcp.protocolVersion, capabilities: {}, clientInfo: { name: "ai-skills-nav", version: "1.0.0" } });
        await mcpRpc("notifications/initialized", undefined, true);
        const result = await mcpRpc("tools/list", {});
        // Prefer a search-named tool but remain compatible if Learn exposes a
        // single differently named discovery tool.
        mcp.tool = (result.tools || []).find((tool) => /search/i.test(tool.name)) || (result.tools || [])[0] || null;
        return mcp.tool;
      })().catch((error) => {
        mcp.initPromise = null;
        throw error;
      });
    }
    return mcp.initPromise;
  };

  const queryLearnMcp = async (query) => {
    const tool = await ensureLearnMcp();
    if (!tool) return [];
    const properties = tool.inputSchema?.properties || {};
    // MCP tools are discovered dynamically. Accommodate conventional query
    // parameter names instead of coupling the site to one schema revision.
    const argumentName = ["query", "question", "q", "search", "searchQuery", "text", "prompt"].find((name) => name in properties) || Object.keys(properties)[0];
    const result = await mcpRpc("tools/call", { name: tool.name, arguments: argumentName ? { [argumentName]: query } : {} });
    const items = [];
    (result.content || []).forEach((part) => {
      if (part.type !== "text" || typeof part.text !== "string") return;
      try {
        // Learn has returned both arrays and objects containing common result
        // arrays over time; normalize either form into one list.
        let parsed = JSON.parse(part.text);
        if (!Array.isArray(parsed)) parsed = ["results", "items", "data", "value", "hits", "documents"].map((key) => parsed[key]).find(Array.isArray) || [parsed];
        items.push(...parsed);
      } catch { /* Ignore non-JSON MCP content. */ }
    });
    const seen = new Set();
    return items.map((item) => ({ href: item.contentUrl || item.url || item.uri || item.link, label: item.title || item.name || item.heading || "Microsoft Learn article" }))
      .filter((item) => item.href && !seen.has(item.href.split("#")[0]) && seen.add(item.href.split("#")[0]))
      .slice(0, 5);
  };

  const submitPrompt = async (prompt, usedSpeechInput = false) => {
    // This function owns the complete request lifecycle so every early return
    // still passes through `finally` and re-enables the form controls.
    const question = prompt.trim();
    if (!question) return;
    if (question.length > 1000) {
      addMessage("assistant", "Please keep your message under 1,000 characters.");
      return;
    }
    addMessage("user", question);
    input.value = "";
    input.disabled = true;
    submitButton.disabled = true;
    microphoneButton.disabled = true;
    try {
      await loadModeration();
      // Moderation precedes both local retrieval and remote search.
      if (containsProhibitedWords(question)) {
        addMessage("assistant", "I'm sorry, I can't help with that because it triggered a content-safety filtering policy.");
        if (usedSpeechInput) playAudio("sorry.wav");
        return;
      }
      if (usedSpeechInput) playAudio("looking.wav");
      else activeAudio?.pause();
      const searchQuery = config.useLearnMcp ? getSearchIntentQuery(question) : null;
      if (searchQuery) {
        const keywords = extractSearchKeywords(searchQuery) || normalize(searchQuery);
        let links = [];
        // MCP is an enhancement: a conventional Learn search URL preserves the
        // user's task when cross-origin, protocol, or service errors occur.
        try { links = await queryLearnMcp(searchQuery); } catch { /* Fall back to Microsoft Learn search. */ }
        if (!links.length) links = [{ href: `https://learn.microsoft.com/en-us/search/?terms=${encodeURIComponent(keywords)}&category=Documentation`, label: "Search Microsoft Learn" }];
        addMessage("assistant", `I searched Microsoft Learn documentation for "${keywords}".`, links);
        if (usedSpeechInput) playAudio("search_results.wav");
        return;
      }
      await loadKnowledge();
      const results = searchKnowledge(question);
      if (!results.length) {
        if (config.useCatalogSearch) {
          const links = searchCatalog(question);
          if (links.length) {
            addMessage("assistant", "I found these relevant learning experiences:", links);
            return;
          }
          addMessage("assistant", "I'm sorry. I can't help with that. Try rewording your question.");
          return;
        }
        // Local knowledge is deliberately bounded. Be transparent and offer a
        // web search instead of fabricating an answer.
        const keywords = extractSearchKeywords(question) || normalize(question);
        addMessage("assistant", "I don't have specific information about that topic, but you can search the web for it.", [{ href: `https://www.bing.com/search?q=${encodeURIComponent(keywords)}`, label: "Search with Bing" }]);
        if (usedSpeechInput) playAudio("no_results.wav");
      } else {
        addMessage(
          "assistant",
          results.map((result) => result.document.content).join("\n\n"),
          results.flatMap((result) => [
            ...(result.document.video_url ? [{ href: result.document.video_url, label: `Watch: ${result.document.title}`, popup: "video" }] : []),
            ...(result.link ? [{ href: result.link, label: `Learn more: ${result.category}` }] : []),
          ]),
        );
        if (usedSpeechInput) playAudio(`response_${Math.floor(Math.random() * 7) + 1}.wav`);
      }
    } catch {
      addMessage("assistant", "Sorry, I couldn't load my knowledge right now. Please try again.");
      if (usedSpeechInput) playAudio("sorry.wav");
    } finally {
      input.disabled = false;
      submitButton.disabled = false;
      microphoneButton.disabled = !SpeechRecognition;
      input.focus();
    }
  };

  if (SpeechRecognition) {
    // Browser speech recognition is optional progressive enhancement. A final
    // transcript is submitted exactly like typed input, with an extra flag that
    // enables audible progress/result cues.
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = navigator.language || "en-US";
    recognition.addEventListener("start", () => {
      microphoneButton.classList.add("listening");
      microphoneButton.setAttribute("aria-pressed", "true");
      input.placeholder = "Listening...";
    });
    recognition.addEventListener("result", (event) => {
      const transcript = event.results[event.resultIndex][0].transcript;
      input.value = transcript;
      submitPrompt(transcript, true);
    });
    recognition.addEventListener("error", (event) => {
      if (event.error !== "aborted") addMessage("assistant", "I couldn't hear that. Please try the microphone again or type your question.");
    });
    recognition.addEventListener("end", () => {
      microphoneButton.classList.remove("listening");
      microphoneButton.setAttribute("aria-pressed", "false");
      input.placeholder = "Ask a question";
    });
    microphoneButton.addEventListener("click", () => {
      if (microphoneButton.classList.contains("listening")) {
        recognition.stop();
        return;
      }
      try {
        recognition.start();
      } catch {
        recognition.stop();
      }
    });
  } else {
    microphoneButton.disabled = true;
    microphoneButton.title = "Speech input is not supported by this browser";
  }

  const setAgentOpen = (open) => {
    // Stop microphone capture when closing, synchronize visible/ARIA state, and
    // move focus predictably for keyboard navigation.
    if (!open && recognition && microphoneButton.classList.contains("listening")) recognition.abort();
    agent.classList.toggle("open", open);
    launcher.setAttribute("aria-expanded", String(open));
    panel.setAttribute("aria-hidden", String(!open));
    if (open) {
      // Wait until the browser has applied the panel's visible state; focusing
      // an element while its ancestor is still hidden leaves focus on the page.
      requestAnimationFrame(() => {
        if (agent.classList.contains("open")) input.focus();
      });
    } else {
      launcher.focus();
    }
  };

  addMessage("assistant", config.welcomeMessage);
  // Suggested prompts use the same submission path as typed and spoken input,
  // ensuring moderation, loading state, and fallbacks behave consistently.
  config.suggestedPrompts.forEach((prompt) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = prompt;
    button.addEventListener("click", () => submitPrompt(prompt));
    suggestions.append(button);
  });
  launcher.addEventListener("click", () => setAgentOpen(true));
  closeButton.addEventListener("click", () => setAgentOpen(false));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitPrompt(input.value);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && agent.classList.contains("open")) setAgentOpen(false);
  });
}