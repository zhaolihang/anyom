
import {
  combineFrom,
  isArray,
  isInvalid,
  isNull,
  isStatefulComponent,
  isStringOrNumber,
  isUndefined,
  EMPTY_OBJ,
  isString
} from "../shared";
import VNodeFlags from "../vnode-flags";
import { normalize } from "./normalization";
import { options } from "./options";
import { NativeElement } from "../native";
export type InfernoInput = VNode | null | string | number;
export type Ref = (node?: NativeElement | null) => void;
export type Cmd = any;
export type Cmds = { [x: string]: Cmd };

export type InfernoChildren =
  | string
  | number
  | boolean
  | undefined
  | VNode
  | Array<string | number | VNode>
  | null;

export type Type = string | null | Function;

export interface Props {
  children?: InfernoChildren;
  ref?: Ref | null;
  key?: any;
  className?: string;
  [k: string]: any;
}

export interface Refs {
  onComponentDidMount?: (domNode: NativeElement) => void;
  onComponentWillMount?(): void;
  onComponentShouldUpdate?(lastProps, nextProps): boolean;
  onComponentWillUpdate?(lastProps, nextProps): void;
  onComponentDidUpdate?(lastProps, nextProps): void;
  onComponentWillUnmount?(domNode: NativeElement): void;
}

export interface VNode {
  children: InfernoChildren;
  dom: NativeElement | null;
  flags: number;
  key: any;
  props: Props | null;
  ref: Ref | null;
  cmds?: Cmds | null;
  type: Type;
  parentVNode?: VNode;
}

export function getFlagsByString(type: string): number {
  return VNodeFlags.NativeElement;
}

export function getFlagsType(type: Type): number {
  if (isString(type)) {
    return getFlagsByString(type);
  } else {
    return isStatefulComponent(type)
      ? VNodeFlags.ComponentClass
      : VNodeFlags.ComponentFunction;
  }
}



/**
 * Creates virtual node
 * @param {number} flags
 * @param {string|Function|null} type
 * @param {string|null=} className
 * @param {object=} children
 * @param {object=} props
 * @param {*=} key
 * @param {object|Function=} ref
 * @param {boolean=} noNormalise
 * @returns {VNode} returns new virtual node
 */
export function createVNode(
  flags: number,
  type: Type,
  children?: InfernoChildren,
  props?: Props | null,
  key?: any,
  ref?: Ref | null,
  cmds?: Cmds | null,
  noNormalise?: boolean
): VNode {

  flags = getFlagsType(type)

  const vNode: VNode = {
    children: children === void 0 ? null : children,
    dom: null,
    flags,
    key: key === void 0 ? null : key,
    props: props === void 0 ? null : props,
    ref: ref === void 0 ? null : ref,
    cmds: cmds === void 0 ? null : cmds,
    type
  };
  if (noNormalise !== true) {
    normalize(vNode);
  }
  if (options.createVNode !== null) {
    options.createVNode(vNode);
  }

  return vNode;
}

export function directClone(vNodeToClone: VNode): VNode {
  let newVNode;
  const flags = vNodeToClone.flags;

  if (flags & VNodeFlags.Component) {
    let props;
    const propsToClone = vNodeToClone.props;

    if (isNull(propsToClone)) {
      props = EMPTY_OBJ;
    } else {
      props = {};
      for (const key in propsToClone) {
        props[key] = propsToClone[key];
      }
    }
    newVNode = createVNode(
      flags,
      vNodeToClone.type,
      null,
      props,
      vNodeToClone.key,
      vNodeToClone.ref,
      vNodeToClone.cmds,
      true
    );
    const newProps = newVNode.props;

    const newChildren = newProps.children;
    // we need to also clone component children that are in props
    // as the children may also have been hoisted
    if (newChildren) {
      if (isArray(newChildren)) {
        const len = newChildren.length;
        if (len > 0) {
          const tmpArray: InfernoChildren = [];

          for (let i = 0; i < len; i++) {
            const child = newChildren[i];

            if (isStringOrNumber(child)) {
              tmpArray.push(child);
            } else if (!isInvalid(child) && isVNode(child)) {
              tmpArray.push(directClone(child));
            }
          }
          newProps.children = tmpArray;
        }
      } else if (isVNode(newChildren)) {
        newProps.children = directClone(newChildren);
      }
    }

    newVNode.children = null;
  } else if (flags & VNodeFlags.NativeElement) {
    const children = vNodeToClone.children;
    let props;
    const propsToClone = vNodeToClone.props;

    if (propsToClone === null) {
      props = EMPTY_OBJ;
    } else {
      props = {};
      for (const key in propsToClone) {
        props[key] = propsToClone[key];
      }
    }
    newVNode = createVNode(
      flags,
      vNodeToClone.type,
      children,
      props,
      vNodeToClone.key,
      vNodeToClone.ref,
      vNodeToClone.cmds,
      !children
    );
  } else if (flags & VNodeFlags.Text) {
    newVNode = createTextVNode(
      vNodeToClone.children as string,
      vNodeToClone.key
    );
  }

  return newVNode;
}

