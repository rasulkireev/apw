// Reveal only managed book sections containing an existing, in-article target.
// IDs are data, never CSS selectors; encoded fragments must match native links.
export function revealBookFragment(root, hash, sections) {
  if (!root || !hash.startsWith('#') || hash.length < 2) return null;
  let id;
  try {
    id = decodeURIComponent(hash.slice(1));
  } catch {
    return null;
  }
  const target = root.ownerDocument.getElementById(id);
  if (!target || !root.contains(target)) return null;
  let revealed = false;
  for (const { element, reveal } of sections) {
    if (element?.contains(target)) {
      reveal();
      revealed = true;
    }
  }
  return revealed ? target : null;
}
