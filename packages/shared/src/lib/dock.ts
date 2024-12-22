function getOwnerDocument(node: Node | null | undefined) {
  return node ? node.ownerDocument : document;
}

function getOwnerWindow(node: Node | null | undefined) {
  const doc = getOwnerDocument(node);
  return doc ? doc.defaultView : window;
}

function getOwnerDocumentOrWindow(node: Node | null | undefined) {
  const doc = getOwnerDocument(node);
  return doc ? doc : window;
}

export { getOwnerDocument, getOwnerWindow, getOwnerDocumentOrWindow };