/*
 directClone is preferred over cloneVNode and used internally also.
 This function makes Inferno backwards compatible.
 And can be tree-shaked by modern bundlers
 
 Would be nice to combine this with directClone but could not do it without breaking change
 */

/**
 * Clones given virtual node by creating new instance of it
 * @param {VNode} vNodeToClone virtual node to be cloned
 * @param {Props=} props additional props for new virtual node
 * @param {...*} _children new children for new virtual node
 * @returns {VNode} new virtual node
 */
export function cloneVNode(
  vNodeToClone: VNode,
  props?: Props,
  ..._children: InfernoChildren[]
): VNode {
  let children: any = _children;
  const childrenLen = _children.length;

  if (childrenLen > 0 && !isUndefined(_children[0])) {
    if (!props) {
      props = {};
    }
    if (childrenLen === 1) {
      children = _children[0];
    }

    if (!isUndefined(children)) {
      props.children = children as VNode;
    }
  }

  let newVNode;

  if (isArray(vNodeToClone)) {
    const tmpArray: InfernoChildren = [];
    for (let i = 0, len = (vNodeToClone as any).length; i < len; i++) {
      tmpArray.push(directClone(vNodeToClone[i]));
    }

    newVNode = tmpArray;
  } else {
    const flags = vNodeToClone.flags;
    let key = vNodeToClone.key;
    let ref = vNodeToClone.ref;
    let cmds = vNodeToClone.cmds;
    if (props) {
      if (props.hasOwnProperty("ref")) {
        ref = props.ref as Ref;
      }
      if (props.hasOwnProperty("key")) {
        key = props.key;
      }
      if (props.hasOwnProperty("key")) {
        cmds = props.cmds;
      }
    }

    if (flags & VNodeFlags.Component) {
      newVNode = createVNode(
        flags,
        vNodeToClone.type,
        null,
        !vNodeToClone.props && !props
          ? EMPTY_OBJ
          : combineFrom(vNodeToClone.props, props),
        key,
        ref,
        cmds,
        true
      );
      const newProps = newVNode.props;

      if (newProps) {
        const newChildren = newProps.children;
        // we need to also clone component children that are in props
        // as the children may also have been hoisted
        if (newChildren) {
          if (isArray(newChildren)) {
            const len = newChildren.length;
            if (len > 0) {
              const tmpArray: InfernoChildren = [];

              for (let i = 0; i < len; i++) {
                const child = newChildren[i];

                if (isStringOrNumber(child)) {
                  tmpArray.push(child);
                } else if (!isInvalid(child) && isVNode(child)) {
                  tmpArray.push(directClone(child));
                }
              }
              newProps.children = tmpArray;
            }
          } else if (isVNode(newChildren)) {
            newProps.children = directClone(newChildren);
          }
        }
      }
      newVNode.children = null;
    } else if (flags & VNodeFlags.NativeElement) {
      children =
        props && !isUndefined(props.children)
          ? props.children
          : vNodeToClone.children;
      newVNode = createVNode(
        flags,
        vNodeToClone.type,
        children,
        !vNodeToClone.props && !props
          ? EMPTY_OBJ
          : combineFrom(vNodeToClone.props, props),
        key,
        ref,
        cmds,
        false
      );
    } else if (flags & VNodeFlags.Text) {
      newVNode = createTextVNode(vNodeToClone.children as string, key);
    }
  }
  return newVNode;
}

export function createVoidVNode(): VNode {
  return createVNode(VNodeFlags.Void, null);
}

export function createTextVNode(text: string | number, key): VNode {
  return createVNode(VNodeFlags.Text, null, text, null, key);
}

export function isVNode(o: VNode): boolean {
  return !!o.flags;
}
