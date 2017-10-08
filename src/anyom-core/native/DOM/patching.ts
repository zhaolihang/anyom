/**
 * @module Inferno
 */ /** TypeDoc Comment */

import {
  combineFrom,
  isArray,
  isFunction,
  isInvalid,
  isNull,
  isNullOrUndef,
  isNumber,
  isObject,
  isString,
  isStringOrNumber,
  isUndefined,
  LifecycleClass,
  NO_OP,
  EMPTY_OBJ,
  throwError
} from "../../shared";
import VNodeFlags from "../../vnode-flags";
import { options } from "../../core/options";
import {
  createTextVNode,
  createVoidVNode,
  directClone,
  isVNode,
  VNode
} from "../../core/VNodes";
import {
  booleanProps,
  delegatedEvents,
  isUnitlessNumber,
  namespaces,
  skipProps,
  strictProps
} from "./constants";
import { handleEvent } from "./events/delegation";
import {
  mount,
  mountArrayChildren,
  mountComponent,
  mountElement,
  mountRef,
  mountText,
  mountVoid
} from "./mounting";
import { componentToDOMNodeMap } from "./rendering";
import { unmount } from "./unmounting";
import {
  appendChild,
  insertOrAppend,
  isKeyed,
  isSameInnerHTML,
  removeAllChildren,
  replaceChild,
  replaceLastChildAndUnmount,
  replaceVNode,
  replaceWithNewNode,
  setTextContent,
  updateTextContent
} from "./utils";
import { getCommand } from "../../command/index";
import { NativeElement, setNodeValue, setProp, removeAttr, setInnerHtml, getDomEventByName, setDomEventByName, removeClassName, setClassName, setTextContentNull } from "../index";

export function patch(
  lastVNode: VNode,
  nextVNode: VNode,
  parentDom: NativeElement,
  lifecycle: LifecycleClass,
  context: Object,
  isRecycling: boolean
) {
  if (lastVNode !== nextVNode) {
    const lastFlags = lastVNode.flags;
    const nextFlags = nextVNode.flags;

    if (nextFlags & VNodeFlags.Component) {
      const isClass = (nextFlags & VNodeFlags.ComponentClass) > 0;

      if (lastFlags & VNodeFlags.Component) {
        patchComponent(
          lastVNode,
          nextVNode,
          parentDom,
          lifecycle,
          context,
          isClass,
          isRecycling
        );
      } else {
        replaceVNode(
          parentDom,
          mountComponent(nextVNode, null, lifecycle, context, isClass),
          lastVNode,
          lifecycle,
          isRecycling
        );
      }
    } else if (nextFlags & VNodeFlags.NativeElement) {
      if (lastFlags & VNodeFlags.NativeElement) {
        patchElement(
          lastVNode,
          nextVNode,
          parentDom,
          lifecycle,
          context,
          isRecycling
        );
      } else {
        replaceVNode(
          parentDom,
          mountElement(nextVNode, null, lifecycle, context),
          lastVNode,
          lifecycle,
          isRecycling
        );
      }
    } else if (nextFlags & VNodeFlags.Text) {
      if (lastFlags & VNodeFlags.Text) {
        patchText(lastVNode, nextVNode);
      } else {
        replaceVNode(
          parentDom,
          mountText(nextVNode, null),
          lastVNode,
          lifecycle,
          isRecycling
        );
      }
    } else if (nextFlags & VNodeFlags.Void) {
      if (lastFlags & VNodeFlags.Void) {
        patchVoid(lastVNode, nextVNode);
      } else {
        replaceVNode(
          parentDom,
          mountVoid(nextVNode, null),
          lastVNode,
          lifecycle,
          isRecycling
        );
      }
    } else {
      // Error case: mount new one replacing old one
      replaceLastChildAndUnmount(
        lastVNode,
        nextVNode,
        parentDom,
        lifecycle,
        context,
        isRecycling
      );
    }
  }
}

function unmountChildren(
  children,
  dom: NativeElement,
  lifecycle: LifecycleClass,
  isRecycling: boolean
) {
  if (isVNode(children)) {
    unmount(children, dom, lifecycle, true, isRecycling);
  } else if (isArray(children)) {
    removeAllChildren(dom, children, lifecycle, isRecycling);
  } else {
    setTextContentNull(dom);
  }
}

