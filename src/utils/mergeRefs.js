// Compose multiple refs (callback or object) onto one element.
export function mergeRefs(...refs) {
  const filtered = refs.filter(Boolean);
  return (node) => {
    filtered.forEach((ref) => {
      if (typeof ref === 'function') ref(node);
      else if (ref && typeof ref === 'object') ref.current = node;
    });
  };
}
