// is ok
import {
  isArray,
  isInvalid,
  isNull,
  isNullOrUndef,
  isObject,
  isStringOrNumber,
  LifecycleClass,
  throwError,
  EMPTY_OBJ,
  warning
} from "../../shared";
import VNodeFlags from "../../vnode-flags";
import { options } from "../../core/options";
import { InfernoChildren, VNode } from "../../core/VNodes";
import { svgNS } from "./constants";
import {
  mount,
  mountClassComponentCallbacks,
  mountElement,
  mountFunctionalComponentCallbacks,
  mountRef,
  mountText,
  mountCmds
} from "./mounting";
import { patchProp } from "./patching";
import { componentToDOMNodeMap } from "./rendering";
import {
  createClassComponentInstance,
  createFunctionalComponentInput,

  isSamePropsInnerHTML,
  replaceChild,
  appendChild
} from "./utils";
import { NativeElement, getFirstChild, getNextSibling, removeDomChild, getTagName, getParentNode, setTextContentNull, setClassName, removeClassName, isTextNode, getTextByTextNode, setTextByTextNode, setTextContent, createTextNode, getNodeValue, setNodeValue } from "../index";

function normalizeChildNodes(parentDom) {
  let dom = parentDom.firstChild;

  while (dom) {
    if (dom.nodeType === 8) {
      if (dom.data === "!") {
        const placeholder = document.createTextNode("");

        parentDom.replaceChild(placeholder, dom);
        dom = dom.nextSibling;
      } else {
        const lastDom = dom.previousSibling;

        parentDom.removeChild(dom);
        dom = lastDom || parentDom.firstChild;
      }
    } else {
      dom = dom.nextSibling;
    }
  }
}

function hydrateComponent(
  vNode: VNode,
  dom: NativeElement,
  lifecycle: LifecycleClass,
  context,
  isClass: boolean
): NativeElement {
  const type = vNode.type;
  const ref = vNode.ref;
  const cmds = vNode.cmds;
  const props = vNode.props || EMPTY_OBJ;

  if (isClass) {
    const instance = createClassComponentInstance(
      vNode,
      type,
      props,
      context,
      lifecycle
    );
    const input = instance._lastInput;

    instance._vNode = vNode;
    hydrate(input, dom, lifecycle, instance._childContext);
    vNode.dom = input.dom;
    mountClassComponentCallbacks(vNode, ref, cmds, dom, instance, lifecycle);
    instance._updating = false; // Mount finished allow going sync
    if (options.findDOMNodeEnabled) {
      componentToDOMNodeMap.set(instance, dom);
    }
  } else {
    const input = createFunctionalComponentInput(vNode, type, props, context);
    hydrate(input, dom, lifecycle, context);
    vNode.children = input;
    vNode.dom = input.dom;
    mountFunctionalComponentCallbacks(props, ref, cmds, dom, lifecycle);
  }
  return dom;
}

function hydrateElement(
  vNode: VNode,
  dom: NativeElement,
  lifecycle: LifecycleClass,
  context: Object
): NativeElement {
  const children = vNode.children;
  const props = vNode.props;
  const flags = vNode.flags;
  const ref = vNode.ref;
  const cmds = vNode.cmds;

  if (getTagName(dom) !== vNode.type) {
    if (process.env.NODE_ENV !== "production") {
      warning(
        "Inferno hydration: Server-side markup doesn't match client-side markup or Initial render target is not empty"
      );
    }
    const newDom = mountElement(vNode, null, lifecycle, context);

    vNode.dom = newDom;
    replaceChild(getParentNode(dom), newDom, dom);
    return newDom as NativeElement;
  }
  vNode.dom = dom;
  if (!isInvalid(children)) {
    hydrateChildren(children, dom, lifecycle, context);
  } else if (getFirstChild(dom) !== null && !isSamePropsInnerHTML(dom, props)) {
    // dom has content, but VNode has no children remove everything from DOM
    setTextContentNull(dom)
  }
  if (props) {
    for (const prop in props) {
      // do not add a hasOwnProperty check here, it affects performance
      patchProp(prop, null, props[prop], dom);
    }
  }
  if (ref) {
    mountRef(dom, ref, lifecycle);
    cmds
  }
  if (cmds) {
    mountCmds(dom, cmds, lifecycle);
  }
  return dom;
}