export function patchElement(
  lastVNode: VNode,
  nextVNode: VNode,
  parentDom: NativeElement | null,
  lifecycle: LifecycleClass,
  context: Object,
  isRecycling: boolean
) {
  const nextTag = nextVNode.type;
  const lastTag = lastVNode.type;

  if (lastTag !== nextTag) {
    replaceWithNewNode(
      lastVNode,
      nextVNode,
      parentDom,
      lifecycle,
      context,
      isRecycling
    );
  } else {
    const dom = lastVNode.dom as NativeElement;
    const lastProps = lastVNode.props;
    const nextProps = nextVNode.props;
    const lastChildren = lastVNode.children;
    const nextChildren = nextVNode.children;
    const lastFlags = lastVNode.flags;
    const nextFlags = nextVNode.flags;
    const nextRef = nextVNode.ref;
    const cmds = nextVNode.cmds;
    const lastClassName = lastVNode.className;
    const nextClassName = nextVNode.className;

    nextVNode.dom = dom;
    if (lastChildren !== nextChildren) {
      patchChildren(
        lastFlags,
        nextFlags,
        lastChildren,
        nextChildren,
        dom,
        lifecycle,
        context,
        isRecycling
      );
    }

    // inlined patchProps  -- starts --
    if (lastProps !== nextProps) {
      const lastPropsOrEmpty = lastProps || EMPTY_OBJ;
      const nextPropsOrEmpty = nextProps || (EMPTY_OBJ as any);

      if (nextPropsOrEmpty !== EMPTY_OBJ) {

        for (const prop in nextPropsOrEmpty) {
          // do not add a hasOwnProperty check here, it affects performance
          const nextValue = nextPropsOrEmpty[prop];
          const lastValue = lastPropsOrEmpty[prop];
          patchProp(prop, lastValue, nextValue, dom);
        }
      }
      if (lastPropsOrEmpty !== EMPTY_OBJ) {
        for (const prop in lastPropsOrEmpty) {
          // do not add a hasOwnProperty check here, it affects performance
          if (
            isNullOrUndef(nextPropsOrEmpty[prop]) &&
            !isNullOrUndef(lastPropsOrEmpty[prop])
          ) {
            removeProp(prop, lastPropsOrEmpty[prop], dom, nextFlags);
          }
        }
      }
    }
    // inlined patchProps  -- ends --
    if (lastClassName !== nextClassName) {
      if (isNullOrUndef(nextClassName)) {
        removeClassName(dom)
      } else {
        setClassName(dom, nextClassName)
      }
    }
    if (nextRef) {
      if (lastVNode.ref !== nextRef || isRecycling) {
        mountRef(dom as NativeElement, nextRef, lifecycle);
      }
    }
    do {
      let aCmds = lastVNode.cmds || {}
      let bCmds = cmds || {}
      if (lastVNode.cmds === cmds) {
        break;
      }

      for (let aKey in aCmds) {
        if (!(aKey in bCmds)) {
          let cmdValue = aCmds[aKey];
          let cmdTmp = getCommand(aKey);
          if (cmdTmp && cmdTmp.unbind) {
            cmdTmp.unbind(dom, cmdValue);
          }
        }
        let aValue = aCmds[aKey];
        let bValue = bCmds[aKey];

        if (aValue === bValue) {
          continue;
        } else {
          let cmdTmp = getCommand(aKey);
          if (cmdTmp && cmdTmp.update) {
            cmdTmp.update(dom, bValue, aValue);
          }
        }
      }

      for (let bKey in bCmds) {
        if (!(bKey in aCmds)) {
          let cmdTmp = getCommand(bKey);
          if (cmdTmp && cmdTmp.bind) {
            cmdTmp.bind(dom, bCmds[bKey]);
          }
        }
      }
    } while (0);

  }
}

