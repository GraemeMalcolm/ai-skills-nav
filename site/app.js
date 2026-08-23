const menuToggle = document.querySelector("[data-menu-toggle]");
const menuReveal = document.querySelector("[data-menu-reveal]");
const sidebar = document.querySelector("[data-sidebar]");

if (menuToggle && window.matchMedia("(max-width: 860px)").matches) {
  menuToggle.setAttribute("aria-expanded", "false");
}

function setMenu(open) {
  document.body.classList.toggle("menu-open", open);
  menuToggle?.setAttribute("aria-expanded", String(open));
  menuReveal?.setAttribute("aria-expanded", String(open));
  if (open) sidebar?.querySelector("a")?.focus();
  else menuReveal?.focus();
}

menuToggle?.addEventListener("click", () => {
  if (window.matchMedia("(max-width: 860px)").matches) {
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

document.querySelectorAll("[data-pivot]").forEach((pivot) => {
  const tabs = [...pivot.querySelectorAll('[role="tab"]')];
  const panels = [...pivot.querySelectorAll('[role="tabpanel"]')];
  const activate = (selected) => {
    tabs.forEach((tab, index) => {
      const active = tab === selected;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[index].hidden = !active;
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : index + (event.key === "ArrowRight" ? 1 : -1);
      next = (next + tabs.length) % tabs.length;
      activate(tabs[next]);
      tabs[next].focus();
    });
  });
});

document.querySelectorAll("[data-page-select]").forEach((select) => {
  select.addEventListener("change", () => window.location.assign(select.value));
});

const filterDialog = document.querySelector("[data-filter-dialog]");
const filterForm = filterDialog?.querySelector("[data-filter-form]");
const catalogCards = [...document.querySelectorAll("[data-catalog-card]")];
const moduleCards = [...document.querySelectorAll("[data-module-card]")];
const searchForm = document.querySelector("[data-site-search]");
const searchInput = searchForm?.querySelector('input[type="search"]');
const searchClear = searchForm?.querySelector("[data-search-clear]");
const moduleEmptyState = document.querySelector("[data-module-empty]");
const playlistEmptyState = document.querySelector("[data-playlist-empty]");
let appliedFilters = { modality: [], level: [], audience: [] };
let searchTerms = [];

const matchesSearch = (card) => searchTerms.every((term) => card.dataset.searchText.includes(term));

const applyCatalogVisibility = () => {
  let visibleModules = 0;
  let visiblePlaylists = 0;
  catalogCards.forEach((card) => {
    let matches = matchesSearch(card);
    if (matches && card.matches("[data-module-card]")) {
      const audiences = JSON.parse(card.dataset.audiences || "[]");
      matches = (!appliedFilters.modality.length || appliedFilters.modality.includes(card.dataset.modality))
        && (!appliedFilters.level.length || appliedFilters.level.includes(card.dataset.level))
        && (!appliedFilters.audience.length || appliedFilters.audience.some((audience) => audiences.includes(audience)));
    }
    card.hidden = !matches;
    if (matches && card.dataset.catalogType === "modules") visibleModules++;
    if (matches && card.dataset.catalogType === "playlists") visiblePlaylists++;
  });
  if (moduleEmptyState) moduleEmptyState.hidden = visibleModules !== 0;
  if (playlistEmptyState) playlistEmptyState.hidden = visiblePlaylists !== 0;
};

if (searchForm && searchInput && searchClear && catalogCards.length) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchTerms = searchInput.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    searchClear.hidden = searchTerms.length === 0;
    applyCatalogVisibility();
  });
  searchClear.addEventListener("click", () => {
    searchInput.value = "";
    searchTerms = [];
    searchClear.hidden = true;
    applyCatalogVisibility();
    searchInput.focus();
  });
}

if (filterDialog && filterForm && moduleCards.length) {
  const filterCount = document.querySelector("[data-filter-count]");

  const readFilters = () => Object.fromEntries(["modality", "level", "audience"].map((name) => [
    name,
    [...filterForm.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value),
  ]));

  const restoreAppliedFilters = () => {
    filterForm.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      input.checked = appliedFilters[input.name].includes(input.value);
    });
  };

  const applyFilters = () => {
    appliedFilters = readFilters();
    const selectedCount = Object.values(appliedFilters).reduce((total, values) => total + values.length, 0);
    filterCount.textContent = String(selectedCount);
    filterCount.hidden = selectedCount === 0;
    applyCatalogVisibility();
  };

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

const agent = document.querySelector("[data-agent-config]");

