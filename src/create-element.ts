import { VNode, VNodeType } from "./vnode";
import { createNodeProxy, NodeProxy } from "./node-proxy";
import { Component } from "./component";

export function createElement(vnode: VNode): NodeProxy {

    let nodeProxy: NodeProxy = new NodeProxy(vnode);

    let children = vnode.children;
    for (let i = 0; i < children.length; i++) {
        nodeProxy.appendChild(createElement(children[i]));
    }

    return nodeProxy;
}

export const render = createElement;