import { VNode, VNodeType, Instance } from "./vnode";
import { createNodeProxy, NodeProxy } from "./node-proxy";
import { Component } from "./component";

export function render(vnode: VNode): NodeProxy {

    let nodeProxy: NodeProxy = new NodeProxy(vnode);
    createInstanceByVNode(vnode);
    let children = vnode.children;
    for (let i = 0; i < children.length; i++) {
        nodeProxy.appendChild(render(children[i]));
    }

    return nodeProxy;
}


// 生命周期
function createInstanceByVNode(vnode: VNode): Instance {
    vnode.instance
    return null;
}

