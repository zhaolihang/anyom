/// is ok
import {
  isArray,
  isFunction,
  isInvalid,
  isNull,
  isNullOrUndef,
  isObject,
  isStringOrNumber,
  isUndefined,
  EMPTY_OBJ,
  LifecycleClass,
  throwError
} from "../../shared";
import VNodeFlags from "../../vnode-flags";
import { options } from "../../core/options";
import { directClone, isVNode, VNode } from "../../core/VNodes";
import { patchProp } from "./patching";
import { componentToDOMNodeMap } from "./rendering";
import {
  appendChild,
  createClassComponentInstance,
  createFunctionalComponentInput,
  documentCreateElement,
  setTextContent
} from "./utils";
import { getCommand } from "../../command";
import { NativeElement, setClassName, createTextNode } from "../index";

export function mount(
  vNode: VNode,
  parentDom: NativeElement | null,
  lifecycle: LifecycleClass,
  context: Object
) {
  const flags = vNode.flags;

  if (flags & VNodeFlags.NativeElement) {
    return mountElement(vNode, parentDom, lifecycle, context);
  } else if (flags & VNodeFlags.Component) {
    return mountComponent(
      vNode,
      parentDom,
      lifecycle,
      context,
      (flags & VNodeFlags.ComponentClass) > 0
    );
  } else if (flags & VNodeFlags.Void) {
    return mountVoid(vNode, parentDom);
  } else if (flags & VNodeFlags.Text) {
    return mountText(vNode, parentDom);
  } else {
    if (process.env.NODE_ENV !== "production") {
      if (typeof vNode === "object") {
        throwError(
          `mount() received an object that's not a valid VNode, you should stringify it first. Object: "${JSON.stringify(
            vNode
          )}".`
        );
      } else {
        throwError(
          `mount() expects a valid VNode, instead it received an object with the type "${typeof vNode}".`
        );
      }
    }
    throwError();
  }
}

export function mountText(vNode: VNode, parentDom: NativeElement | null): any {
  const dom = createTextNode(vNode.children as string)

  vNode.dom = dom as any;
  if (!isNull(parentDom)) {
    appendChild(parentDom, dom);
  }

  return dom;
}

export function mountVoid(vNode: VNode, parentDom: NativeElement | null) {
  const dom = createTextNode('');

  vNode.dom = dom as any;
  if (!isNull(parentDom)) {
    appendChild(parentDom, dom);
  }
  return dom;
}

export function mountElement(
  vNode: VNode,
  parentDom: NativeElement | null,
  lifecycle: LifecycleClass,
  context: Object
) {
  let dom;
  const flags = vNode.flags;

  dom = documentCreateElement(vNode.type);
  const children = vNode.children;
  const props = vNode.props;
  const className = vNode.className;
  const ref = vNode.ref;
  const cmds = vNode.cmds;

  vNode.dom = dom;

  if (!isInvalid(children)) {
    if (isStringOrNumber(children)) {
      setTextContent(dom, children as string | number);
    } else {
      if (isArray(children)) {
        mountArrayChildren(children, dom, lifecycle, context);
      } else if (isVNode(children as any)) {
        mount(children as VNode, dom, lifecycle, context);
      }
    }
  }
  if (!isNull(props)) {
    for (const prop in props) {
      // do not add a hasOwnProperty check here, it affects performance
      patchProp(prop, null, props[prop], dom);
    }
  }

  if (className !== null) {
    setClassName(dom, className)
  }

  if (!isNull(ref)) {
    mountRef(dom, ref, lifecycle);
  }
  if (!isNull(cmds)) {
    mountCmds(dom, cmds, lifecycle);
  }

  if (!isNull(parentDom)) {
    appendChild(parentDom, dom);
  }
  return dom;
}

export function mountArrayChildren(
  children,
  dom: NativeElement,
  lifecycle: LifecycleClass,
  context: Object
) {
  for (let i = 0, len = children.length; i < len; i++) {
    let child = children[i];

    // Verify can string/number be here. might cause de-opt. - Normalization takes care of it.
    if (!isInvalid(child)) {
      if (child.dom) {
        children[i] = child = directClone(child);
      }
      mount(children[i], dom, lifecycle, context);
    }
  }
}

