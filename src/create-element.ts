import { VNode } from "./vnode";
import { applyProperties } from "./apply-properties";
import { createRNodeByVNode, IRNode } from "./element";

export function createElement(vnode: VNode): IRNode {
    if (!vnode) {
        throw new Error('虚拟节点不能为空');
    }
    let node: IRNode = createRNodeByVNode(vnode);
    let props = vnode.properties
    applyProperties(node, props);

    let children = vnode.children

    for (let i = 0; i < children.length; i++) {
        let childNode = createElement(children[i])
        if (childNode) {
            node.appendChild(childNode)
        }
    }

    return node;
}

export const render = createElement;