function hydrateChildren(
  children: InfernoChildren,
  parentDom: NativeElement,
  lifecycle: LifecycleClass,
  context: Object
): void {
  normalizeChildNodes(parentDom);
  let dom = getFirstChild(parentDom);

  if (isStringOrNumber(children)) {
    if (!isNull(dom) && isTextNode(dom)) {
      if (getTextByTextNode(dom) !== children) {
        setTextByTextNode(dom, children as string);
      }
    } else if (children === "") {
      appendChild(parentDom, createTextNode(''));
    } else {
      setTextContent(parentDom, children as string);
    }
    if (!isNull(dom)) {
      dom = getNextSibling(dom);
    }
  } else if (isArray(children)) {
    for (
      let i = 0, len = (children as Array<string | number | VNode>).length;
      i < len;
      i++
    ) {
      const child = children[i];

      if (!isNull(child) && isObject(child)) {
        if (!isNull(dom)) {
          const nextSibling = getNextSibling(dom);
          hydrate(child as VNode, dom as NativeElement, lifecycle, context);
          dom = nextSibling;
        } else {
          mount(child as VNode, parentDom, lifecycle, context);
        }
      }
    }
  } else {
    // It's VNode
    if (!isNull(dom)) {
      hydrate(children as VNode, dom as NativeElement, lifecycle, context);
      dom = getNextSibling(dom);
    } else {
      mount(children as VNode, parentDom, lifecycle, context);
    }
  }

  // clear any other DOM nodes, there should be only a single entry for the root
  while (dom) {
    const nextSibling = getNextSibling(dom);
    removeDomChild(parentDom, dom);
    dom = nextSibling;
  }
}

function hydrateText(vNode: VNode, dom: NativeElement): NativeElement {
  if (!isTextNode(dom)) {
    const newDom = mountText(vNode, null);

    vNode.dom = newDom;
    replaceChild(getParentNode(dom), newDom, dom);
    return newDom;
  }
  const text = vNode.children;

  if (getNodeValue(dom) !== text) {
    setNodeValue(dom, text as string);
  }
  vNode.dom = dom;
  return dom;
}

function hydrateVoid(vNode: VNode, dom: NativeElement): NativeElement {
  vNode.dom = dom;
  return dom;
}

function hydrate(
  vNode: VNode,
  dom: NativeElement,
  lifecycle: LifecycleClass,
  context: Object
) {
  const flags = vNode.flags;

  if (flags & VNodeFlags.Component) {
    hydrateComponent(
      vNode,
      dom,
      lifecycle,
      context,
      (flags & VNodeFlags.ComponentClass) > 0
    );
  } else if (flags & VNodeFlags.NativeElement) {
    hydrateElement(vNode, dom, lifecycle, context);
  } else if (flags & VNodeFlags.Text) {
    hydrateText(vNode, dom);
  } else if (flags & VNodeFlags.Void) {
    hydrateVoid(vNode, dom);
  } else {
    if (process.env.NODE_ENV !== "production") {
      throwError(
        `hydrate() expects a valid VNode, instead it received an object with the type "${typeof vNode}".`
      );
    }
    throwError();
  }
}

export function hydrateRoot(
  input,
  parentDom: NativeElement | null,
  lifecycle: LifecycleClass
) {
  if (!isNull(parentDom)) {
    let dom = getFirstChild(parentDom) as NativeElement;

    if (!isNull(dom)) {
      hydrate(input, dom, lifecycle, EMPTY_OBJ);
      dom = getFirstChild(parentDom) as NativeElement;
      // clear any other DOM nodes, there should be only a single entry for the root
      while ((dom = getNextSibling(dom) as NativeElement)) {
        removeDomChild(parentDom, dom)
      }
      return true;
    }
  }

  return false;
}
