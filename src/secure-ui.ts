export function applySecurityUIRestrictions() {
  // disable text selection
  document.addEventListener("selectstart", (e) => e.preventDefault());

  // disable context menu
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  // disable drag + drop
  // TODO-MMUEJDE: This not working as expected, need to investigate further
  document.addEventListener("dragover", (e) => e.preventDefault());
  document.addEventListener("drop", (e) => e.preventDefault());

  // disable highlighting on click
  document.addEventListener("mousedown", () => {
    document.body.style.userSelect = "none";
  });
}