import { VNode } from "./vnode";
import { applyProperties } from "./apply-properties";
import { createRNodeProxyByVNode, RNodeProxy } from "./element";
import { Component } from "./component";

export function createElement(vnode: VNode, context?: Component): RNodeProxy {

    if (!vnode) {
        throw new Error('虚拟节点不能为空');
    }

    let node: RNodeProxy = createRNodeProxyByVNode(vnode, context);
    let props = vnode.properties;
    applyProperties(node, props, undefined, context);

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