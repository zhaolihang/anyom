
import {
  createVNode,
  getFlagsForElementVnode,
} from "../index";
import { InfernoChildren, VNode, Props } from "../core/VNodes";
import Component from "../component";
import {
  isInvalid,
  isNullOrUndef,
  isObject,
  isString,
  isUndefined
} from "../shared";

import VNodeFlags from "../vnode-flags";

const componentHooks = new Set<string>();
componentHooks.add("onComponentWillMount");
componentHooks.add("onComponentDidMount");
componentHooks.add("onComponentWillUnmount");
componentHooks.add("onComponentShouldUpdate");
componentHooks.add("onComponentWillUpdate");
componentHooks.add("onComponentDidUpdate");

/**
 * Creates virtual node
 * @param {string|Function|Component<any, any>} type Type of node
 * @param {object=} props Optional props for virtual node
 * @param {...{object}=} _children Optional children for virtual node
 * @returns {VNode} new virtual ndoe
 */
export default function createElement<T>(
  type: string | Function | Component<any, any>,
  props?: T & Props | null,
  ..._children: Array<InfernoChildren | any>
): VNode {
  if (isInvalid(type) || isObject(type)) {
    throw new Error(
      "Inferno Error: createElement() name parameter cannot be undefined, null, false or true, It must be a string, class or function."
    );
  }

  // 从 props 提取各个参数 给 createVNode函数使用
  let children: any = _children;
  let ref: any = null;
  let cmds: any = null;
  let key = null;
  let className = null;
  let flags = 0;
  let newProps;

  if (_children) {
    if (_children.length === 1) {
      children = _children[0];
    } else if (_children.length === 0) {
      children = void 0;
    }
  }
  if (isString(type)) {
    flags = getFlagsForElementVnode(type as string);

    if (!isNullOrUndef(props)) {
      newProps = {} as T & Props;

      for (const prop in props) {
        if (prop === "className" || prop === "class") {
          className = props[prop];
        } else if (prop === "key") {
          key = props.key;
        } else if (prop === "children" && isUndefined(children)) {
          children = props.children; // always favour children args, default to props

        } else if (prop === "ref") {
          ref = props.ref;
        } else if (prop.substr(0, 4) === "cmd-") {
          if (!cmds) {
            cmds = {}
          }
          let cmdName = prop.substr(4, prop.length - 4)
          cmds[cmdName] = props[prop]
        } else {
          newProps[prop] = props[prop];
        }
      }
    }
  } else {
    flags = VNodeFlags.ComponentUnknown;
    if (!isUndefined(children)) {
      if (!props) {
        props = {} as T;
      }
      props.children = children;
      children = null;
    }

    if (!isNullOrUndef(props)) {
      newProps = {} as T & Props;

      for (const prop in props) {
        if (componentHooks.has(prop)) {
          if (!ref) {
            ref = {};
          }
          ref[prop] = props[prop];
        } else if (prop === "key") {
          key = props.key;
        } else if (prop.substr(0, 4) === "cmd-") {
          if (!cmds) {
            cmds = {}
          }
          let cmdName = prop.substr(4, prop.length - 4)
          cmds[cmdName] = props[prop]
        } else {
          newProps[prop] = props[prop];
        }
      }
    }
  }
  return createVNode(
    flags,
    type as string | Function,
    className,
    children,
    newProps,
    key,
    ref,
    cmds
  );
}
