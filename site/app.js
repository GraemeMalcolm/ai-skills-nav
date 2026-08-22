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