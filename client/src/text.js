/** Cuts long text at a word boundary and adds an ellipsis. */
export function shorten(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return (space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:!?-]+$/, "") + "…";
}
