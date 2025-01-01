function getOwnerDocument(node?: Node | null | undefined) {
  return node?.ownerDocument ?? globalThis.document;
}

function getOwnerWindow(node?: Node | null | undefined) {
  const doc = getOwnerDocument(node);
  return doc?.defaultView ?? globalThis.window;
}

export { getOwnerDocument, getOwnerWindow };
