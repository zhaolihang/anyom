import { VNode, VNodeType } from "./vnode";
import { applyElementProps, applyRef, applyCommands } from "./apply-properties";
import { createRealNodeProxy, RealNodeProxy, RealNodeType } from "./element";
import { Component } from "./component";

export function createElement(vnode: VNode, context?: Component): RealNodeProxy {

    let node: RealNodeProxy = createRealNodeProxy(vnode, context);
    let props = vnode.props;
    if (node.realNodeType === RealNodeType.NATIVE) {
        applyElementProps(node, props, undefined);
    }
    vnode.ref && applyRef(node, vnode.ref, undefined);
    vnode.commands && applyCommands(node, vnode.commands, undefined);

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