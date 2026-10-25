// Imported reading-app references are not public destinations. Keep their
// labels (including formatting), but don't publish unusable links or locators.
export default function publicReadingLinks() {
  return (tree) => {
    const isPrivate = (url) => /^private:/i.test(url || '');
    const privateReferences = new Set();

    function collect(node) {
      if (node.type === 'definition' && isPrivate(node.url)) {
        privateReferences.add(node.identifier);
      }
      node.children?.forEach(collect);
    }
    collect(tree);

    function clean(node) {
      if (!node.children) return;
      node.children = node.children.flatMap((child) => {
        clean(child);
        if ((child.type === 'link' && isPrivate(child.url)) ||
            (child.type === 'linkReference' && privateReferences.has(child.identifier))) {
          return child.children;
        }
        if (child.type === 'definition' && isPrivate(child.url)) return [];
        return [child];
      });
    }
    clean(tree);
  };
}