function patchChildren(
  lastFlags: VNodeFlags,
  nextFlags: VNodeFlags,
  lastChildren,
  nextChildren,
  dom: NativeElement,
  lifecycle: LifecycleClass,
  context: Object,
  isRecycling: boolean
) {
  let patchArray = false;
  let patchKeyed = false;

  if (nextFlags & VNodeFlags.HasNonKeyedChildren) {
    patchArray = true;
  } else if (
    (lastFlags & VNodeFlags.HasKeyedChildren) > 0 &&
    (nextFlags & VNodeFlags.HasKeyedChildren) > 0
  ) {
    patchKeyed = true;
    patchArray = true;
  } else if (isInvalid(nextChildren)) {
    unmountChildren(lastChildren, dom, lifecycle, isRecycling);
  } else if (isInvalid(lastChildren)) {
    if (isStringOrNumber(nextChildren)) {
      setTextContent(dom, nextChildren);
    } else {
      if (isArray(nextChildren)) {
        mountArrayChildren(nextChildren, dom, lifecycle, context);
      } else {
        mount(nextChildren, dom, lifecycle, context);
      }
    }
  } else if (isStringOrNumber(nextChildren)) {
    if (isStringOrNumber(lastChildren)) {
      updateTextContent(dom, nextChildren);
    } else {
      unmountChildren(lastChildren, dom, lifecycle, isRecycling);
      setTextContent(dom, nextChildren);
    }
  } else if (isArray(nextChildren)) {
    if (isArray(lastChildren)) {
      patchArray = true;
      if (isKeyed(lastChildren, nextChildren)) {
        patchKeyed = true;
      }
    } else {
      unmountChildren(lastChildren, dom, lifecycle, isRecycling);
      mountArrayChildren(nextChildren, dom, lifecycle, context);
    }
  } else if (isArray(lastChildren)) {
    removeAllChildren(dom, lastChildren, lifecycle, isRecycling);
    mount(nextChildren, dom, lifecycle, context);
  } else if (isVNode(nextChildren)) {
    if (isVNode(lastChildren)) {
      patch(
        lastChildren,
        nextChildren,
        dom,
        lifecycle,
        context,
        isRecycling
      );
    } else {
      unmountChildren(lastChildren, dom, lifecycle, isRecycling);
      mount(nextChildren, dom, lifecycle, context);
    }
  }
  if (patchArray) {
    const lastLength = lastChildren.length;
    const nextLength = nextChildren.length;

    // Fast path's for both algorithms
    if (lastLength === 0) {
      if (nextLength > 0) {
        mountArrayChildren(nextChildren, dom, lifecycle, context);
      }
    } else if (nextLength === 0) {
      removeAllChildren(dom, lastChildren, lifecycle, isRecycling);
    } else if (patchKeyed) {
      patchKeyedChildren(
        lastChildren,
        nextChildren,
        dom,
        lifecycle,
        context,
        isRecycling,
        lastLength,
        nextLength
      );
    } else {
      patchNonKeyedChildren(
        lastChildren,
        nextChildren,
        dom,
        lifecycle,
        context,
        isRecycling,
        lastLength,
        nextLength
      );
    }
  }
}