if (agent) {
  const config = JSON.parse(agent.dataset.agentConfig);
  const launcher = agent.querySelector(".agent-launcher");
  const panel = agent.querySelector(".agent-panel");
  const closeButton = agent.querySelector("[data-agent-close]");
  const messages = agent.querySelector("[data-agent-messages]");
  const suggestions = agent.querySelector("[data-agent-suggestions]");
  const form = agent.querySelector("[data-agent-form]");
  const input = form.querySelector("input");
  const submitButton = form.querySelector('button[type="submit"]');
  const stopWords = new Set(["a", "an", "and", "are", "can", "do", "for", "how", "i", "in", "is", "it", "me", "of", "on", "or", "the", "to", "what", "with", "you"]);
  let keywordMap = new Map();
  let knowledgePromise;
  let activeAudio;

  const normalize = (value) => value.toLocaleLowerCase().replace(/[^a-z0-9+#.-]+/g, " ").trim().replace(/\s+/g, " ");

  const playAudio = (file) => {
    activeAudio?.pause();
    activeAudio = new Audio(`${config.audioRoot}/${file}`);
    activeAudio.play().catch(() => {});
  };

  const addMessage = (role, text, links = []) => {
    const message = document.createElement("div");
    message.className = `agent-message ${role}`;
    const label = document.createElement("span");
    label.className = "agent-message-label";
    label.textContent = role === "assistant" ? config.name : "You";
    const content = document.createElement("p");
    content.textContent = text;
    message.append(label, content);
    if (links.length) {
      const linkList = document.createElement("ul");
      [...new Map(links.map((link) => [link.href, link])).values()].forEach((link) => {
        const item = document.createElement("li");
        const anchor = document.createElement("a");
        anchor.href = link.href;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.textContent = link.label;
        item.append(anchor);
        linkList.append(item);
      });
      message.append(linkList);
    }
    messages.append(message);
    messages.scrollTop = messages.scrollHeight;
  };

  const loadKnowledge = async () => {
    if (!knowledgePromise) {
      knowledgePromise = fetch(config.knowledgeUrl, { cache: "no-store" }).then(async (response) => {
        if (!response.ok) throw new Error(`Knowledge request failed: ${response.status}`);
        const categories = await response.json();
        keywordMap = new Map();
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
      });
    }
    return knowledgePromise;
  };

  const searchKnowledge = (question) => {
    const normalizedQuestion = normalize(question);
    const words = normalizedQuestion.split(" ").filter(Boolean);
    const phrases = new Set();
    const maximumPhraseLength = Math.min(3, words.length);
    for (let length = maximumPhraseLength; length >= 2; length--) {
      for (let index = 0; index <= words.length - length; index++) phrases.add(words.slice(index, index + length).join(" "));
    }
    words.filter((word) => word.length >= 2 && !stopWords.has(word)).forEach((word) => phrases.add(word));

    const matches = new Map();
    phrases.forEach((phrase) => {
      (keywordMap.get(phrase) || []).forEach((entry) => {
        const key = `${entry.category}:${entry.document.id}`;
        const current = matches.get(key) || { ...entry, keywords: [] };
        current.keywords.push(phrase);
        matches.set(key, current);
      });
    });

    return [...matches.values()]
      .map((match) => ({ ...match, score: match.keywords.reduce((score, keyword) => score + keyword.split(" ").length, 0) }))
      .sort((left, right) => right.score - left.score)
      .slice(0, 3);
  };

  const submitPrompt = async (prompt) => {
    const question = prompt.trim();
    if (!question) return;
    addMessage("user", question);
    input.value = "";
    input.disabled = true;
    submitButton.disabled = true;
    playAudio("looking.wav");
    try {
      await loadKnowledge();
      const results = searchKnowledge(question);
      if (!results.length) {
        addMessage("assistant", "Sorry, I couldn't find any specific information on that topic. Please try rephrasing your question.");
        playAudio("no_results.wav");
      } else {
        addMessage(
          "assistant",
          results.map((result) => result.document.content).join("\n\n"),
          results.filter((result) => result.link).map((result) => ({ href: result.link, label: `Learn more: ${result.category}` })),
        );
        playAudio(`response_${Math.floor(Math.random() * 7) + 1}.wav`);
      }
    } catch {
      addMessage("assistant", "Sorry, I couldn't load my knowledge right now. Please try again.");
      playAudio("sorry.wav");
    } finally {
      input.disabled = false;
      submitButton.disabled = false;
      input.focus();
    }
  };

  const setAgentOpen = (open) => {
    agent.classList.toggle("open", open);
    launcher.setAttribute("aria-expanded", String(open));
    panel.setAttribute("aria-hidden", String(!open));
    if (open) input.focus();
    else launcher.focus();
  };

  addMessage("assistant", config.welcomeMessage);
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