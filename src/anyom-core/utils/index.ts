
import { isArray, isNullOrUndef, isStringOrNumber } from "../shared";
import VNodeFlags from "../vnode-flags";

export function validateNodeTree(node: any): boolean {
  if (!node) {
    return true;
  }
  if (isStringOrNumber(node)) {
    return true;
  }
  if (!node.dom) {
    return false;
  }
  const children = node.children;
  const flags = node.flags;

  if ((flags & VNodeFlags.NativeElement) > 0) {
    if (!isNullOrUndef(children)) {
      if (isArray(children)) {
        for (const child of children) {
          const val = validateNodeTree(child);

          if (!val) {
            return false;
          }
        }
      } else {
        const val = validateNodeTree(children);

        if (!val) {
          return false;
        }
      }
    }
  }
  return true;
}

export function waits(timer: number, done: () => void) {
  setTimeout(done, timer);
}