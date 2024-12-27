function getOwnerDocument(node?: Node | null | undefined) {
  return node?.ownerDocument ?? document;
}

function getOwnerWindow(node?: Node | null | undefined) {
  const doc = getOwnerDocument(node);
  return doc?.defaultView ?? window;
}

export { getOwnerDocument, getOwnerWindow };