export function patchComponent(
  lastVNode,
  nextVNode,
  parentDom,
  lifecycle: LifecycleClass,
  context,
  isClass: boolean,
  isRecycling: boolean
) {
  const lastType = lastVNode.type;
  const nextType = nextVNode.type;
  const lastKey = lastVNode.key;
  const nextKey = nextVNode.key;

  if (lastType !== nextType || lastKey !== nextKey) {
    replaceWithNewNode(
      lastVNode,
      nextVNode,
      parentDom,
      lifecycle,
      context,
      isRecycling
    );
    return false;
  } else {
    const nextProps = nextVNode.props || EMPTY_OBJ;

    if (isClass) {
      const instance = lastVNode.children;
      instance._updating = true;

      if (instance._unmounted) {
        if (isNull(parentDom)) {
          return true;
        }
        replaceChild(
          parentDom,
          mountComponent(
            nextVNode,
            null,
            lifecycle,
            context,
            (nextVNode.flags & VNodeFlags.ComponentClass) > 0
          ),
          lastVNode.dom
        );
      } else {
        const hasComponentDidUpdate = !isUndefined(instance.componentDidUpdate);
        const nextState = instance.state;
        // When component has componentDidUpdate hook, we need to clone lastState or will be modified by reference during update
        const lastState = hasComponentDidUpdate
          ? combineFrom(nextState, null)
          : nextState;
        const lastProps = instance.props;
        nextVNode.children = instance;
        const lastInput = instance._lastInput;
        let nextInput = instance._updateComponent(
          lastState,
          nextState,
          lastProps,
          nextProps,
          context,
          false,
          false
        );
        // If this component was destroyed by its parent do nothing, this is no-op
        // It can happen by using external callback etc during render / update
        if (instance._unmounted) {
          return false;
        }
        let didUpdate = true;
        // Update component before getting child context
        let childContext;
        if (!isNullOrUndef(instance.getChildContext)) {
          childContext = instance.getChildContext();
        }
        if (isNullOrUndef(childContext)) {
          childContext = context;
        } else {
          childContext = combineFrom(context, childContext);
        }

        instance._childContext = childContext;
        if (isInvalid(nextInput)) {
          nextInput = createVoidVNode();
        } else if (nextInput === NO_OP) {
          nextInput = lastInput;
          didUpdate = false;
        } else if (isStringOrNumber(nextInput)) {
          nextInput = createTextVNode(nextInput, null);
        } else if (isArray(nextInput)) {
          if (process.env.NODE_ENV !== "production") {
            throwError(
              "a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object."
            );
          }
          throwError();
        } else if (isObject(nextInput)) {
          if (!isNull((nextInput as VNode).dom)) {
            nextInput = directClone(nextInput as VNode);
          }
        }
        if (nextInput.flags & VNodeFlags.Component) {
          nextInput.parentVNode = nextVNode;
        } else if (lastInput.flags & VNodeFlags.Component) {
          lastInput.parentVNode = nextVNode;
        }
        instance._lastInput = nextInput;
        instance._vNode = nextVNode;
        if (didUpdate) {
          patch(
            lastInput,
            nextInput,
            parentDom,
            lifecycle,
            childContext,
            isRecycling
          );
          if (hasComponentDidUpdate && instance.componentDidUpdate) {
            instance.componentDidUpdate(lastProps, lastState);
          }
          if (!isNull(options.afterUpdate)) {
            options.afterUpdate(nextVNode);
          }
          if (options.findDOMNodeEnabled) {
            componentToDOMNodeMap.set(instance, nextInput.dom);
          }
        }
        nextVNode.dom = nextInput.dom;
      }
      instance._updating = false;
    } else {
      let shouldUpdate = true;
      const lastProps = lastVNode.props;
      const nextHooks = nextVNode.ref;
      const nextHooksDefined = !isNullOrUndef(nextHooks);
      const lastInput = lastVNode.children;
      let nextInput = lastInput;

      nextVNode.dom = lastVNode.dom;
      nextVNode.children = lastInput;
      if (lastKey !== nextKey) {
        shouldUpdate = true;
      } else {
        if (
          nextHooksDefined &&
          !isNullOrUndef(nextHooks.onComponentShouldUpdate)
        ) {
          shouldUpdate = nextHooks.onComponentShouldUpdate(
            lastProps,
            nextProps
          );
        }
      }
      if (shouldUpdate !== false) {
        if (
          nextHooksDefined &&
          !isNullOrUndef(nextHooks.onComponentWillUpdate)
        ) {
          nextHooks.onComponentWillUpdate(lastProps, nextProps);
        }
        nextInput = nextType(nextProps, context);

        if (isInvalid(nextInput)) {
          nextInput = createVoidVNode();
        } else if (isStringOrNumber(nextInput) && nextInput !== NO_OP) {
          nextInput = createTextVNode(nextInput, null);
        } else if (isArray(nextInput)) {
          if (process.env.NODE_ENV !== "production") {
            throwError(
              "a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object."
            );
          }
          throwError();
        } else if (isObject(nextInput)) {
          if (!isNull((nextInput as VNode).dom)) {
            nextInput = directClone(nextInput as VNode);
          }
        }
        if (nextInput !== NO_OP) {
          patch(
            lastInput,
            nextInput,
            parentDom,
            lifecycle,
            context,
            isRecycling
          );
          nextVNode.children = nextInput;
          if (
            nextHooksDefined &&
            !isNullOrUndef(nextHooks.onComponentDidUpdate)
          ) {
            nextHooks.onComponentDidUpdate(lastProps, nextProps);
          }
          nextVNode.dom = nextInput.dom;
        }
      }
      if (nextInput.flags & VNodeFlags.Component) {
        nextInput.parentVNode = nextVNode;
      } else if (lastInput.flags & VNodeFlags.Component) {
        lastInput.parentVNode = nextVNode;
      }
    }
  }
  return false;
}

