import { VNode } from "./vnode";
import { applyProperties } from "./apply-properties";
import { createRealNodeProxy, RealNodeProxy } from "./element";
import { Component } from "./component";

export function createElement(vnode: VNode, context?: Component): RealNodeProxy {

    if (!vnode) {
        throw new Error('虚拟节点不能为空');
    }

    let node: RealNodeProxy = createRealNodeProxy(vnode, context);
    let props = vnode.properties;
    applyProperties(node, props, undefined);

    let children = vnode.children;

    for (let i = 0; i < children.length; i++) {
        let childNode = createElement(children[i], context);
        if (childNode) {
            node.appendChild(childNode);
        }
    }

    return node;
}

export const render = createElement;