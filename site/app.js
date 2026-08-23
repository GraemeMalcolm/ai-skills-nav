const menuToggle = document.querySelector("[data-menu-toggle]");
const sidebar = document.querySelector("[data-sidebar]");

if (menuToggle && window.matchMedia("(max-width: 860px)").matches) {
  menuToggle.setAttribute("aria-expanded", "false");
}

function setMenu(open) {
  document.body.classList.toggle("menu-open", open);
  menuToggle?.setAttribute("aria-expanded", String(open));
  if (open) sidebar?.querySelector("a")?.focus();
}

menuToggle?.addEventListener("click", () => {
  if (window.matchMedia("(max-width: 860px)").matches) {
    setMenu(true);
    return;
  }
  const collapsed = document.body.classList.toggle("nav-collapsed");
  menuToggle.setAttribute("aria-expanded", String(!collapsed));
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
const moduleCards = [...document.querySelectorAll("[data-module-card]")];

if (filterDialog && filterForm && moduleCards.length) {
  const filterCount = document.querySelector("[data-filter-count]");
  const emptyState = document.querySelector("[data-filter-empty]");
  let appliedFilters = { modality: [], level: [], audience: [] };

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
    let visibleCount = 0;
    moduleCards.forEach((card) => {
      const audiences = JSON.parse(card.dataset.audiences || "[]");
      const matches = (!appliedFilters.modality.length || appliedFilters.modality.includes(card.dataset.modality))
        && (!appliedFilters.level.length || appliedFilters.level.includes(card.dataset.level))
        && (!appliedFilters.audience.length || appliedFilters.audience.some((audience) => audiences.includes(audience)));
      card.hidden = !matches;
      if (matches) visibleCount++;
    });
    const selectedCount = Object.values(appliedFilters).reduce((total, values) => total + values.length, 0);
    filterCount.textContent = String(selectedCount);
    filterCount.hidden = selectedCount === 0;
    emptyState.hidden = visibleCount !== 0;
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