export function patchText(lastVNode: VNode, nextVNode: VNode) {
  const nextText = nextVNode.children as string;
  const dom = lastVNode.dom as NativeElement;

  nextVNode.dom = dom;

  if (lastVNode.children !== nextText) {
    setNodeValue(dom, nextText)
  }
}

export function patchVoid(lastVNode: VNode, nextVNode: VNode) {
  nextVNode.dom = lastVNode.dom;
}

export function patchNonKeyedChildren(
  lastChildren,
  nextChildren,
  dom,
  lifecycle: LifecycleClass,
  context: Object,
  isRecycling: boolean,
  lastChildrenLength: number,
  nextChildrenLength: number
) {
  const commonLength =
    lastChildrenLength > nextChildrenLength
      ? nextChildrenLength
      : lastChildrenLength;
  let i = 0;

  for (; i < commonLength; i++) {
    let nextChild = nextChildren[i];

    if (nextChild.dom) {
      nextChild = nextChildren[i] = directClone(nextChild);
    }
    patch(
      lastChildren[i],
      nextChild,
      dom,
      lifecycle,
      context,
      isRecycling
    );
  }
  if (lastChildrenLength < nextChildrenLength) {
    for (i = commonLength; i < nextChildrenLength; i++) {
      let nextChild = nextChildren[i];

      if (nextChild.dom) {
        nextChild = nextChildren[i] = directClone(nextChild);
      }
      appendChild(dom, mount(nextChild, null, lifecycle, context));
    }
  } else if (lastChildrenLength > nextChildrenLength) {
    for (i = commonLength; i < lastChildrenLength; i++) {
      unmount(lastChildren[i], dom, lifecycle, false, isRecycling);
    }
  }
}

