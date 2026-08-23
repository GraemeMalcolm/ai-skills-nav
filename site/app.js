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