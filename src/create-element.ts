import { VNode, VNodeType } from "./vnode";
import { createNodeProxy, NodeProxy, NodeProxyType } from "./node-proxy";
import { Component } from "./component";
import { applyNativeNodeProps, applyRef, applyCommands } from "./patch";

export function createElement(vnode: VNode, context?: Component): NodeProxy {

    let nodeProxy: NodeProxy = new NodeProxy(vnode, context);
    if (nodeProxy.proxyType === NodeProxyType.NATIVE) {
        applyNativeNodeProps(nodeProxy, vnode.props, undefined);
    }
    if (vnode.ref) {
        applyRef(nodeProxy, vnode.ref, undefined);
    }
    if (vnode.commands) {
        applyCommands(nodeProxy, vnode.commands, undefined, vnode.commands);
    }

    let children = vnode.children;
    for (let i = 0; i < children.length; i++) {
        nodeProxy.appendChild(createElement(children[i], context));
    }

    return nodeProxy;
}

export const render = createElement;