export function patchKeyedChildren(
  a: VNode[],
  b: VNode[],
  dom,
  lifecycle: LifecycleClass,
  context,
  isRecycling: boolean,
  aLength: number,
  bLength: number
) {
  let aEnd = aLength - 1;
  let bEnd = bLength - 1;
  let aStart = 0;
  let bStart = 0;
  let i;
  let j;
  let aNode;
  let bNode;
  let nextNode;
  let nextPos;
  let node;
  let aStartNode = a[aStart];
  let bStartNode = b[bStart];
  let aEndNode = a[aEnd];
  let bEndNode = b[bEnd];

  if (bStartNode.dom) {
    b[bStart] = bStartNode = directClone(bStartNode);
  }
  if (bEndNode.dom) {
    b[bEnd] = bEndNode = directClone(bEndNode);
  }
  // Step 1
  // tslint:disable-next-line
  outer: {
    // Sync nodes with the same key at the beginning.
    while (aStartNode.key === bStartNode.key) {
      patch(
        aStartNode,
        bStartNode,
        dom,
        lifecycle,
        context,
        isRecycling
      );
      aStart++;
      bStart++;
      if (aStart > aEnd || bStart > bEnd) {
        break outer;
      }
      aStartNode = a[aStart];
      bStartNode = b[bStart];
      if (bStartNode.dom) {
        b[bStart] = bStartNode = directClone(bStartNode);
      }
    }

    // Sync nodes with the same key at the end.
    while (aEndNode.key === bEndNode.key) {
      patch(aEndNode, bEndNode, dom, lifecycle, context, isRecycling);
      aEnd--;
      bEnd--;
      if (aStart > aEnd || bStart > bEnd) {
        break outer;
      }
      aEndNode = a[aEnd];
      bEndNode = b[bEnd];
      if (bEndNode.dom) {
        b[bEnd] = bEndNode = directClone(bEndNode);
      }
    }
  }

  if (aStart > aEnd) {
    if (bStart <= bEnd) {
      nextPos = bEnd + 1;
      nextNode = nextPos < bLength ? b[nextPos].dom : null;
      while (bStart <= bEnd) {
        node = b[bStart];
        if (node.dom) {
          b[bStart] = node = directClone(node);
        }
        bStart++;
        insertOrAppend(
          dom,
          mount(node, null, lifecycle, context),
          nextNode
        );
      }
    }
  } else if (bStart > bEnd) {
    while (aStart <= aEnd) {
      unmount(a[aStart++], dom, lifecycle, false, isRecycling);
    }
  } else {
    const aLeft = aEnd - aStart + 1;
    const bLeft = bEnd - bStart + 1;
    const sources = new Array(bLeft);

    // Mark all nodes as inserted.
    for (i = 0; i < bLeft; i++) {
      sources[i] = -1;
    }
    let moved = false;
    let pos = 0;
    let patched = 0;

    // When sizes are small, just loop them through
    if (bLeft <= 4 || aLeft * bLeft <= 16) {
      for (i = aStart; i <= aEnd; i++) {
        aNode = a[i];
        if (patched < bLeft) {
          for (j = bStart; j <= bEnd; j++) {
            bNode = b[j];
            if (aNode.key === bNode.key) {
              sources[j - bStart] = i;

              if (pos > j) {
                moved = true;
              } else {
                pos = j;
              }
              if (bNode.dom) {
                b[j] = bNode = directClone(bNode);
              }
              patch(aNode, bNode, dom, lifecycle, context, isRecycling);
              patched++;
              a[i] = null as any;
              break;
            }
          }
        }
      }
    } else {
      const keyIndex = new Map();

      // Map keys by their index in array
      for (i = bStart; i <= bEnd; i++) {
        keyIndex.set(b[i].key, i);
      }

      // Try to patch same keys
      for (i = aStart; i <= aEnd; i++) {
        aNode = a[i];

        if (patched < bLeft) {
          j = keyIndex.get(aNode.key);

          if (!isUndefined(j)) {
            bNode = b[j];
            sources[j - bStart] = i;
            if (pos > j) {
              moved = true;
            } else {
              pos = j;
            }
            if (bNode.dom) {
              b[j] = bNode = directClone(bNode);
            }
            patch(aNode, bNode, dom, lifecycle, context, isRecycling);
            patched++;
            a[i] = null as any;
          }
        }
      }
    }
    // fast-path: if nothing patched remove all old and add all new
    if (aLeft === aLength && patched === 0) {
      removeAllChildren(dom, a, lifecycle, isRecycling);
      while (bStart < bLeft) {
        node = b[bStart];
        if (node.dom) {
          b[bStart] = node = directClone(node);
        }
        bStart++;
        insertOrAppend(dom, mount(node, null, lifecycle, context), null);
      }
    } else {
      i = aLeft - patched;
      while (i > 0) {
        aNode = a[aStart++];
        if (!isNull(aNode)) {
          unmount(aNode, dom, lifecycle, true, isRecycling);
          i--;
        }
      }
      if (moved) {
        const seq = lis_algorithm(sources);
        j = seq.length - 1;
        for (i = bLeft - 1; i >= 0; i--) {
          if (sources[i] === -1) {
            pos = i + bStart;
            node = b[pos];
            if (node.dom) {
              b[pos] = node = directClone(node);
            }
            nextPos = pos + 1;
            insertOrAppend(
              dom,
              mount(node, null, lifecycle, context),
              nextPos < bLength ? b[nextPos].dom : null
            );
          } else {
            if (j < 0 || i !== seq[j]) {
              pos = i + bStart;
              node = b[pos];
              nextPos = pos + 1;
              insertOrAppend(
                dom,
                node.dom,
                nextPos < bLength ? b[nextPos].dom : null
              );
            } else {
              j--;
            }
          }
        }
      } else if (patched !== bLeft) {
        // when patched count doesn't match b length we need to insert those new ones
        // loop backwards so we can use insertBefore
        for (i = bLeft - 1; i >= 0; i--) {
          if (sources[i] === -1) {
            pos = i + bStart;
            node = b[pos];
            if (node.dom) {
              b[pos] = node = directClone(node);
            }
            nextPos = pos + 1;
            insertOrAppend(
              dom,
              mount(node, null, lifecycle, context),
              nextPos < bLength ? b[nextPos].dom : null
            );
          }
        }
      }
    }
  }
}

