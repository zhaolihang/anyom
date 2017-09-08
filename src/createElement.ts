
import { VNode } from "./vnode";
import { applyProperties } from "./applyProperties";

export function createElement(vnode: VNode) {
    if (!vnode) {
        throw new Error('虚拟节点不能为空');
    }
    let node = vnode.vRender();
    let props = vnode.properties
    applyProperties(node, props);

    let children = vnode.children

    for (let i = 0; i < children.length; i++) {
        let childNode = createElement(children[i])
        if (childNode) {
            node.appendChild(childNode)
        }
    }

    return node
}
