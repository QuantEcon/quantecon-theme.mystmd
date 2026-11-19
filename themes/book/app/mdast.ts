import type { GenericNode } from 'myst-common';

/** Every node of `type` in `tree`, in document order. */
export function collect(tree: GenericNode | undefined, type: string): GenericNode[] {
  const out: GenericNode[] = [];
  const walk = (node: GenericNode | undefined) => {
    if (!node) return;
    if (node.type === type) out.push(node);
    node.children?.forEach(walk);
  };
  walk(tree);
  return out;
}
