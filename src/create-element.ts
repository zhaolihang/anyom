import { VNode, VNodeType } from "./vnode";
import { applyElementProps, applyRef, applyCommands } from "./apply-properties";
import { createNodeProxy, NodeProxy, NodeProxyType } from "./element";
import { Component } from "./component";

export function createElement(vnode: VNode, context?: Component): NodeProxy {

    let nodeProxy: NodeProxy = new NodeProxy(vnode, context);
    let props = vnode.props;
    if (nodeProxy.proxyType === NodeProxyType.NATIVE) {
        applyElementProps(nodeProxy, props, undefined);
    }
    vnode.ref && applyRef(nodeProxy, vnode.ref, undefined);
    vnode.commands && applyCommands(nodeProxy, vnode.commands, undefined, vnode.commands);

    let children = vnode.children;

    for (let i = 0; i < children.length; i++) {
        let childNode = createElement(children[i], context);
        if (childNode) {
            nodeProxy.appendChild(childNode);
        }
    }

    return nodeProxy;
}

export const render = createElement;