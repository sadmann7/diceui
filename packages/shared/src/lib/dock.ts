function getOwnerDocument(node?: Node | null) {
  return node?.ownerDocument ?? globalThis.document;
}

function getOwnerWindow(node?: Node | null) {
  const doc = getOwnerDocument(node);
  return doc?.defaultView ?? globalThis.window;
}

export { getOwnerDocument, getOwnerWindow };