// // https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function lis_algorithm(arr: number[]): number[] {
  const p = arr.slice(0);
  const result: number[] = [0];
  let i;
  let j;
  let u;
  let v;
  let c;
  const len = arr.length;

  for (i = 0; i < len; i++) {
    const arrI = arr[i];

    if (arrI !== -1) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }

      u = 0;
      v = result.length - 1;

      while (u < v) {
        c = ((u + v) / 2) | 0;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }

      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }

  u = result.length;
  v = result[u - 1];

  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }

  return result;
}

export function isAttrAnEvent(attr: string): boolean {
  return attr[0] === "o" && attr[1] === "n";
}

export function patchProp(
  prop,
  lastValue,
  nextValue,
  dom: NativeElement
) {
  if (lastValue !== nextValue) {
    if (isAttrAnEvent(prop)) {
      patchEvent(prop, lastValue, nextValue, dom);
    } else if (isNullOrUndef(nextValue)) {
      removeAttr(dom, prop);
    } else if (prop === "style") {
      patchStyle(lastValue, nextValue, dom);
    } else if (prop === "dangerouslySetInnerHTML") {
      const lastHtml = lastValue && lastValue.__html;
      const nextHtml = nextValue && nextValue.__html;
      if (lastHtml !== nextHtml) {
        if (!isNullOrUndef(nextHtml) && !isSameInnerHTML(dom, nextHtml)) {
          setInnerHtml(dom, nextHtml)
        }
      }
    } else {
      setProp(dom, prop, nextValue)
    }
  }
}

export function patchEvent(name: string, lastValue, nextValue, dom) {
  if (lastValue !== nextValue) {
    const nameLowerCase = name.toLowerCase();
    const domEvent = getDomEventByName(dom, nameLowerCase);
    // if the function is wrapped, that means it's been controlled by a wrapper
    if (domEvent && domEvent.wrapped) {
      return;
    }
    if (!isFunction(nextValue) && !isNullOrUndef(nextValue)) {
      const linkEvent = nextValue.event;

      if (linkEvent && isFunction(linkEvent)) {
        setDomEventByName(dom, nameLowerCase, function (e) {
          linkEvent(nextValue.data, e);
        });
      } else {
        if (process.env.NODE_ENV !== "production") {
          throwError(
            `an event on a VNode "${name}". was not a function or a valid linkEvent.`
          );
        }
        throwError();
      }
    } else {
      setDomEventByName(dom, nameLowerCase, nextValue);
    }
  }
}

// We are assuming here that we come from patchProp routine
// -nextAttrValue cannot be null or undefined
function patchStyle(lastAttrValue, nextAttrValue, dom) {
  const domStyle = dom.style;
  let style;
  let value;

  if (isString(nextAttrValue)) {
    domStyle.cssText = nextAttrValue;
    return;
  }

  if (!isNullOrUndef(lastAttrValue) && !isString(lastAttrValue)) {
    for (style in nextAttrValue) {
      // do not add a hasOwnProperty check here, it affects performance
      value = nextAttrValue[style];
      if (value !== lastAttrValue[style]) {
        domStyle[style] =
          !isNumber(value) || isUnitlessNumber.has(style)
            ? value
            : value + "px";
      }
    }

    for (style in lastAttrValue) {
      if (isNullOrUndef(nextAttrValue[style])) {
        domStyle[style] = "";
      }
    }
  } else {
    for (style in nextAttrValue) {
      value = nextAttrValue[style];
      domStyle[style] =
        !isNumber(value) || isUnitlessNumber.has(style) ? value : value + "px";
    }
  }
}

function removeProp(prop: string, lastValue, dom, nextFlags: number) {
  if (prop === "value") {
    // When removing value of select element, it needs to be set to null instead empty string, because empty string is valid value for option which makes that option selected
    // MS IE/Edge don't follow html spec for textArea and input elements and we need to set empty string to value in those cases to avoid "null" and "undefined" texts
    dom.value = nextFlags ? null : "";
  } else if (isAttrAnEvent(prop)) {
    handleEvent(prop, lastValue, null, dom);
  } else {
    removeAttr(dom, prop)
  }
}
