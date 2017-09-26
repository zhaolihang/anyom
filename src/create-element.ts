import { VNode, VNodeType } from "./vnode";
import { createNodeProxy, NodeProxy } from "./node-proxy";
import { Component } from "./component";

export function createElement(vnode: VNode, context?: Component): NodeProxy {

    let nodeProxy: NodeProxy = new NodeProxy(vnode, context);

    let children = vnode.children;
    for (let i = 0; i < children.length; i++) {
        nodeProxy.appendChild(createElement(children[i], context));
    }

    return nodeProxy;
}

export const render = createElement;