export function mountComponent(
  vNode: VNode,
  parentDom: NativeElement | null,
  lifecycle: LifecycleClass,
  context: Object,
  isClass: boolean
) {
  let dom: NativeElement;

  const type = vNode.type;
  const props = vNode.props || EMPTY_OBJ;
  const ref = vNode.ref;
  const cmds = vNode.cmds;

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
    vNode.dom = dom = mount(
      input,
      null,
      lifecycle,
      instance._childContext
    );
    if (!isNull(parentDom)) {
      appendChild(parentDom, dom);
    }
    mountClassComponentCallbacks(vNode, ref, cmds, dom, instance, lifecycle);
    instance._updating = false;
    if (options.findDOMNodeEnabled) {
      componentToDOMNodeMap.set(instance, dom);
    }
  } else {
    const input = createFunctionalComponentInput(vNode, type, props, context);

    vNode.dom = dom = mount(input, null, lifecycle, context);
    vNode.children = input;
    mountFunctionalComponentCallbacks(props, ref, cmds, dom, lifecycle);
    if (!isNull(parentDom)) {
      appendChild(parentDom, dom);
    }
  }
  return dom;
}

export function mountClassComponentCallbacks(
  vNode: VNode,
  ref,
  cmds,
  dom,
  instance,
  lifecycle: LifecycleClass
) {
  if (ref) {
    if (isFunction(ref)) {
      ref(instance);
    } else {
      if (process.env.NODE_ENV !== "production") {
        if (isStringOrNumber(ref)) {
          throwError(
            'string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.'
          );
        } else if (isObject(ref) && vNode.flags & VNodeFlags.ComponentClass) {
          throwError(
            "functional component lifecycle events are not supported on ES2015 class components."
          );
        } else {
          throwError(
            `a bad value for "ref" was used on component: "${JSON.stringify(
              ref
            )}"`
          );
        }
      }
      throwError();
    }
  }

  if (cmds) {
    for (let cmd in cmds) {
      let cmdValue = cmds[cmd];
      let cmdTmp = getCommand(cmd);
      if (cmdTmp && cmdTmp.bind) {
        cmdTmp.bind(dom, cmdValue);
      }
    }
  }

  const hasDidMount = !isUndefined(instance.componentDidMount);
  const afterMount = options.afterMount;

  if (hasDidMount || !isNull(afterMount)) {
    lifecycle.addListener(() => {
      instance._updating = true;
      if (afterMount) {
        afterMount(vNode);
      }
      if (hasDidMount) {
        instance.componentDidMount();
      }
      instance._updating = false;
    });
  }
}

export function mountFunctionalComponentCallbacks(
  props,
  ref,
  cmds,
  dom,
  lifecycle: LifecycleClass
) {
  if (ref) {
    if (!isNullOrUndef(ref.onComponentWillMount)) {
      ref.onComponentWillMount(props);
    }
    if (!isNullOrUndef(ref.onComponentDidMount)) {
      lifecycle.addListener(() => ref.onComponentDidMount(dom, props));
    }
  }

  if (cmds) {
    for (let cmd in cmds) {
      let cmdValue = cmds[cmd];
      let cmdTmp = getCommand(cmd);
      if (cmdTmp && cmdTmp.bind) {
        cmdTmp.bind(dom, cmdValue);
      }
    }
  }
}

export function mountRef(dom: NativeElement, value, lifecycle: LifecycleClass) {
  if (isFunction(value)) {
    lifecycle.addListener(() => value(dom));
  } else {
    if (isInvalid(value)) {
      return;
    }
    if (process.env.NODE_ENV !== "production") {
      throwError(
        'string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.'
      );
    }
    throwError();
  }
}

export function mountCmds(dom: NativeElement, cmds, lifecycle: LifecycleClass) {
  if (cmds) {
    for (let cmd in cmds) {
      let cmdValue = cmds[cmd];
      let cmdTmp = getCommand(cmd);
      if (cmdTmp && cmdTmp.bind) {
        cmdTmp.bind(dom, cmdValue);
      }
    }
  }
}


