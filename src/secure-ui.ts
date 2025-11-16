export function applySecurityUIRestrictions() {
  // disable text selection
  document.addEventListener("selectstart", (e) => e.preventDefault());

  // disable context menu
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  // disable drag + drop
  window.addEventListener("dragenter", (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Das hier ist wichtig, um das grüne Plus-Symbol zu verhindern:
    e.dataTransfer!.dropEffect = "none";
    e.dataTransfer!.effectAllowed = "none";
  });

  window.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer!.dropEffect = "none";
    e.dataTransfer!.effectAllowed = "none";
  });

  window.addEventListener("dragleave", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  window.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  // disable highlighting on click
  document.addEventListener("mousedown", () => {
    document.body.style.userSelect = "none";
  });
}
